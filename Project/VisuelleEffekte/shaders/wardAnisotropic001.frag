// 04.07.2015
// Anisotropic Ward shader.
// 
// + explicit ambient  color (instead of Material)
// + explicit specular color (instead of Material)
// + explicit diffuse  color (instead of Material)
// "Advanced Lighting and Materials with Shaders", page 149-151
// Another useful source: "http://content.gpwiki.org/index.php/D3DBook:%28Lighting%29_Ward"


#define PI 3.14159


precision highp float;


struct AnisotropicWardParameters
{
  vec3 direction;
  vec2 roughnessParameters;
  vec4 ambientColor;
  vec4 diffuseColor;
  vec4 emissiveColor;
  vec4 specularColor;
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

uniform AnisotropicWardParameters wardParameters;
uniform GammaCorrection           gammaCorrection;
uniform FresnelParameters         fresnelParameters;
uniform Texturing                 texturing;
uniform sampler2D                 texture;

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
vec4  getFragmentColorWithFog
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
  vec4  diffuseColor;
  float fogFactor;
  
  vec3  direction;
  float roughnessX;
  float roughnessY;
  
  direction  = wardParameters.direction;
  roughnessX = wardParameters.roughnessParameters.x;
  roughnessY = wardParameters.roughnessParameters.y;
  
  fragmentColor      = vec4      (0.0, 0.0, 0.0, 1.0);
  eyePosition        = vec3      (0.0, 0.0, 0.0);
  surfaceToEyeVector = normalize (eyePosition - fragmentPosition);
  surfaceNormal      = normalize (fragmentNormal);
  
  diffuseColor       = wardParameters.diffuseColor;
  
  if (texturing.enabled == 1)
  {
    diffuseColor = texture2D (texture, varyingTexCoords);
    
    if (texturing.mode == 1)
    {
      diffuseColor = diffuseColor * wardParameters.diffuseColor;
    }
    else if (texturing.mode == 2)
    {
      diffuseColor = diffuseColor + wardParameters.diffuseColor;
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
    vec3        surfaceToLightVector;
    float       attenuation;
    vec3        halfVector;
    
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
    
    halfVector = normalize (surfaceToLightVector + surfaceToEyeVector);
    
    
    //// Anisotropic ward shader. ////////////////////////////////////////
    
    /* <!> IMPORTANT <!>
     *   HLSL replaces missing values for float4 variables like this:
     *     x = 0.0
     *     y = 0.0
     *     z = 0.0
     *     w = 0.0
     *   This is important, when implementing the variables
     *   "rightFractionTerm", "leftFractionTerm" and "exponentialTerm".
     *   See: -> "http://stackoverflow.com/questions/29728349/hlsl-sv-position-why-how-from-float3-to-float4"
     */
    
    float cosTheta;                    // N . L
    float cosDelta;                    // N . V
    float rightFractionTerm;           // 1 / sqrt ((N . L) * (N . V))
    float leftFractionTerm;            // 1 / (4*PI * sigmaX * sigmaY)
    vec3  tangent;                     // x
    vec3  bitangent;                   // y
    float dotOfHalfVectorAndTangent;   // hDotX
    float dotOfHalfVectorAndBitangent; // hDotY
    float dotOfHalfVectorAndNormal;    // hDotN
    float dividendInExponentialTerm;   // -2 * (((H . X) / sigma_x)^2 + ((H . Y) / sigma_y)^2)
    float divisorInExponentialTerm;    // 1 + H dot N
    float exponentialTerm;             // e^(-2 * (...))
    //vec4  irradiance;      // Using vec4.
    float irradiance;
    
    //vec4  specularTerm;          // Called "specular" in the source.
    float specularTerm;
    vec4  diffuseComponent;                // D
    vec4  specularColor;               // S
    
    cosTheta                    = dot (surfaceNormal, surfaceToLightVector);
    cosDelta                    = dot (surfaceNormal, surfaceToEyeVector);
    rightFractionTerm           = 1.0 / sqrt (cosTheta * cosDelta);
    leftFractionTerm            = 1.0 / (4.0 * PI * roughnessX * roughnessY);
    tangent                     = normalize (cross (surfaceNormal, direction));
    bitangent                   = normalize (cross (surfaceNormal, tangent));
    dotOfHalfVectorAndTangent   = dot (halfVector, tangent);
    dotOfHalfVectorAndBitangent = dot (halfVector, bitangent);
    dotOfHalfVectorAndNormal    = dot (halfVector, surfaceNormal);
    dividendInExponentialTerm   = -2.0 * (pow ((dotOfHalfVectorAndTangent   / roughnessX), 2.0) +
                                          pow ((dotOfHalfVectorAndBitangent / roughnessY), 2.0));
    divisorInExponentialTerm    =  1.0 + dotOfHalfVectorAndNormal;
    exponentialTerm             = exp (dividendInExponentialTerm / divisorInExponentialTerm);
    // (N . L)
    //irradiance = vec4 (max (0.0, cosTheta), 0.0, 0.0, 1.0); // Using vec4. => Probably wrong.
    //irradiance = vec4 (max (0.0, cosTheta));                // Using vec4 with HLSL "scalar promotion".
    irradiance                  = max (0.0, cosTheta);
    
    specularTerm  = rightFractionTerm * leftFractionTerm * exponentialTerm;
    
    /*
    // Without attenuation:
    specularColor = lightSource.specular * anisotropicWardMaterial.specularColor * specularTerm;
    diffuseComponent  = lightSource.diffuse  * anisotropicWardMaterial.diffuseColor;
    */
    
    specularColor     = lightSource.specularColor * wardParameters.specularColor * specularTerm * attenuation;
    diffuseComponent  = lightSource.diffuseColor  * diffuseColor                 * attenuation;
    
    
    // Avoids black areas, but weakens color intensity.
    specularColor     = clamp (specularColor, 0.0, 1.0);
    diffuseComponent  = clamp (diffuseComponent,  0.0, 1.0);
    
    
    //////////////////////////////////////////////////////////////////////
    
    /*
    fragmentColor = fragmentColor
                    + (clamp (diffuseComponent + specularColor, 0.0, 1.0) * irradiance)
                    + lightSource.ambient * anisotropicWardMaterial.ambientColor;
    */
    
    fragmentColor = fragmentColor
                    + ((diffuseComponent + specularColor) * irradiance)
                    + lightSource.ambientColor * wardParameters.ambientColor;
    
    
    /* <!> VERY IMPORTANT <!>
     *     Generates "dark side" (e.g., fully black right side) on
     *     using multiple lights, if not CLAMPED!
     */
    fragmentColor = clamp (fragmentColor, 0.0, 1.0);
  }
  
  fragmentColor = getFragmentColorWithFog (fragmentColor, fogFactor);
  fragmentColor = vec4 (wardParameters.emissiveColor.rgb, 0.0) + fragmentColor;
  
  if (fresnelParameters.enabled == 1)
  {
    float fresnelTerm;
    
    fresnelTerm   = getFresnelTerm ( fresnelParameters,
                                    -surfaceToEyeVector,
                                     surfaceNormal);
    fragmentColor = mix (fragmentColor, fresnelParameters.color, fresnelTerm);
  }
  
  if (gammaCorrection.enabled == 1)
  {
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
  in vec3                     surfaceToLightVector
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
