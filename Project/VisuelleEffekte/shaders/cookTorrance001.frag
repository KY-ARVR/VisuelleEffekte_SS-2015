// 05.09.2015
// Cook-Torrance (diffuse ?) shader
// -> "Advanced Lighting and Materials with Shaders", p. 154-155, 103-105 (explanation)
// -> "http://content.gpwiki.org/index.php/D3DBook:(Lighting)_Cook-Torrance",
//    (especially section "http://content.gpwiki.org/index.php/D3DBook:(Lighting)_Cook-Torrance#Implementation")
// -> "https://lonalwah.wordpress.com/2013/12/01/cook-torrance-reflectance-highlighting-just-got-physical/"
// Extra parameter for Beckmann: -> "http://www.gamedev.net/topic/638197-cook-torrance-brdf-general/"
// Various distribution functions: -> "http://web.cs.wpi.edu/~emmanuel/courses/cs563/S10/talks/wk8_emmanuel_microfacet_scattering.pdf", p. 8-9
// Various distribution functions: -> "http://alextardif.com/PhysicallyBasedRendering.html"
// Various distribution functions: -> "http://d.hatena.ne.jp/hanecci/20130511/p1"
// Various distribution functions: -> "http://graphicrants.blogspot.de/2013/08/specular-brdf-reference.html"

// alpha: Angle, deviation of half vector h from surface normal N.


precision highp float;


#define PI                                  3.14159

#define BECKMANN_DISTRIBUTION_ORIGINAL_FORM 0
#define BECKMANN_DISTRIBUTION_VECTOR_FORM   1
#define BLINN_DISTRIBUTION                  2
#define TORRANCE_SPARROW_DISTRIBUTION       3
#define TROWBRIDGE_REITZ_DISTRIBUTION       4

#define FRESNEL_SCHLICK_WITH_NORMAL_AND_LIGHT           0
#define FRESNEL_SCHLICK_WITH_NORMAL_AND_VIEW            1
#define FRESNEL_SCHLICK_WITH_HALFVECTOR_AND_LIGHT       2
#define FRESNEL_SCHLICK_WITH_HALFVECTOR_AND_VIEW        3


struct CookTorranceParameters
{
  vec4  diffuseColor;
  vec4  emissiveColor;
  vec4  specularColor;
  float roughness;              // m,  for all distribution functions
  int   distributionFunction;
  float distributionParameter;  // For Blinn: c; for Beckmann: 1, pi, 4, etc.
  int   fresnelFunction;
  float reflectionCoefficient;  // R0, for Fresnel parameter
  float specularTermScale;
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

uniform CookTorranceParameters cookTorranceParameters;
uniform GammaCorrection        gammaCorrection;
uniform FresnelParameters      fresnelParameters;
uniform sampler2D              texture;
uniform Texturing              texturing;

varying   vec3        varyingColor;
varying   vec2        varyingTexCoords;
varying   vec3        fragmentPosition;
varying   vec3        fragmentNormal;
varying   float       fragmentToEyeDistance;


void  main                (void);
float getTotalAttenuation (in LightSource lightSource,
                           in vec3 surfaceToLightVector);
float beckmannDistributionOriginalForm
(
  in float alpha,
  in float roughness,
  in float distributionParameter
);
float beckmannDistributionVectorForm
(
  in float dotOfNormalAndHalfVector,
  in float roughness,
  in float distributionParameter
);
float blinnDistribution
(
  in float alpha,
  in float roughness,             // m
  in float distributionParameter  // c
);
float torranceSparrowDistribution
(
  in float alpha,
  in float roughness,
  in float distributionParameter
);
float trowbridgeReitzDistribution
(
  in float alpha,
  in float roughness,
  in float distributionParameter
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
  float fogFactor;
  
  float roughness;
  float reflectionCoefficient;
  int   distributionFunction;
  int   fresnelFunction;
  float specularTermScale;
  float distributionParameter;
  vec4  diffuseColor;
  
  fragmentColor      = vec4      (0.0, 0.0, 0.0, 1.0);
  eyePosition        = vec3      (0.0, 0.0, 0.0);
  surfaceToEyeVector = normalize (eyePosition - fragmentPosition);
  surfaceNormal      = normalize (fragmentNormal);
  
  roughness             = cookTorranceParameters.roughness;
  reflectionCoefficient = cookTorranceParameters.reflectionCoefficient;
  distributionFunction  = cookTorranceParameters.distributionFunction;
  fresnelFunction       = cookTorranceParameters.fresnelFunction;
  specularTermScale     = cookTorranceParameters.specularTermScale;
  distributionParameter = cookTorranceParameters.distributionParameter;
  
  if (texturing.enabled == 1)
  {
    diffuseColor = texture2D (texture, varyingTexCoords);
    
    if (texturing.mode == 1)
    {
      diffuseColor = diffuseColor * cookTorranceParameters.diffuseColor;
    }
    else if (texturing.mode == 2)
    {
      diffuseColor = diffuseColor + cookTorranceParameters.diffuseColor;
    }
  }
  else
  {
    diffuseColor = cookTorranceParameters.diffuseColor;
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
    vec3        surfaceToLightVector;
    vec3        halfVector;
    float       attenuation;
    
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
    
    
    
    ////////////////////////////////////////////////////////////////////
    // -- Calculate the COOK-TORRANCE MATERIAL.                    -- //
    ////////////////////////////////////////////////////////////////////
    
    float dotOfNormalAndHalfVector;   // NdotH
    float alpha;                      // alpha
    float roughnessTerm;              // d
    float dotOfNormalAndEye;          // NdotV
    float dotOfHalfVectorAndEye;      // vDotH
    float dotOfLightAndNormal;        // nDotL
    float leftPartOfGeometricTerm;    // g1
    float rightPartOfGeometricTerm;   // g2
    float geometricTerm;              // g
    float fresnelTerm;                // f
    float specularTerm;               // F * D * G / (NdotL * NdotV)
    
    dotOfNormalAndHalfVector = clamp (dot (surfaceNormal, halfVector), 0.0, 1.0);
    alpha                    = acos  (dotOfNormalAndHalfVector);
    
    
    ////////////////////////////////////////////////////////////////////
    // -- Calculate the ROUGHNESS term.                            -- //
    ////////////////////////////////////////////////////////////////////
    
    if (distributionFunction == BECKMANN_DISTRIBUTION_ORIGINAL_FORM)
    {
      roughnessTerm = beckmannDistributionOriginalForm
      (
        alpha,
        roughness,
        distributionParameter
      );
    }
    /* With PI:
     *   -> "http://content.gpwiki.org/index.php/D3DBook:%28Lighting%29_Cook-Torrance"
     *      (for example in implementation code under section "http://content.gpwiki.org/index.php/D3DBook:%28Lighting%29_Cook-Torrance#Implementation";
     *       note: the implementation code uses 4.0f instead of PI).
     * 
     * Without PI:
     *   -> "http://ruh.li/GraphicsCookTorrance.html"
     */
    else if (distributionFunction == BECKMANN_DISTRIBUTION_VECTOR_FORM)
    {
      roughnessTerm = beckmannDistributionVectorForm
      (
        alpha,
        roughness,
        distributionParameter
      );
    }
    else if (distributionFunction == BLINN_DISTRIBUTION)
    {
      roughnessTerm = blinnDistribution
      (
        alpha,
        roughness,
        distributionParameter
      );
    }
    else if (distributionFunction == TORRANCE_SPARROW_DISTRIBUTION)
    {
      roughnessTerm = torranceSparrowDistribution
      (
        alpha,
        roughness,
        distributionParameter
      );
    }
    else if (distributionFunction == TROWBRIDGE_REITZ_DISTRIBUTION)
    {
      roughnessTerm = trowbridgeReitzDistribution
      (
        alpha,
        roughness,
        distributionParameter
      );
    }
    else
    {
      roughnessTerm = 1.0;
    }
    
    
    ////////////////////////////////////////////////////////////////////
    // -- Calculate the GEOMETRIC TERM.                            -- //
    ////////////////////////////////////////////////////////////////////
    
    dotOfNormalAndEye     = dot (surfaceNormal,        surfaceToEyeVector);
    dotOfHalfVectorAndEye = dot (halfVector,           surfaceToEyeVector);
    dotOfLightAndNormal   = dot (surfaceToLightVector, surfaceNormal);
    
    // NOTE: Creates radical changes of black/surface color when moving
    //       the model. => Probably not realistic.
    dotOfNormalAndEye     = clamp (dotOfNormalAndEye,     0.0, 1.0);
    dotOfHalfVectorAndEye = clamp (dotOfHalfVectorAndEye, 0.0, 1.0);
    dotOfLightAndNormal   = clamp (dotOfLightAndNormal,   0.0, 1.0);
    
    leftPartOfGeometricTerm  = 2.0 * dotOfNormalAndHalfVector
                                   * dotOfNormalAndEye
                               / dotOfHalfVectorAndEye;
    rightPartOfGeometricTerm = 2.0 * dotOfNormalAndHalfVector
                                   * dotOfLightAndNormal
                               / dotOfHalfVectorAndEye;
    // Error in "Advanced Lighting and Materials with Shaders"?
    //geometricTerm            = min (1.0, max (0.0, min (leftPartOfGeometricTerm, rightPartOfGeometricTerm)));
    geometricTerm            = min (1.0, min (leftPartOfGeometricTerm, rightPartOfGeometricTerm));
    
    
    ////////////////////////////////////////////////////////////////////
    // -- Calculate the FRESNEL term.                              -- //
    ////////////////////////////////////////////////////////////////////
    
    if (fresnelFunction == FRESNEL_SCHLICK_WITH_NORMAL_AND_LIGHT)
    {
      fresnelTerm = reflectionCoefficient + (1.0 - reflectionCoefficient) * pow (1.0 - dotOfLightAndNormal, 5.0);
    }
    else if (fresnelFunction == FRESNEL_SCHLICK_WITH_NORMAL_AND_VIEW)
    {
      fresnelTerm = reflectionCoefficient + (1.0 - reflectionCoefficient) * pow (1.0 - dotOfNormalAndEye, 5.0);
    }
    else if (fresnelFunction == FRESNEL_SCHLICK_WITH_HALFVECTOR_AND_LIGHT)
    {
      float dotOfHalfVectorAndLight;
      
      dotOfHalfVectorAndLight = dot   (halfVector, surfaceToLightVector);
      dotOfHalfVectorAndLight = clamp (dotOfHalfVectorAndLight, 0.0, 1.0);
      
      fresnelTerm = reflectionCoefficient + (1.0 - reflectionCoefficient) * pow (1.0 - dotOfHalfVectorAndLight, 5.0);
    }
    else if (fresnelFunction == FRESNEL_SCHLICK_WITH_HALFVECTOR_AND_VIEW)
    {
      fresnelTerm = reflectionCoefficient + (1.0 - reflectionCoefficient) * pow (1.0 - dotOfHalfVectorAndEye, 5.0);
    }
    else
    {
      fresnelTerm = 1.0;
    }
    
    
    /* The source
     *   -> "http://ruh.li/GraphicsCookTorrance.html"
     * uses specularTermScale = PI.
     */
    specularTerm = (fresnelTerm * roughnessTerm * geometricTerm) /
                     (dotOfLightAndNormal * dotOfNormalAndEye * specularTermScale);
    
    
    ////////////////////////////////////////////////////////////////////
    // -- Calculate the FINAL COLOR.                               -- //
    ////////////////////////////////////////////////////////////////////
    
    vec4 specularComponent;
    vec4 diffuseComponent;
    
    specularComponent = cookTorranceParameters.specularColor
                        * lightSource.specularColor
                        * specularTerm;
    diffuseComponent  = diffuseColor
                        * lightSource.diffuseColor;
    
    // Seems to be necessary to avoid black areas.
    specularComponent = clamp (specularComponent, 0.0, 1.0);
    diffuseComponent  = clamp (diffuseComponent,  0.0, 1.0);
    
    /* Using
     *   clamp (specularComponent + diffuseComponent)
     * leads very "foggy" colors.
     */
    fragmentColor     = fragmentColor
                        + max (0.0, dotOfLightAndNormal)
                        * (specularComponent + diffuseComponent)
                        * attenuation;
    
    /* <!> VERY IMPORTANT <!>
     *     Generates "dark side" (e.g., fully black right side) on
     *     using multiple lights, if not CLAMPED!
     */
    fragmentColor = clamp (fragmentColor, 0.0, 1.0);
  }
  
  fragmentColor = getFragmentColorWithFog (fragmentColor, fogFactor);
  fragmentColor = vec4 (cookTorranceParameters.emissiveColor.rgb, 0.0) + fragmentColor;
  
  if (fresnelParameters.enabled == 1)
  {
    float extraFresnelTerm;
    
    extraFresnelTerm = getFresnelTerm (fresnelParameters,
                                  -surfaceToEyeVector,
                                  surfaceNormal);
    fragmentColor = mix (fragmentColor, fresnelParameters.color, extraFresnelTerm);
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

float beckmannDistributionOriginalForm
(
  in float alpha,
  in float roughness,  // n
  in float distributionParameter
)
{
  float roughnessTerm;
  float dividend;
  float divisor;
  float tanAlpha;
  float cosAlpha;
  float cosAlphaPower4;
  float roughnessPower2;  // m^2
  
  tanAlpha       = tan (alpha);
  cosAlpha       = cos (alpha);
  cosAlphaPower4 = (cosAlpha * cosAlpha * cosAlpha * cosAlpha);
  roughnessPower2 = (roughness * roughness);
  dividend       = (exp (-(pow (tanAlpha / roughness, 2.0))));
  divisor        = (distributionParameter * roughnessPower2 * cosAlphaPower4);
  roughnessTerm  = dividend / divisor;
  
  return roughnessTerm;
}

float beckmannDistributionVectorForm
(
  in float dotOfNormalAndHalfVector,
  in float roughness,
  in float distributionParameter
)
{
  float roughnessTerm;
  float dividend;
  float divisor;
  float dotOfNormalAndHalfVectorPower2;
  float dotOfNormalAndHalfVectorPower4;
  float roughnessPower2;                // m^2
  
  dotOfNormalAndHalfVectorPower2 = dotOfNormalAndHalfVector * dotOfNormalAndHalfVector;
  dotOfNormalAndHalfVectorPower4 = dotOfNormalAndHalfVectorPower2 * dotOfNormalAndHalfVectorPower2;
  roughnessPower2                = (roughness * roughness);
  dividend                       = exp ((dotOfNormalAndHalfVectorPower2 - 1.0) /
                                        roughnessPower2 * dotOfNormalAndHalfVectorPower2);
  divisor                        = distributionParameter * roughnessPower2 * dotOfNormalAndHalfVectorPower4;
  roughnessTerm                  = dividend / divisor;
  
  return roughnessTerm;
}

float blinnDistribution
(
  in float alpha,
  in float roughness,             // m
  in float distributionParameter  // c
)
{
  float roughnessTerm;
  
  roughnessTerm = distributionParameter * exp (-(pow (alpha / roughness, 2.0)));
  
  return roughnessTerm;
}

float torranceSparrowDistribution
(
  in float alpha,
  in float roughness,
  in float distributionParameter
)
{
  float roughnessTerm;
  float c2;
  float exponent;
  
  c2            = sqrt (2.0) / roughness;
  exponent      = (c2 * alpha);
  exponent      = exponent * exponent;
  
  roughnessTerm = exp (-exponent);
  /* Added by myself: Scaling by distributionParameter.
   * Analogous to "c" parameter in the Blinn distribution function.
   */
  roughnessTerm = distributionParameter * roughnessTerm;
  
  return roughnessTerm;
}

/*
 * distributionParameter replaces PI in
 *   -> "http://d.hatena.ne.jp/hanecci/20130511/p1"
 *      (see under section "(c) Trowbridge-Reitz (GGX) NDF").
 */
float trowbridgeReitzDistribution
(
  in float alpha,
  in float roughness,
  in float distributionParameter
)
{
  float roughnessTerm;
  
  float c3;
  float c3Power2;
  float termDivisor;
  float cosBetaPower2;
  float cosAlphaPower2;
  
  cosBetaPower2  = cos (roughness);
  cosBetaPower2  = (cosBetaPower2 * cosBetaPower2);
  c3             = (cosBetaPower2 - 1.0) / (cosBetaPower2 - sqrt (2.0));
  c3             = pow (c3, 1.0 / 2.0);
  c3Power2       = (c3 * c3);
  cosAlphaPower2 = cos (alpha);
  cosAlphaPower2 = (cosAlphaPower2 * cosAlphaPower2);
  termDivisor    = ((1.0 - c3Power2) * cosAlphaPower2 - 1.0);
  termDivisor    = distributionParameter * termDivisor;
  
  roughnessTerm = c3Power2 / termDivisor;
  
  return roughnessTerm;
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
