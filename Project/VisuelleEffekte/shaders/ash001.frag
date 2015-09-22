// 13.08.2015
// -> "http://content.gpwiki.org/index.php/D3DBook:%28Lighting%29_Ashikhmin-Shirley"
// -> "http://www.cs.utah.edu/~shirley/papers/jgtbrdf.pdf" (formula (4) on page 5)
// -> "http://gamedev.stackexchange.com/questions/66341/ashikhmin-shirley-model-implementation-ugly-result?rq=1"


precision highp float;


struct AshikhminShirleyMaterial
{
  vec3 referenceAxis;       // epsilon  (n)
  vec2 exponentialFactors;  // Nu, Nv   (n_u, n_v)
  vec3 diffuseColor;        // Rd       (Rd)
  vec3 specularColor;       // Rs       (Rs)
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

struct FresnelParameters
{
  float bias;
  float scale;
  float power;
  vec4  color;
  int   enabled;
};

struct GammaCorrection
{
  int enabled;
};

struct Texturing
{
  int enabled;
  int mode;
};


const     int         NUMBER_OF_LIGHTS = 3;

uniform vec3                     eyePosition;
uniform LightSource              lights[NUMBER_OF_LIGHTS];
uniform float                    transparency;
uniform float                    roughness;
uniform Fog                      fog;
uniform GammaCorrection          gammaCorrection;

uniform AshikhminShirleyMaterial ashikhminShirleyMaterial;
uniform sampler2D                texture;
uniform FresnelParameters        fresnelParameters;
uniform Texturing                texturing;

varying   vec3        varyingColor;
varying   vec2        varyingTexCoords;
varying   vec3        fragmentPosition;
varying   vec3        fragmentNormal;
varying   float       fragmentToEyeDistance;


void  main (void);
float getTotalAttenuation
(
  in LightSource lightSource,
  in vec3        surfaceToLightVector
);
vec4 clampColor (in vec4 colorToClamp);
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


void main (void)
{
  const float PI = 3.1415926;
  
  vec4  fragmentColor;
  vec3  surfaceToEyeVector;              // v    (k2)
  vec3  surfaceNormal;                   // n    (n)
  vec4  textureColor;
  float fogFactor;
  
  fragmentColor      = vec4      (0.0, 0.0, 0.0, 1.0);
  surfaceNormal      = normalize (fragmentNormal);
  surfaceToEyeVector = normalize (eyePosition - fragmentPosition);
  //textureColor       = texture2D (texture, gl_TexCoord[0].st);
  
  
  vec3  epsilon;
  vec3  tangent;
  vec3  bitangent;
  vec3  diffuseColor;      
  vec3  specularColor;     // Rs  (Rs)
  float exponentX;         // Nu  (n_u)
  float exponentY;         // Nv  (n_v)
  
  epsilon       = ashikhminShirleyMaterial.referenceAxis;
  tangent       = normalize (cross (surfaceNormal, epsilon));
  bitangent     = normalize (cross (surfaceNormal, tangent));
  exponentX     = ashikhminShirleyMaterial.exponentialFactors.x;
  exponentY     = ashikhminShirleyMaterial.exponentialFactors.y;
  diffuseColor  = ashikhminShirleyMaterial.diffuseColor;
  specularColor = ashikhminShirleyMaterial.specularColor;
  
  if (texturing.enabled == 1)
  {
    diffuseColor = texture2D (texture, varyingTexCoords).rgb;
    
    if (texturing.mode == 1)
    {
      diffuseColor = diffuseColor * ashikhminShirleyMaterial.diffuseColor;
    }
    else if (texturing.mode == 2)
    {
      diffuseColor = diffuseColor + ashikhminShirleyMaterial.diffuseColor;
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
    vec3        surfaceToLightVector;          //        (k1)
    vec3        halfVector;                    //        (h)
    float       dotOfEyeAndNormal;             // VdotN  (n . k2)
    float       dotOfLightAndNormal;           // LdotN  (n . k1)
    float       dotOfHalfVectorAndNormal;      // HdotN  (h . n)
    float       dotOfHalfVectorAndLight;       // HdotL  (k . h)
    float       dotOfHalfVectorAndTangent;     // HdotT  (h . u)
    float       dotOfHalfVectorAndBitangent;   // HdotB  (h . v)
    float       attenuation;
    vec3        litDiffuseColor;
    vec3        litSpecularColor;
    
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
    
    halfVector = normalize (surfaceToLightVector + surfaceToEyeVector);
    
    
    dotOfEyeAndNormal           = dot (surfaceToEyeVector,   surfaceNormal);
    dotOfLightAndNormal         = dot (surfaceToLightVector, surfaceNormal);
    dotOfHalfVectorAndNormal    = dot (halfVector, surfaceNormal);
    dotOfHalfVectorAndLight     = dot (halfVector, surfaceToLightVector);
    dotOfHalfVectorAndTangent   = dot (halfVector, tangent);
    dotOfHalfVectorAndBitangent = dot (halfVector, bitangent);
    
    
    // Clamping "dotOfHalfVectorAndBitangent" leads to bad results.
    dotOfEyeAndNormal           = max (dotOfEyeAndNormal,           0.0);
    dotOfLightAndNormal         = max (dotOfLightAndNormal,         0.0);
    /*
    dotOfHalfVectorAndNormal    = max (dotOfHalfVectorAndNormal,    0.0);
    dotOfHalfVectorAndLight     = max (dotOfHalfVectorAndLight,     0.0);
    dotOfHalfVectorAndTangent   = max (dotOfHalfVectorAndTangent,   0.0);
    dotOfHalfVectorAndBitangent = max (dotOfHalfVectorAndBitangent, 0.0);
    */
    
    litDiffuseColor  = diffuseColor  * lightSource.diffuseColor.rgb;
    litSpecularColor = specularColor * lightSource.specularColor.rgb;
    
    // Compute the diffuse term Pd.
    vec3 diffuseTerm;  // Pd
    diffuseTerm = (28.0 * litDiffuseColor) / (23.0 * PI);
    diffuseTerm = diffuseTerm * (1.0 - litSpecularColor);
    diffuseTerm = diffuseTerm * (1.0 - pow (1.0 - (dotOfLightAndNormal / 2.0), 5.0));
    diffuseTerm = diffuseTerm * (1.0 - pow (1.0 - (dotOfEyeAndNormal   / 2.0), 5.0));
    
    // Compute the specular term Ps.
    float specularTermNumerator_exp;  // specularTerm_num_exp
    float specularTermNumerator;      // specularTerm_num
    float specularTermDenominator;    // specularTerm_den
    vec3  specularTerm;               // Ps
    specularTermNumerator_exp = exponentX * (dotOfHalfVectorAndTangent   * dotOfHalfVectorAndTangent) +
                                exponentY * (dotOfHalfVectorAndBitangent * dotOfHalfVectorAndBitangent);
    specularTermNumerator_exp = specularTermNumerator_exp / (1.0 - (dotOfHalfVectorAndNormal * dotOfHalfVectorAndNormal));
    
    specularTermNumerator     = sqrt ((exponentX + 1.0) * (exponentY + 1.0));
    specularTermNumerator     = specularTermNumerator * pow (dotOfHalfVectorAndNormal, specularTermNumerator_exp);
    
    specularTermDenominator   = 8.0 * PI * dotOfHalfVectorAndLight;
    specularTermDenominator   = specularTermDenominator * max (dotOfLightAndNormal, dotOfEyeAndNormal);
    
    specularTerm = litSpecularColor * (specularTermNumerator / specularTermDenominator);
    /* Multiplying by Schlick's Fresnel approximation:
     *   F(x) = Rs            + (1   - Rs)            * (1 - x)^                            5
     *        = specularColor + (1.0 - specularColor) * pow (1.0 - dotOfHalfVectorAndLight, 5.0)
     */
    specularTerm = specularTerm * (litSpecularColor + (1.0 - litSpecularColor) * pow (1.0 - dotOfHalfVectorAndLight, 5.0));
    
    //specularTerm = specularTerm * lightSource.specularColor.rgb;
    
    fragmentColor = fragmentColor
                    + vec4 ((diffuseTerm + specularTerm) * attenuation, 1.0);
    
    fragmentColor = clamp (fragmentColor, 0.0, 1.0);
  }
  
  fragmentColor = getFragmentColorWithFog (fragmentColor, fogFactor);
  
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
    //fragmentColor = pow (fragmentColor, vec4 (1.0 / 2.2));
    fragmentColor.rgb = pow (fragmentColor.rgb, vec3 (1.0 / 2.2));
  }
  
  gl_FragColor = vec4 (fragmentColor.rgb, 1.0 - transparency);
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

