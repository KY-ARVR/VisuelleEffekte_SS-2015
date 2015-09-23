// 01.07.2015
// 
// "Programming Vertex, Geometry and Pixel Shaders", page 264-271
// negating in reflection: -> "https://en.wikibooks.org/wiki/GLSL_Programming/GLUT/Specular_Highlights"
// -> "https://code.google.com/p/cdshader/source/browse/trunk/src/GLSL/strauss.frag?spec=svn7&r=7"
// 
// All parameters as uniform variables
// + multiple lights
// + uniform Strauss lighting parameters in own struct StraussLightingParameters
// + kf renamed to fresnelConstant,
//   ks renamed to shadowConstant
// + offSpecularPeak as uniform variable
// + flag "useTransparencyInAlpha" to use transparency parameter as alpha of gl_FragColor.
// 
// VERY INTERESTING (TOON) EFFECT, IF  kf = 0.5.

// Note: Clamping the dot products with max (..., 0.0) avoids the bright
//       areas around the contours, but makes the reflecting lighting
//       inside less intense (=> less shiney objects).


precision highp float;


struct StraussParameters
{
  vec4  surfaceColor;            // c  (cDiffuse      in shader) => RGB
  vec4  highlightBaseColor;      // C1 (C1            in shader) => RGB, usually white: (1.0, 1.0, 1.0)
  float metalness;               // m  (fMetalness    in shader) => [0.0, 1.0]
  float smoothness;              // s  (fSmoothness   in shader) => [0.0, 1.0]
  float transparency;            // t  (fTransparency in shader) => [0.0, 1.0]
  float indexOfRefraction;       // n  (not used, as intended for ray-tracing and global illumination)
  float fresnelConstant;         // Kf - constant for fresnel.
  float shadowConstant;          // Ks - constant for shadow.
  float offSpecularPeak;         // k  - constant for very rough surfaces.
  int   useTransparencyInAlpha;  // Set gl_FragColor (r, g, b, 1.0 - transparency)?
};


struct LightSource
{
  vec4  position;
  vec4  ambientColor;
  vec4  diffuseColor;
  vec4  specularColor;
  int   isEnabled;
  float constantAttenuation;
  float linearAttenuation;
  float quadraticAttenuation;
};

struct Fog
{
  vec4  color;
  float density;
  float minimumDistance;
  float maximumDistance;
  float scale;
  int   type;
  int   isEnabled;
};

struct GammaCorrection
{
  int enabled;
};

struct FresnelParameters
{
  float bias;
  float scale;
  float power;
  vec4  color;
  int   enabled;
};

struct Texturing
{
  int enabled;
  int mode;
};


const     int         NUMBER_OF_LIGHTS = 3;

uniform   vec3        eyePosition;
uniform   LightSource lights[NUMBER_OF_LIGHTS];
//uniform   Material    material;
uniform   float       transparency;
uniform   float       roughness;
uniform   Fog         fog;

uniform StraussParameters straussParameters;
uniform GammaCorrection   gammaCorrection;
uniform FresnelParameters fresnelParameters;
uniform sampler2D         texture;
uniform Texturing         texturing;

varying   vec3        varyingColor;
varying   vec2        varyingTexCoords;
varying   vec3        fragmentPosition;
varying   vec3        fragmentNormal;
varying   float       fragmentToEyeDistance;


void  main                (void);
float getTotalAttenuation (in LightSource lightSource,
                           in vec3 surfaceToLightVector);
vec4  clampColor (in vec4 colorToClamp);
float computeLinearFogFactor       (void);
float computeExponentialFog        (void);
float computeExponentialSquaredFog (void);
vec4 getFragmentColorWithFog
(
  in vec4  fragmentColor,
  in float fogFactor
);
float getFresnelTerm
(
  in FresnelParameters fresnelParameters,
  in vec3              eyeToSurfaceVector,
  in vec3              surfaceNormal
);
float fresnel (in float x, in float kf);
float shadow  (in float x, in float ks);


void main (void)
{
  vec4  fragmentColor;
  vec3  eyePosition;
  vec3  surfaceToEyeVector;
  vec3  surfaceNormal;
  float fogFactor;
  
  vec4  surfaceColor;
  vec4  highlightBaseColor;
  float smoothness;
  float metalness;
  float straussTransparency;
  float indexOfRefraction;
  float fresnelConstant;
  float shadowConstant;
  float offSpecularPeak;          // k
  int   useTransparencyInAlpha;
  
  fragmentColor      = vec4      (0.0, 0.0, 0.0, 1.0);
  eyePosition        = vec3      (0.0, 0.0, 0.0);
  surfaceToEyeVector = normalize (eyePosition - fragmentPosition);
  surfaceNormal      = normalize (fragmentNormal);
  
  surfaceColor           = straussParameters.surfaceColor;
  highlightBaseColor     = straussParameters.highlightBaseColor;
  metalness              = straussParameters.metalness;
  smoothness             = straussParameters.smoothness;
  straussTransparency    = straussParameters.transparency;
  indexOfRefraction      = straussParameters.indexOfRefraction;
  fresnelConstant        = straussParameters.fresnelConstant;
  shadowConstant         = straussParameters.shadowConstant;
  offSpecularPeak        = straussParameters.offSpecularPeak;
  useTransparencyInAlpha = straussParameters.useTransparencyInAlpha;
  
  if (texturing.enabled == 1)
  {
    surfaceColor = texture2D (texture, varyingTexCoords);
    
    if (texturing.mode == 1)
    {
      surfaceColor = surfaceColor * straussParameters.surfaceColor;
    }
    else if (texturing.mode == 2)
    {
      surfaceColor = surfaceColor + straussParameters.surfaceColor;
    }
  }
  
  if (fog.isEnabled == 1)
  {
    if (fog.type == 0)
    {
      fogFactor = computeLinearFogFactor ();
    }
    else if (fog.type == 1)
    {
      fogFactor = computeExponentialFog ();
    }
    else
    {
      fogFactor = computeExponentialSquaredFog ();
    }
  }
  else
  {
    fogFactor = 1.0;
  }
  
  for (int lightIndex = 0; lightIndex < NUMBER_OF_LIGHTS; lightIndex++)
  {
    LightSource lightSource;
    vec4        lightPosition;
    vec4        lightAmbientColor;
    vec4        lightDiffuseColor;
    vec4        lightSpecularColor;
    float       attenuation;
    
    vec3 surfaceToLightVector;
    
    vec4  diffuse;
    vec4  specular;
    
    float dotOfNormalAndLight;      // NdotL
    float fresnelOfNormalAndLight;  // fNdotL
    float metalnessSmoothnessTerm;  // d
    float smoothnessCubed;          // s_cubed
    float smoothnessTranspTerm;     // Rd
    float diffuseTerm;
    
    float dotOfNormalAndEye;        // NdotV
    float r;                        // r
    float j;                        // j
    float reflectTerm;              // reflect
    vec4  c1;                       // C1
    vec4  specularHighlightColor;   // Cs
    vec3  highlight;                // h in shader (= reflected light vector in Phong lighting model)
    float dotOfHighlightAndEye;     // Highlight * View (HdotV in shader)
    
    
    lightSource   = lights[lightIndex];
    lightPosition = lightSource.position;
    
    if (lightSource.isEnabled != 1)
    {
      continue;
    }
    
    // Directional light? => Is already a vector.
    if (lightPosition.w == 0.0)
    {
      surfaceToLightVector = normalize (-lightPosition.xyz);
      attenuation          = getTotalAttenuation (lightSource, -lightPosition.xyz);
    }
    // Positional light? => Convert to a vector.
    else
    {
      surfaceToLightVector = normalize (lightPosition.xyz - fragmentPosition);
      attenuation          = getTotalAttenuation (lightSource, lightPosition.xyz - fragmentPosition);
    }
    
    lightAmbientColor  = lightSource.ambientColor;
    lightDiffuseColor  = lightSource.diffuseColor;
    lightSpecularColor = lightSource.specularColor;
    
    
    ////////////////////////////////////////////////////////////////////
    // -- Calculate the DIFFUSE light color.                       -- //
    ////////////////////////////////////////////////////////////////////
    
    dotOfNormalAndLight     = dot (surfaceNormal, surfaceToLightVector);
    // Done by myself: Avoiding negative values.
    //dotOfNormalAndLight     = max (dotOfNormalAndLight, 0.0);
    fresnelOfNormalAndLight = fresnel (dotOfNormalAndLight, fresnelConstant);
    
    metalnessSmoothnessTerm = (1.0 - metalness * smoothness);
    smoothnessCubed         = (smoothness * smoothness * smoothness);
    smoothnessTranspTerm    = (1.0 - smoothnessCubed) * (1.0 - straussTransparency);
    diffuseTerm             = dotOfNormalAndLight
                              * metalnessSmoothnessTerm
                              * smoothnessTranspTerm;
    diffuse                 = diffuseTerm * surfaceColor;
    
    
    ////////////////////////////////////////////////////////////////////
    // -- Calculate the SPECULAR light color.                      -- //
    ////////////////////////////////////////////////////////////////////
    
    dotOfNormalAndEye      = dot (surfaceNormal, surfaceToEyeVector);
    // Done by myself: Avoiding negative values.
    //dotOfNormalAndEye     = max (dotOfNormalAndEye, 0.0);
    
    r                      = (1.0 - straussTransparency) - smoothnessTranspTerm;
    /* <!> IMPORTANT - FORMER SOURCE OF ERROR <!>
     *     Former source code used "dotOfNormalAndLight" instead of
     *     "fresnelOfNormalAndLight".
     *     => But little visible differences.
     */
    j                      = fresnelOfNormalAndLight
                             * shadow (dotOfNormalAndLight, shadowConstant)
                             * shadow (dotOfNormalAndEye,   shadowConstant);
    highlight              = reflect (-surfaceToLightVector, surfaceNormal);
    
    dotOfHighlightAndEye   = dot (highlight, surfaceToEyeVector);
    // Done by myself: Avoiding negative values.
    //dotOfHighlightAndEye   = max (dotOfHighlightAndEye, 0.0);
    
    reflectTerm            = min (1.0, r + j * (r + offSpecularPeak));
    // According to source: C1 = rgb[1,1,1] = white.
    //c1                     = vec3 (1.0, 1.0, 1.0);
    //c1                     = lightSource.specular.rgb;
    c1                     = highlightBaseColor;
    specularHighlightColor = c1
                             + metalness
                               * (1.0 - fresnelOfNormalAndLight)
                               * (surfaceColor - c1);
    specular               = specularHighlightColor * reflectTerm;
    specular               = specular * pow (-dotOfHighlightAndEye,
                                             3.0 / (1.0 - smoothness));
    
    
    ////////////////////////////////////////////////////////////////////
    // -- Combine SPECULAR and DIFFUSE color.                      -- //
    ////////////////////////////////////////////////////////////////////
    
    // Ensure that all colors are positive.
    diffuse  = clamp (diffuse,  0.0, 1.0);
    specular = clamp (specular, 0.0, 1.0);
    
    fragmentColor = fragmentColor
                    + lightAmbientColor
                    + (vec4 (diffuse.rgb,  1.0) * lightDiffuseColor +
                       vec4 (specular.rgb, 1.0) * lightSpecularColor)
                       * attenuation;
    
    // Even without clamping the model seems good.
    fragmentColor = clamp (fragmentColor, 0.0, 1.0);
  }
  
  
  fragmentColor = getFragmentColorWithFog (fragmentColor, fogFactor);
  //fragmentColor = vec4 (specularMaterial.emissiveColor.rgb, 0.0) + fragmentColor;
  
  if (fresnelParameters.enabled == 1)
  {
    float fresnelTerm;
    
    fresnelTerm = getFresnelTerm (fresnelParameters,
                                  -surfaceToEyeVector,
                                  surfaceNormal);
    fragmentColor = mix (fragmentColor, fresnelParameters.color, fresnelTerm);
  }
  
  if (gammaCorrection.enabled == 1)
  {
    fragmentColor.rgb = pow (fragmentColor.rgb, vec3 (1.0 / 2.2));
  }
  
  gl_FragColor = vec4 (fragmentColor.rgb, 1.0 - transparency);
  
  /*
  if (useTransparencyInAlpha == 1)
  {
    gl_FragColor = vec4 (fragmentColor.rgb, 1.0 - transparency);
  }
  else
  {
    gl_FragColor = vec4 (fragmentColor.rgb, 1.0);
  }
  */
}

float fresnel (in float x, in float kf)
{
  float fresnelTerm;
  float oneMinusKf;
  float xMinusKf;
  float kfSquared;
  float leftUpperFraction;
  float rightUpperFraction;
  float leftLowerFraction;
  float rightLowerFraction;
  
  oneMinusKf         = (1.0 - kf);
  xMinusKf           = (x   - kf);
  kfSquared          = (kf  * kf);
  leftUpperFraction  = (1.0 / (xMinusKf   * xMinusKf));
  rightUpperFraction = (1.0 / (kfSquared));
  leftLowerFraction  = (1.0 / (oneMinusKf * oneMinusKf));
  rightLowerFraction = (1.0 / (kfSquared));
  fresnelTerm        = (leftUpperFraction - rightUpperFraction) /
                       (leftLowerFraction - rightLowerFraction);
  
  return fresnelTerm;
}

float shadow (in float x, in float ks)
{
  float shadowTerm;
  float oneMinusKs;
  float xMinusKs;
  float ksSquared;
  float leftUpperFraction;
  float rightUpperFraction;
  float leftLowerFraction;
  float rightLowerFraction;
  
  oneMinusKs         = (1.0 - ks);
  xMinusKs           = (x   - ks);
  ksSquared          = (ks  * ks);
  leftUpperFraction  = (1.0 / (oneMinusKs * oneMinusKs));
  rightUpperFraction = (1.0 / (xMinusKs   * xMinusKs  ));
  leftLowerFraction  = (1.0 / (oneMinusKs * oneMinusKs));
  rightLowerFraction = (1.0 / (ksSquared));
  shadowTerm         = (leftUpperFraction - rightUpperFraction) /
                       (leftLowerFraction - rightLowerFraction);
  
  return shadowTerm;
}



/* Calculates a light source's total attenuation.
 * 
 * The "surfaceToLightVector" should NOT be normalized, as the distance
 * from the fragement to be lit to the light source is needed.
 * 
 * input parameters:   lightSource           The light source.
 *                     surfaceToLightVector  The vector from the surface
 *                                           fragment to the light
 *                                           source.
 * output parameters:  None.
 * return value:       The total attenuation factor for the given
 *                     "lightSource".
 * side effect:        None.
 */
float getTotalAttenuation
(
  in LightSource lightSource,
  in vec3        surfaceToLightVector
)
{
  float totalAttenuation;
  float constantAttenuation;
  float linearAttenuation;
  float quadraticAttenuation;
  float surfaceToLightDistance;
  float constantTerm;
  float linearTerm;
  float quadraticTerm;
  
  constantAttenuation    = lightSource.constantAttenuation;
  linearAttenuation      = lightSource.linearAttenuation;
  quadraticAttenuation   = lightSource.quadraticAttenuation;
  surfaceToLightDistance = length (surfaceToLightVector);
  constantTerm           = constantAttenuation;
  linearTerm             = linearAttenuation    * surfaceToLightDistance;
  quadraticTerm          = quadraticAttenuation * (surfaceToLightDistance * surfaceToLightDistance);
  totalAttenuation       = 1.0 / (constantTerm + linearTerm + quadraticTerm);
  
  return totalAttenuation;
}


// Equivalent to Direct3D function "saturate".
// -> "https://msdn.microsoft.com/de-de/library/windows/desktop/bb509645%28v=vs.85%29.aspx"
vec4 clampColor (in vec4 colorToClamp)
{
  vec4 clampedColor;
  vec4 minimumColor;
  vec4 maximumColor;
  
  minimumColor = vec4  (0.0, 0.0, 0.0, 1.0);
  maximumColor = vec4  (1.0, 1.0, 1.0, 1.0);
  //clampedColor = clamp (colorToClamp, minimumColor, maximumColor);
  clampedColor = clamp (colorToClamp, 0.0, 1.0);
  
  return clampedColor;
}

float computeLinearFogFactor (void)
{
  float fogFactor;
  float minimumFogDistance;
  float maximumFogDistance;
  
  minimumFogDistance = fog.minimumDistance;
  maximumFogDistance = fog.maximumDistance;
  
  fogFactor = (maximumFogDistance - fragmentToEyeDistance) /
              (maximumFogDistance - minimumFogDistance);
  
  fogFactor = clamp (fogFactor, 0.0, 1.0);
  
  return fogFactor;
}

float computeExponentialFog (void)
{
  float fogFactor;
  float density;
  float fogFragCoord;  // b.
  
  density      = fog.density;
  fogFragCoord = fragmentToEyeDistance;
  //fogFragCoord = (fog.maximumDistance - fog.minimumDistance);
  
  fogFactor    = exp (-density * fogFragCoord);
  fogFactor    = clamp (fogFactor, 0.0, 1.0);
  
  return fogFactor;
}

float computeExponentialSquaredFog (void)
{
  float fogFactor;
  float density;
  float fogFragCoord;  // b.
  
  density      = fog.density;
  fogFragCoord = fragmentToEyeDistance;
  //fogFragCoord = (fog.maximumDistance - fog.minimumDistance);
  
  fogFactor = exp (-density * density * fogFragCoord * fogFragCoord);
  fogFactor = clamp (fogFactor, 0.0, 1.0);
  
  return fogFactor;
}

vec4 getFragmentColorWithFog
(
  in vec4  fragmentColor,
  in float fogFactor
)
{
  vec4 foggedColor;
  
  foggedColor = (fragmentColor * fogFactor) +
                (fog.color     * (1.0 - fogFactor));
  
  return foggedColor;
}

float getFresnelTerm
(
  in FresnelParameters fresnelParameters,
  in vec3              eyeToSurfaceVector,
  in vec3              surfaceNormal
)
{
  float fresnelTerm;
  float cosBetweenEyeVectorAndNormal;
  float fresnelBias;
  float fresnelScale;
  float fresnelPower;
  float fresnelExponentiation;
  
  fresnelBias                  = fresnelParameters.bias;
  fresnelScale                 = fresnelParameters.scale;
  fresnelPower                 = fresnelParameters.power;
  cosBetweenEyeVectorAndNormal = dot (eyeToSurfaceVector, surfaceNormal);
  fresnelExponentiation        = pow (1.0 + cosBetweenEyeVectorAndNormal, fresnelPower);
  fresnelTerm                  = fresnelBias + fresnelScale * fresnelExponentiation;
  
  return fresnelTerm;
}
