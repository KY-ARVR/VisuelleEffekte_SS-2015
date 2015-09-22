// 30.08.2015
// 
// -> "http://steps3d.narod.ru/tutorials/lighting-tutorial.html"
// -> "http://hinjang.com/articles/03.html"


precision highp float;


struct LommelSeeligerParameters
{
  vec4  diffuseColor;
  float diffuseBias;
  float diffuseScale;
  float diffuseExponent;
};

struct SpecularMaterial
{
  vec4  ambientColor;
  float ambientIntensity;
  vec4  diffuseColor;
  vec4  emissiveColor;
  vec4  specularColor;
  float specularIntensity;
  float shininess;
  int   enabled;
  int   type;
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

uniform LommelSeeligerParameters lommelSeeligerParameters;
uniform SpecularMaterial         specularMaterial;
uniform GammaCorrection          gammaCorrection;
uniform FresnelParameters        fresnelParameters;
uniform sampler2D                texture;
uniform Texturing                texturing;

varying   vec3        varyingColor;
varying   vec2        varyingTexCoords;
varying   vec3        fragmentPosition;
varying   vec3        fragmentNormal;
varying   float       fragmentToEyeDistance;


void  main                (void);
float getTotalAttenuation (in LightSource lightSource,
                           in vec3 surfaceToLightVector);
vec4 getPhongSpecularComponent
(
  in vec3  surfaceNormal,
  in vec3  surfaceToLightVector,
  in vec3  surfaceToEyeVector,
  in vec4  specularMaterialColor,
  in vec4  specularLightColor,
  in float shininess
);
vec4 getBlinnPhongSpecularComponent
(
  in vec3  surfaceNormal,
  in vec3  surfaceToLightVector,
  in vec3  surfaceToEyeVector,
  in vec4  specularMaterialColor,
  in vec4  specularLightColor,
  in float shininess
);
vec4 getSchlickSpecularComponent
(
  in vec3  surfaceNormal,
  in vec3  surfaceToLightVector,
  in vec3  surfaceToEyeVector,
  in vec4  specularMaterialColor,
  in vec4  specularLightColor,
  in float shininess
);
vec4 getGaussSpecularComponent
(
  in vec3  surfaceNormal,
  in vec3  surfaceToLightVector,
  in vec3  surfaceToEyeVector,
  in vec4  specularMaterialColor,
  in vec4  specularLightColor,
  in float shininess
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
  vec4  fragmentColor;
  vec3  eyePosition;
  vec3  surfaceToEyeVector;
  vec3  surfaceNormal;
  float dotOfNormalAndEye;
  vec4  diffuseColor;
  float fogFactor;
  
  fragmentColor      = vec4      (0.0, 0.0, 0.0, 1.0);
  eyePosition        = vec3      (0.0, 0.0, 0.0);
  surfaceToEyeVector = normalize (eyePosition - fragmentPosition);
  surfaceNormal      = normalize (fragmentNormal);
  dotOfNormalAndEye  = dot (surfaceNormal, surfaceToEyeVector);
  dotOfNormalAndEye  = max (0.0,           dotOfNormalAndEye);
  
  diffuseColor       = lommelSeeligerParameters.diffuseColor;
  
  if (texturing.enabled == 1)
  {
    diffuseColor = texture2D (texture, varyingTexCoords);
    
    if (texturing.mode == 1)
    {
      diffuseColor = diffuseColor * lommelSeeligerParameters.diffuseColor;
    }
    else if (texturing.mode == 2)
    {
      diffuseColor = diffuseColor + lommelSeeligerParameters.diffuseColor;
    }
  }
  
  /*
  if (texturing.enabled == 1)
  {
    //diffuseColor = texture2D (textureID, gl_TexCoord[0].st);
    diffuseColor = texture2D (textureID, gl_TexCoord[0].st) + lommelSeeligerParameters.diffuseColor;
  }
  else
  {
    diffuseColor = lommelSeeligerParameters.diffuseColor;
  }
  */
  
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
    vec3        surfaceToLightVector;
    float       dotOfNormalAndLight;
    float       diffuseTerm;
    vec4        ambientComponent;
    vec4        diffuseComponent;
    vec4        specularComponent;
    
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
    // -- Calculate the DIFFUSE TERM.                              -- //
    ////////////////////////////////////////////////////////////////////
    
    dotOfNormalAndLight = dot (surfaceNormal, surfaceToLightVector);
    dotOfNormalAndLight = max (0.0,           dotOfNormalAndLight);
    
    diffuseTerm         =  dotOfNormalAndLight /
                          (dotOfNormalAndLight + dotOfNormalAndEye);
    // Added by myself.
    diffuseTerm         = lommelSeeligerParameters.diffuseBias
                          + lommelSeeligerParameters.diffuseScale *
                            pow (diffuseTerm, lommelSeeligerParameters.diffuseExponent);
    
    diffuseComponent    = lightDiffuseColor
                          * vec4 (diffuseColor.rgb, 1.0)
                          * diffuseTerm;
    
    if (specularMaterial.type == 0)
    {
      specularComponent = getPhongSpecularComponent
      (
        surfaceNormal,
        surfaceToLightVector,
        surfaceToEyeVector,
        specularMaterial.specularColor,
        lightSpecularColor,
        specularMaterial.shininess
      );
      specularComponent = (specularComponent * specularMaterial.specularIntensity);
      
      ambientComponent  = (lightAmbientColor * specularMaterial.ambientColor);
      ambientComponent  = (ambientComponent  * specularMaterial.ambientIntensity);
    }
    else if (specularMaterial.type == 1)
    {
      specularComponent = getBlinnPhongSpecularComponent
      (
        surfaceNormal,
        surfaceToLightVector,
        surfaceToEyeVector,
        specularMaterial.specularColor,
        lightSpecularColor,
        specularMaterial.shininess
      );
      specularComponent = (specularComponent * specularMaterial.specularIntensity);
      
      ambientComponent  = (lightAmbientColor * specularMaterial.ambientColor);
      ambientComponent  = (ambientComponent  * specularMaterial.ambientIntensity);
    }
    else if (specularMaterial.type == 2)
    {
      specularComponent = getSchlickSpecularComponent
      (
        surfaceNormal,
        surfaceToLightVector,
        surfaceToEyeVector,
        specularMaterial.specularColor,
        lightSpecularColor,
        specularMaterial.shininess
      );
      specularComponent = (specularComponent * specularMaterial.specularIntensity);
      
      ambientComponent  = (lightAmbientColor * specularMaterial.ambientColor);
      ambientComponent  = (ambientComponent  * specularMaterial.ambientIntensity);
    }
    else if (specularMaterial.type == 3)
    {
      specularComponent = getGaussSpecularComponent
      (
        surfaceNormal,
        surfaceToLightVector,
        surfaceToEyeVector,
        specularMaterial.specularColor,
        lightSpecularColor,
        specularMaterial.shininess
      );
      specularComponent = (specularComponent * specularMaterial.specularIntensity);
      
      ambientComponent  = (lightAmbientColor * specularMaterial.ambientColor);
      ambientComponent  = (ambientComponent  * specularMaterial.ambientIntensity);
    }
    else
    {
      specularComponent = vec4 (0.0, 0.0, 0.0, 0.0);
      ambientComponent  = vec4 (0.0, 0.0, 0.0, 0.0);
    }
    
    // According to: -> "https://www.opengl.org/sdk/docs/tutorials/ClockworkCoders/lighting.php"
    // and           -> "http://blenderartists.org/forum/showthread.php?265979-GLSL-Phong-Shader-(Supports-Multiple-Light-Sources)"
    diffuseComponent    = clampColor (diffuseComponent);
    specularComponent   = clampColor (specularComponent);
    ambientComponent    = clampColor (ambientComponent);
    
    
    ////////////////////////////////////////////////////////////////////
    // -- Calculate the TOTAL LIGHT color.                         -- //
    ////////////////////////////////////////////////////////////////////
    
    fragmentColor       = fragmentColor
                          + ambientComponent
                          + attenuation * (diffuseComponent + specularComponent);
    fragmentColor       = clampColor (fragmentColor);
  }
  
  fragmentColor = getFragmentColorWithFog (fragmentColor, fogFactor);
  fragmentColor = vec4 (specularMaterial.emissiveColor.rgb, 0.0) + fragmentColor;
  
  if (fresnelParameters.enabled == 1)
  {
    float fresnelTerm;
    
    fresnelTerm = getFresnelTerm (fresnelParameters,
                                  -surfaceToEyeVector,
                                  surfaceNormal);
    fragmentColor = mix (fragmentColor, fresnelParameters.color, fresnelTerm);
  }
  
  /* Gamma correction according to
   * -> "https://studentportalen.uu.se/sakaiportal/tool/fdb99ee8-5440-433b-b687-afcf510f0ae4?uusp-locale=sv_SE&uusp.userId=guest"
   * -> "http://http.developer.nvidia.com/GPUGems3/gpugems3_ch24.html"
   */
  if (gammaCorrection.enabled == 1)
  {
    //fragmentColor = pow (fragmentColor, vec4 (1.0 / 2.2));
    fragmentColor.rgb = pow (fragmentColor.rgb, vec3 (1.0 / 2.2));
  }
  
  /*
  gl_FragColor = vec4 (specularMaterial.emissiveColor.rgb, 0.0) +
                 vec4 (fragmentColor.rgb, 1.0 - transparency);
  */
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

vec4 getPhongSpecularComponent
(
  in vec3  surfaceNormal,
  in vec3  surfaceToLightVector,
  in vec3  surfaceToEyeVector,
  in vec4  specularMaterialColor,
  in vec4  specularLightColor,
  in float shininess
)
{
  vec4  specularComponent;       // Resulting specular color.
  vec3  reflectedLightVector;    // Light vector reflected at normal.
  float specularTerm;            // Specular term.

  // Calculate the light vector reflected at the surface normal.
  reflectedLightVector = reflect   (-surfaceToLightVector, surfaceNormal);
  reflectedLightVector = normalize (reflectedLightVector);

  // Calculate the specular term.
  specularTerm = dot (reflectedLightVector, surfaceToEyeVector);
  specularTerm = max (specularTerm,         0.0);
  specularTerm = pow (specularTerm,         shininess); // Apply shininess.

  // Calculate the resulting specular color.
  specularComponent =   specularLightColor
                      * specularMaterialColor
                      * specularTerm;
  
  return specularComponent;
}

vec4 getBlinnPhongSpecularComponent
(
  in vec3  surfaceNormal,
  in vec3  surfaceToLightVector,
  in vec3  surfaceToEyeVector,
  in vec4  specularMaterialColor,
  in vec4  specularLightColor,
  in float shininess
)
{
  vec4  specularComponent;       // Resulting specular color.
  vec3  halfVector;              // Vector between light and view vector.
  float specularTerm;            // Specular term.

  // Calculate the half vector.
  halfVector = (surfaceToLightVector + surfaceToEyeVector);
  halfVector = normalize (halfVector);

  // Calculate the specular term.
  specularTerm = dot (surfaceNormal, halfVector);
  specularTerm = max (specularTerm,  0.0);
  specularTerm = pow (specularTerm,  shininess);    // Apply shininess.

  // Calculate the resulting specular color.
  specularComponent =   specularLightColor
                      * specularMaterialColor
                      * specularTerm;
  
  return specularComponent;
}

vec4 getSchlickSpecularComponent
(
  in vec3  surfaceNormal,
  in vec3  surfaceToLightVector,
  in vec3  surfaceToEyeVector,
  in vec4  specularMaterialColor,
  in vec4  specularLightColor,
  in float shininess
)
{
  vec4  specularComponent;       // Resulting specular color.
  vec3  reflectedLightVector;    // Light vector reflected at normal.
  float dotOfReflectionAndEye;   // R dot E.
  float specularTerm;            // Specular term.

  // Calculate the light vector reflected at the surface normal.
  reflectedLightVector = reflect   (-surfaceToLightVector, surfaceNormal);
  reflectedLightVector = normalize (reflectedLightVector);
  
  // Calculate the specular term.
  dotOfReflectionAndEye = dot (reflectedLightVector,  surfaceToEyeVector);
  dotOfReflectionAndEye = max (dotOfReflectionAndEye, 0.0);
  
  /* Apply shininess.
   * Replaces the power function in the Phong lighting model:
   *   specularTerm = pow (dotOfReflectionAndEye, shininess); 
   */
  specularTerm = dotOfReflectionAndEye / (shininess - ((shininess - 1.0) *  dotOfReflectionAndEye));
  //specularTerm = dotOfReflectionAndEye / (shininess - (shininess * dotOfReflectionAndEye) + dotOfReflectionAndEye);
  
  // Calculate the resulting specular color.
  specularComponent =   specularLightColor
                      * specularMaterialColor
                      * specularTerm;
  
  return specularComponent;
}

vec4 getGaussSpecularComponent
(
  in vec3  surfaceNormal,
  in vec3  surfaceToLightVector,
  in vec3  surfaceToEyeVector,
  in vec4  specularMaterialColor,
  in vec4  specularLightColor,
  in float shininess
)
{
  vec4  specularComponent;       // Resulting specular color.
  vec3  halfVector;              // Vector between light and view vector.
  float specularTerm;            // Specular term.
  float dotOfHalfVectorAndNormal;
  float angleBetweenHalfVectorAndNormal;
  float gaussianExponentFraction;
  float gaussianExponentTotal;

  // Calculate the half vector.
  halfVector = (surfaceToLightVector + surfaceToEyeVector);
  halfVector = normalize (halfVector);

  // Calculate the specular term.
  dotOfHalfVectorAndNormal        = dot  (halfVector, surfaceNormal);
  angleBetweenHalfVectorAndNormal = acos (dotOfHalfVectorAndNormal);
  gaussianExponentFraction        = (angleBetweenHalfVectorAndNormal /
                                     shininess);
  gaussianExponentTotal           = -(gaussianExponentFraction *
                                      gaussianExponentFraction);
  specularTerm                    = exp (gaussianExponentTotal);

  // Calculate the resulting specular color.
  specularComponent = specularLightColor
                      * specularMaterialColor
                      * specularTerm;
  
  return specularComponent;
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
