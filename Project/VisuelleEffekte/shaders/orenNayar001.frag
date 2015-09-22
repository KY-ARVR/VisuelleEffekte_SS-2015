// 02.09.2015
// 
// -> "Advanced Lighting and Materials with Shaders",
//     page 97-99   (physics)
//     page 138-142 (implementation)
// -> "http://www.gamasutra.com/view/feature/131269/implementing_modular_hlsl_with_.php?page=3"
// -> "http://content.gpwiki.org/D3DBook:%28Lighting%29_Oren-Nayar"
// -> "http://ruh.li/GraphicsOrenNayar.html"
// -> "https://lonalwah.wordpress.com/2013/11/29/oren-nayar-reflectance-diffuse-getting-rough/"


precision highp float;

#define DIFFUSE_TERM_FUNCTION_KELLY_VIALE      0
#define DIFFUSE_TERM_FUNCTION_ENGEL_COMPLEX    1
#define DIFFUSE_TERM_FUNCTION_ENGEL_SIMPLIFIED 2

#define PI 3.14159


struct OrenNayarParameters
{
  vec4  diffuseColor;
  float roughness;
  int   diffuseTermFunction;
  int   useInterreflection;
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

struct OrenNayarCalculationResults
{
  float roughnessPower2;                // roughness * roughness
  float irradiance;                     // max(0.0, NdotL)
  float dotOfDifferenceVectors;         // gamma
  float angleDifference;                // max(0.0, gamma)
  float alpha;
  float beta;
  float termA;                          // Usually "A"
  float termB;                          // Usually "B"
};


const     int         NUMBER_OF_LIGHTS = 3;

uniform   vec3        eyePosition;
uniform   LightSource lights[NUMBER_OF_LIGHTS];
//uniform   Material    material;
uniform   float       transparency;
uniform   float       roughness;
uniform   Fog         fog;

uniform OrenNayarParameters orenNayarParameters;
uniform SpecularMaterial    specularMaterial;
uniform GammaCorrection     gammaCorrection;
uniform FresnelParameters   fresnelParameters;
uniform Texturing           texturing;
uniform sampler2D           texture;

varying   vec3        varyingColor;
varying   vec2        varyingTexCoords;
varying   vec3        fragmentPosition;
varying   vec3        fragmentNormal;
varying   float       fragmentToEyeDistance;



void  main                (void);
float getTotalAttenuation (in LightSource lightSource,
                           in vec3 surfaceToLightVector);
float getOrenNayarDiffuseTermByDempskiAndViale
(
  in OrenNayarCalculationResults calculationResults
);
float getComplexOrenNayarDiffuseTermByEngel
(
  in OrenNayarCalculationResults calculationResults
);
float getSimplifiedOrenNayarDiffuseTermByEngel
(
  in OrenNayarCalculationResults calculationResults
);
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
  
  int   diffuseTermFunction;
  int   useInterreflection;
  int   normalizeDifferenceVectors;
  
  fragmentColor      = vec4      (0.0, 0.0, 0.0, 1.0);
  eyePosition        = vec3      (0.0, 0.0, 0.0);
  surfaceToEyeVector = normalize (eyePosition - fragmentPosition);
  surfaceNormal      = normalize (fragmentNormal);
  dotOfNormalAndEye  = dot (surfaceNormal, surfaceToEyeVector);
  // NOT CLAMPING THIS DOT PRODUCT LEADS TO WHITE POINTS AROUND EDGE!
  dotOfNormalAndEye  = max (0.0,           dotOfNormalAndEye);
  
  diffuseColor       = orenNayarParameters.diffuseColor;
  
  if (texturing.enabled == 1)
  {
    diffuseColor = texture2D (texture, varyingTexCoords);
    
    if (texturing.mode == 1)
    {
      diffuseColor = diffuseColor * orenNayarParameters.diffuseColor;
    }
    else if (texturing.mode == 2)
    {
      diffuseColor = diffuseColor + orenNayarParameters.diffuseColor;
    }
  }
  
  diffuseTermFunction        = orenNayarParameters.diffuseTermFunction;
  useInterreflection         = orenNayarParameters.useInterreflection;
  normalizeDifferenceVectors = 1;
  
  
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
    
    OrenNayarCalculationResults calculationResults;
    
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
    // QUESTION: DOES NOT CLAMPING THIS DOT PRODUCT LEAD TO WHITE POINTS AROUND EDGES?
    //dotOfNormalAndLight = max (0.0,           dotOfNormalAndLight);
    
    
    
    float irradiance;                   // max(0.0, NdotL)
    float angleBetweenEyeAndNormal;
    float angleBetweenLightAndNormal;
    // In source: normalize(VertexToEye - InVertex.Normal)
    vec3  differenceVectorNormalToEye;
    // In source: normalize(LightVector - InVertex.Normal)
    vec3  differenceVectorNormalToLight;
    float dotOfDifferenceVectors;       // gamma
    float angleDifference;
    float alpha;
    float beta;
    //vec4  diffuseComponent;
    float roughnessPower2;
    float termA;                        // A  (C1)
    float termB;                        // B  (C2)
    
    irradiance = max (0.0, dotOfNormalAndLight);
    
    angleBetweenEyeAndNormal   = acos (dotOfNormalAndEye);
    angleBetweenLightAndNormal = acos (dotOfNormalAndLight);
    
    //differenceVectorNormalToEye   = normalize (surfaceToEyeVector   - surfaceNormal * dotOfNormalAndEye);
    //differenceVectorNormalToLight = normalize (surfaceToLightVector - surfaceNormal * dotOfNormalAndLight);
    
    differenceVectorNormalToEye   = (surfaceToEyeVector   - surfaceNormal * dotOfNormalAndEye);
    differenceVectorNormalToLight = (surfaceToLightVector - surfaceNormal * dotOfNormalAndLight);
    
    if (normalizeDifferenceVectors == 1)
    {
      differenceVectorNormalToEye   = normalize (differenceVectorNormalToEye);
      differenceVectorNormalToLight = normalize (differenceVectorNormalToLight);
    }
    
    dotOfDifferenceVectors = dot (differenceVectorNormalToEye, differenceVectorNormalToLight);
    angleDifference        = max (0.0, dotOfDifferenceVectors);
    
    alpha = max (angleBetweenEyeAndNormal, angleBetweenLightAndNormal);
    beta  = min (angleBetweenEyeAndNormal, angleBetweenLightAndNormal);
    
    roughnessPower2 = orenNayarParameters.roughness * orenNayarParameters.roughness;
    
    // Value of 0.57 instead of 0.33 proposed by source -> "http://ruh.li/GraphicsOrenNayar.html".
    termA = 1.0 - 0.50 * (roughnessPower2 / (roughnessPower2 + 0.33));
    termB =       0.45 * (roughnessPower2 / (roughnessPower2 + 0.09));
    
    calculationResults = OrenNayarCalculationResults
    (
      roughnessPower2,
      irradiance,
      dotOfDifferenceVectors,
      angleDifference,
      alpha,
      beta,
      termA,
      termB
    );
    
    
    if (diffuseTermFunction == DIFFUSE_TERM_FUNCTION_KELLY_VIALE)
    {
      diffuseTerm = getOrenNayarDiffuseTermByDempskiAndViale (calculationResults);
    }
    else if (diffuseTermFunction == DIFFUSE_TERM_FUNCTION_ENGEL_COMPLEX)
    {
      diffuseTerm = getComplexOrenNayarDiffuseTermByEngel (calculationResults);
    }
    else
    {
      diffuseTerm = getSimplifiedOrenNayarDiffuseTermByEngel (calculationResults);
    }
    
    
    /*
    // Formula from -> "http://www.gamasutra.com/view/feature/131269/implementing_modular_hlsl_with_.php?page=3"
    // 
    // Potential problem: Does not use dotOfDifferenceVectors (= gamma)?
    // 
    // Results:
    //  - very bad: are repeated inside of object
    //  - bright points around edge, because of UNCLAMPED dotOfNormalAndLight
    //  - formula probably NOT CORRECT!
    // 
    // Results, if no gamma (dotOfDifferenceVectors) branching:
    //  - leads to strange "circle" of differing light (if orange: circle is green); becomes worse with interreflection
    //  - probably NOT very realistic
    
    float A = termA;
    float B = termB;
    
    if (dotOfDifferenceVectors >= 0)
    {
      B = B * sin (alpha) * tan (beta);
    }
    else
    {
      B = 0.0;
    }
    
    diffuseTerm = dotOfNormalAndLight * (A + B);
    */
    
    /******************************************************************/
    
    
    // From -> "http://ruh.li/GraphicsOrenNayar.html":
    // (Oren/Nayar treatise of interreflections: -> "http://www1.cs.columbia.edu/CAVE/publications/pdfs/Oren_SIGGRAPH94.pdf", page 5)
    // interreflection = L2.
    // 
    // Results:
    //  - brighter (colors more lively).
    
    if (useInterreflection == 1)
    {
      float interreflection;
      float twoBetaDividedByPi;
      
      twoBetaDividedByPi = (2.0 * beta / PI);
      interreflection    = 0.17 * max (0.0, dotOfNormalAndLight)
                                * (roughnessPower2 / (roughnessPower2 + 0.13))
                                * (1.0 - dotOfDifferenceVectors * twoBetaDividedByPi * twoBetaDividedByPi);
      diffuseTerm = diffuseTerm + interreflection;
    }
    
    
    diffuseComponent = lightDiffuseColor
                       * diffuseColor
                       * diffuseTerm;
    
    
    
    /*
    diffuseTerm         =  dotOfNormalAndLight /
                          (dotOfNormalAndLight + dotOfNormalAndEye);
    // Added by myself.
    diffuseTerm         = lommelSeeligerParameters.diffuseBias
                          + pow (diffuseTerm, lommelSeeligerParameters.diffuseExponent);
    
    diffuseComponent    = lightDiffuseColor
                          * vec4 (diffuseColor.rgb, 1.0)
                          * diffuseTerm;
    */
    
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
  
  if (gammaCorrection.enabled == 1)
  {
    //fragmentColor = pow (fragmentColor, vec4 (1.0 / 2.2));
    fragmentColor.rgb = pow (fragmentColor.rgb, vec3 (1.0 / 2.2));
  }
  
  // Do not forget: Only use RGB color components of the emissive color.
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


// Formula from -> "Advanced Lighting and Materials with Shaders".
float getOrenNayarDiffuseTermByDempskiAndViale
(
  in OrenNayarCalculationResults calculationResults
)
{
  float diffuseTerm;
  float irradiance;
  float angleDifference;
  float alpha;
  float beta;
  float termA;
  float termB;
  
  irradiance      = calculationResults.irradiance;
  angleDifference = calculationResults.angleDifference;
  alpha           = calculationResults.alpha;
  beta            = calculationResults.beta;
  termA           = calculationResults.termA;
  termB           = calculationResults.termB;
  
  diffuseTerm = (termA + termB * angleDifference
                               * sin (alpha)
                               * tan (beta))
                * irradiance;
  
  return diffuseTerm;
}

/* Formula from "http://content.gpwiki.org/D3DBook:%28Lighting%29_Oren-Nayar"
 *         (and "http://ruh.li/GraphicsOrenNayar.html")
 * (complex model, that is, code function "float4 psOrenNayarComplex( in VS_OUTPUT f ) : SV_TARGET { ... }")
 * 
 * 
 * Conventions:
 *   gamma            = dotOfDifferenceVectors
 *   max (0.0, gamma) = angleDifference
 * 
 * 
 * Results:
 *  - darker
 *  - less "specular" (saturated, lively) colors
 *  - rougher
 *  - more like clothes/fabric
 */
// Influence of gamma (= dotOfDifferenceVectors):
//  - smooth gradient from dark to light areas (no "swinging" of dark-light areas inside of object)
//  - thus, more realistic
// 
// gamma = dotOfDifferenceVectors = cos(phi_r - phi_i)
// Results of vectors being normalized:
//  - Smoother transition of dark to light (intense) regions
//  - dark regions end sooner (are shorter)
//  - looks a little bit "flatter".
float getComplexOrenNayarDiffuseTermByEngel
(
  in OrenNayarCalculationResults calculationResults
)
{
  float diffuseTerm;
  float irradiance;
  float dotOfDifferenceVectors;
  float angleDifference;
  float alpha;
  float beta;
  float termA;
  float termB;
  float roughnessPower2;
  
  irradiance             = calculationResults.irradiance;
  dotOfDifferenceVectors = calculationResults.dotOfDifferenceVectors;
  angleDifference        = calculationResults.angleDifference;
  alpha                  = calculationResults.alpha;
  beta                   = calculationResults.beta;
  termA                  = calculationResults.termA;
  termB                  = calculationResults.termB;
  roughnessPower2        = calculationResults.roughnessPower2;
  
  if (dotOfDifferenceVectors >= 0.0)
  {
    termB = termB * sin (alpha);
  }
  else
  {
    termB = termB * (sin (alpha) - pow ((2.0 * beta) / PI, 3.0));
  }
  
  float c1 = termA;
  float c2 = termB;
  float c3 = (1.0 / 8.0) * (roughnessPower2 / (roughnessPower2 + 0.09))
                         * pow ((4.0 * alpha * beta) / (PI * PI), 2.0);
  
  float A = dotOfDifferenceVectors * c2 * tan (beta);
  float B = (1.0 - abs (dotOfDifferenceVectors)) * c3 * tan ((alpha + beta) / 2.0);
  
  diffuseTerm = irradiance * (c1 + A + B);
  
  return diffuseTerm;
}

////////////////////////////////////////////////////////////////////
////////// SIMPLIFIED FORM                                    //////
// Simplified form from -> "http://content.gpwiki.org/D3DBook:%28Lighting%29_Oren-Nayar"
//                         (code section "float4 psOrenNayarSimple")
//           also under -> "https://lonalwah.wordpress.com/2013/11/29/oren-nayar-reflectance-diffuse-getting-rough/"
// 
// Note: dotOfNormalAndLight replaced by max (0.0, dotOfNormalAndLight).
float getSimplifiedOrenNayarDiffuseTermByEngel
(
  in OrenNayarCalculationResults calculationResults
)
{
  float diffuseTerm;
  float irradiance;
  float dotOfDifferenceVectors;
  float angleDifference;
  float alpha;
  float beta;
  float termA;
  float termB;
  float roughnessPower2;
  
  irradiance             = calculationResults.irradiance;
  dotOfDifferenceVectors = calculationResults.dotOfDifferenceVectors;
  angleDifference        = calculationResults.angleDifference;
  alpha                  = calculationResults.alpha;
  beta                   = calculationResults.beta;
  termA                  = calculationResults.termA;
  termB                  = calculationResults.termB;
  roughnessPower2        = calculationResults.roughnessPower2;
  
  float A = termA;
  float B = termB;
  
  // Sometimes formulated with C term: C = sin(alpha) * tan(beta)
  // Can be substituted: angleDifference = max(0.0, dotOffDifferenceVectors)
  diffuseTerm = irradiance * (A + B * max (0.0, dotOfDifferenceVectors) * sin (alpha) * tan (beta));
  
  // OWN EXPERIMENTS: Replace irradiance by constant(s).
  //diffuseTerm = clamp ((0.5 * (A + B * max (0.0, dotOfDifferenceVectors) * sin (alpha) * tan (beta))), 0.0, 1.0);
  //diffuseTerm = clamp (1.0 - (0.5 * (A + B * max (0.0, dotOfDifferenceVectors) * sin (alpha) * tan (beta))), 0.5, 0.7);
  
  return diffuseTerm;
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

