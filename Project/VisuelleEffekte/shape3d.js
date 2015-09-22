  
  // #FFAD42 = (255, 173, 66)
  var COLOR_BEIGE = [1.00000, 0.67843, 0.25882, 1.00000];
  var COLOR_BLACK = [0.00000, 0.00000, 0.00000, 1.00000];
  var COLOR_WHITE = [1.00000, 1.00000, 1.00000, 1.00000];
  
  
  //////////////////////////////////////////////////////////////////////
  // -- Implementation of the type "Transparency".                 -- //
  //////////////////////////////////////////////////////////////////////
  
  var Transparency = function ()
  {
    this.transparencyValue = 0.0;
  };
  
  Transparency.prototype.getTransparencyAsFloat = function ()
  {
    return this.transparencyValue;
  }
  
  Transparency.prototype.setTransparencyFromFloat = function (transparency)
  {
    this.transparencyValue = transparency;
  };
  
  Transparency.prototype.getShaderVariableSet = function ()
  {
    var shaderVariableSet = new ShaderVariableSet ();
    
    shaderVariableSet.setUniformVariableValue
    (
      "transparency",
      new UniformVariable1f (this.transparencyValue)
    );
    
    return shaderVariableSet;
  };
  
  
  //////////////////////////////////////////////////////////////////////
  // -- Implementation of the type "StraussParameters".            -- //
  //////////////////////////////////////////////////////////////////////
  
  // Interesting effect: metalness = 0.99, smoothness = 0.95.
  // Realistic   effect: metalness = 0.92, smoothness = 0.82.
  var StraussParameters = function ()
  {
    this.surfaceColor       = COLOR_BEIGE.slice ();   // c (cDiffuse)
    this.highlightBaseColor = COLOR_WHITE.slice ();   // C1
    this.metalness          = 0.50;
    this.smoothness         = 0.50;
    this.transparency       = 0.00;
    this.fresnelConstant    = 1.12;
    this.shadowConstant     = 1.01;
    this.offSpecularPeak    = 0.10;
  };
  
  StraussParameters.prototype.setMetalness = function (metalness)
  {
    this.metalness = metalness;
  };
  
  StraussParameters.prototype.setSmoothness = function (smoothness)
  {
    this.smoothness = smoothness;
  };
  
  StraussParameters.prototype.setTransparency = function (transparency)
  {
    this.transparency = transparency;
  };
  
  StraussParameters.prototype.setFresnelConstant = function (fresnelConstant)
  {
    this.fresnelConstant = fresnelConstant;
  };
  
  StraussParameters.prototype.setShadowConstant = function (shadowConstant)
  {
    this.shadowConstant = shadowConstant;
  };
  
  StraussParameters.prototype.setOffSpecularPeak = function (offSpecularPeak)
  {
    this.offSpecularPeak = offSpecularPeak;
  };
  
  StraussParameters.prototype.getShaderVariableSet = function ()
  {
    var shaderVariableSet = new ShaderVariableSet ();
    
    shaderVariableSet.setUniformVariableValue
    (
      "straussParameters.surfaceColor",
      new UniformVariable4fv (this.surfaceColor)
    );
    shaderVariableSet.setUniformVariableValue
    (
      "straussParameters.highlightBaseColor",
      new UniformVariable4fv (this.highlightBaseColor)
    );
    shaderVariableSet.setUniformVariableValue
    (
      "straussParameters.metalness",
      new UniformVariable1f (this.metalness)
    );
    shaderVariableSet.setUniformVariableValue
    (
      "straussParameters.smoothness",
      new UniformVariable1f (this.smoothness)
    );
    shaderVariableSet.setUniformVariableValue
    (
      "straussParameters.transparency",
      new UniformVariable1f (this.transparency)
    );
    shaderVariableSet.setUniformVariableValue
    (
      "straussParameters.fresnelConstant",
      new UniformVariable1f (this.fresnelConstant)
    );
    shaderVariableSet.setUniformVariableValue
    (
      "straussParameters.shadowConstant",
      new UniformVariable1f (this.shadowConstant)
    );
    shaderVariableSet.setUniformVariableValue
    (
      "straussParameters.offSpecularPeak",
      new UniformVariable1f (this.offSpecularPeak)
    );
    
    return shaderVariableSet;
  };
  
  
  //////////////////////////////////////////////////////////////////////
  // -- Implementation of the type "CookTorranceParameters".       -- //
  //////////////////////////////////////////////////////////////////////
  
  // Setting the last roughness parameter to 0.0 yields better results.
  // Interesting effect: roughnessParameters = [0.18, 0.72, 0.00]
  // Interesting effect: roughnessParameters = [2.00, 4.00, 0.00] => shining along silhouette (gets more intense with increasing z-roughness)
  // 
  // If using the Blinn distribution function, it is intersting to
  // know, that following combination yields similar results like the
  // Beckmann distribution.
  //   roughnessX = 5.5, roughnessY = 0.5, roughnessZ = 0.0
  var CookTorranceParameters = function ()
  {
    this.diffuseColor          = COLOR_BEIGE.slice ();
    this.specularColor         = COLOR_WHITE.slice ();
    this.emissiveColor         = COLOR_BLACK.slice ();
    this.roughness             = 0.5;
    this.distributionFunction  = 0;
    this.distributionParameter = 1.0;
    this.fresnelFunction       = 0;
    this.reflectionCoefficient = 1.0;   // For Fresnel term.
    this.specularTermScale     = 1.0;
  };
  
  CookTorranceParameters.BECKMANN_ORIGINAL_DISTRIBUTION = 0;
  CookTorranceParameters.BECKMANN_VECTOR_DISTRIBUTION   = 1;
  CookTorranceParameters.BLINN_DISTRIBUTION             = 2;
  CookTorranceParameters.TORRANCE_SPARROW_DISTRIBUTION  = 3;
  CookTorranceParameters.TROWBRIDGE_REITZ_DISTRIBUTION  = 4;
  
  CookTorranceParameters.FRESNEL_SCHLICK_NORMAL_LIGHT     = 0;
  CookTorranceParameters.FRESNEL_SCHLICK_NORMAL_VIEW      = 1;
  CookTorranceParameters.FRESNEL_SCHLICK_HALFVECTOR_LIGHT = 2;
  CookTorranceParameters.FRESNEL_SCHLICK_HALFVECTOR_VIEW  = 3;
  
  CookTorranceParameters.prototype.getShaderVariableSet = function ()
  {
    var shaderVariableSet = new ShaderVariableSet ();
    
    shaderVariableSet.setUniformVariableValue
    (
      "cookTorranceParameters.diffuseColor",
      new UniformVariable4fv (this.diffuseColor)
    );
    shaderVariableSet.setUniformVariableValue
    (
      "cookTorranceParameters.emissiveColor",
      new UniformVariable4fv (this.emissiveColor)
    );
    shaderVariableSet.setUniformVariableValue
    (
      "cookTorranceParameters.specularColor",
      new UniformVariable4fv (this.specularColor)
    );
    
    shaderVariableSet.setUniformVariableValue
    (
      "cookTorranceParameters.roughness",
      new UniformVariable1f (this.roughness)
    );
    
    shaderVariableSet.setUniformVariableValue
    (
      "cookTorranceParameters.distributionFunction",
      new UniformVariable1i (this.distributionFunction)
    );
    shaderVariableSet.setUniformVariableValue
    (
      "cookTorranceParameters.distributionParameter",
      new UniformVariable1f (this.distributionParameter)
    );
    
    shaderVariableSet.setUniformVariableValue
    (
      "cookTorranceParameters.fresnelFunction",
      new UniformVariable1i (this.fresnelFunction)
    );
    shaderVariableSet.setUniformVariableValue
    (
      "cookTorranceParameters.reflectionCoefficient",
      new UniformVariable1f (this.reflectionCoefficient)
    );
    
    shaderVariableSet.setUniformVariableValue
    (
      "cookTorranceParameters.specularTermScale",
      new UniformVariable1f (this.specularTermScale)
    );
    
    return shaderVariableSet;
  };
  
  
  //////////////////////////////////////////////////////////////////////
  // -- Implementation of the type "AnisotropicWardParameters".    -- //
  //////////////////////////////////////////////////////////////////////
  
  // Interesting effect if direction = [-1.00, -9.00, 10.00]
  // Interesting effect if direction = [ 5.00,  5.00,  5.00],
  //                       roughness = [ 0.04,  0.79]
  var AnisotropicWardParameters = function ()
  {
    //this.direction           = [0.0, 0.0, 1.0];
    this.direction           = [-1.0, -9.0, 10.0];
    //this.roughnessParameters  = [0.2, 0.2];
    this.roughnessParameters = [0.8, 0.1];
    this.ambientColor        = COLOR_BLACK.slice ();
    this.diffuseColor        = COLOR_BEIGE.slice ();
    this.emissiveColor       = COLOR_BLACK.slice ();
    this.specularColor       = COLOR_WHITE.slice ();
  };
  
  AnisotropicWardParameters.prototype.getShaderVariableSet = function ()
  {
    var shaderVariableSet = new ShaderVariableSet ();
    
    shaderVariableSet.setUniformVariableValue
    (
      "wardParameters.direction",
      new UniformVariable3fv (this.direction)
    );
    shaderVariableSet.setUniformVariableValue
    (
      "wardParameters.roughnessParameters",
      new UniformVariable2fv (this.roughnessParameters)
    );
    shaderVariableSet.setUniformVariableValue
    (
      "wardParameters.ambientColor",
      new UniformVariable4fv (this.ambientColor)
    );
    shaderVariableSet.setUniformVariableValue
    (
      "wardParameters.diffuseColor",
      new UniformVariable4fv (this.diffuseColor)
    );
    shaderVariableSet.setUniformVariableValue
    (
      "wardParameters.emissiveColor",
      new UniformVariable4fv (this.emissiveColor)
    );
    shaderVariableSet.setUniformVariableValue
    (
      "wardParameters.specularColor",
      new UniformVariable4fv (this.specularColor)
    );
    
    return shaderVariableSet;
  };
  
  
  //////////////////////////////////////////////////////////////////////
  // -- Implementation of the type "AshikhminShirleyParameters".   -- //
  //////////////////////////////////////////////////////////////////////
  
  var AshikhminShirleyParameters = function ()
  {
    this.referenceAxis      = [ 1.000,    0.000, 0.000];
    this.exponentialFactors = [10.000, 1000.000       ];
    this.diffuseColor       = COLOR_BEIGE.slice (0, 3);
    this.specularColor      = [ 0.500,    0.500, 0.500];
  };
  
  AshikhminShirleyParameters.prototype.getReferenceAxisAsFloatArray = function ()
  {
    return this.referenceAxis;
  };
  
  AshikhminShirleyParameters.prototype.setReferenceAxisFromFloats = function (x, y, z)
  {
    this.referenceAxis = [x, y, z];
  };
  
  AshikhminShirleyParameters.prototype.setExponentialFactorX = function (exponentialFactorX)
  {
    this.exponentialFactors[0] = exponentialFactorX;
  };
  
  AshikhminShirleyParameters.prototype.setExponentialFactorY = function (exponentialFactorY)
  {
    this.exponentialFactors[1] = exponentialFactorY;
  };
  
  AshikhminShirleyParameters.prototype.setDiffuseColorFromFloats = function (red, green, blue)
  {
    this.diffuseColor = [red, green, blue];
  };
  
  AshikhminShirleyParameters.prototype.setSpecularColorFromFloats = function (red, green, blue)
  {
    this.specularColor = [red, green, blue];
  };
  
  AshikhminShirleyParameters.prototype.getShaderVariableSet = function ()
  {
    var shaderVariableSet = new ShaderVariableSet ();
    
    shaderVariableSet.setUniformVariableValue
    (
      "ashikhminShirleyMaterial.referenceAxis",
      new UniformVariable3fv (this.referenceAxis)
    );
    shaderVariableSet.setUniformVariableValue
    (
      "ashikhminShirleyMaterial.exponentialFactors",
      new UniformVariable2fv (this.exponentialFactors)
    );
    shaderVariableSet.setUniformVariableValue
    (
      "ashikhminShirleyMaterial.diffuseColor",
      new UniformVariable3fv (this.diffuseColor)
    );
    shaderVariableSet.setUniformVariableValue
    (
      "ashikhminShirleyMaterial.specularColor",
      new UniformVariable3fv (this.specularColor)
    );
    
    return shaderVariableSet;
  };
  
  
  //////////////////////////////////////////////////////////////////////
  // -- Implementation of the type "SpecularMaterial".             -- //
  //////////////////////////////////////////////////////////////////////
  
  var SpecularMaterial = function ()
  {
    this.ambientColor      = COLOR_BLACK.slice ();
    this.ambientIntensity  = 1.0;
    this.diffuseColor      = COLOR_BLACK.slice ();
    this.emissiveColor     = COLOR_BLACK.slice ();
    this.specularColor     = COLOR_WHITE.slice ();
    this.specularIntensity = 1.0;
    this.shininess         = 100.5;
    this.enabled           = 1;
    this.type              = -1;
  };
  
  SpecularMaterial.TYPE_NONE        = -1;
  SpecularMaterial.TYPE_PHONG       =  0;
  SpecularMaterial.TYPE_BLINN_PHONG =  1;
  SpecularMaterial.TYPE_SCHLICK     =  2;
  SpecularMaterial.TYPE_GAUSS       =  3;
  
  SpecularMaterial.prototype.getShaderVariableSet = function ()
  {
    var shaderVariableSet = new ShaderVariableSet ();
    
    shaderVariableSet.setUniformVariableValue
    (
      "specularMaterial.ambientColor",
      new UniformVariable4fv (this.ambientColor)
    );
    shaderVariableSet.setUniformVariableValue
    (
      "specularMaterial.ambientIntensity",
      new UniformVariable1f (this.ambientIntensity)
    );
    shaderVariableSet.setUniformVariableValue
    (
      "specularMaterial.diffuseColor",
      new UniformVariable4fv (this.diffuseColor)
    );
    shaderVariableSet.setUniformVariableValue
    (
      "specularMaterial.emissiveColor",
      new UniformVariable4fv (this.emissiveColor)
    );
    shaderVariableSet.setUniformVariableValue
    (
      "specularMaterial.specularColor",
      new UniformVariable4fv (this.specularColor)
    );
    shaderVariableSet.setUniformVariableValue
    (
      "specularMaterial.specularIntensity",
      new UniformVariable1f (this.specularIntensity)
    );
    shaderVariableSet.setUniformVariableValue
    (
      "specularMaterial.shininess",
      new UniformVariable1f (this.shininess)
    );
    shaderVariableSet.setUniformVariableValue
    (
      "specularMaterial.enabled",
      new UniformVariable1i (this.enabled)
    );
    shaderVariableSet.setUniformVariableValue
    (
      "specularMaterial.type",
      new UniformVariable1i (this.type)
    );
    
    return shaderVariableSet;
  };
  
  
  //////////////////////////////////////////////////////////////////////
  // -- Implementation of the type "LommelSeeligerParameters".     -- //
  //////////////////////////////////////////////////////////////////////
  
  var LommelSeeligerParameters = function ()
  {
    this.diffuseColor     = COLOR_BEIGE.slice ();
    this.diffuseBias      = 0.0;
    this.diffuseScale     = 1.0;
    this.diffuseExponent  = 1.0;
    this.specularMaterial = new SpecularMaterial ();
  };
  
  LommelSeeligerParameters.prototype.getShaderVariableSet = function ()
  {
    var shaderVariableSet = new ShaderVariableSet ();
    
    shaderVariableSet.setUniformVariableValue
    (
      "lommelSeeligerParameters.diffuseColor",
      new UniformVariable4fv (this.diffuseColor)
    );
    shaderVariableSet.setUniformVariableValue
    (
      "lommelSeeligerParameters.diffuseBias",
      new UniformVariable1f (this.diffuseBias)
    );
    shaderVariableSet.setUniformVariableValue
    (
      "lommelSeeligerParameters.diffuseScale",
      new UniformVariable1f (this.diffuseScale)
    );
    shaderVariableSet.setUniformVariableValue
    (
      "lommelSeeligerParameters.diffuseExponent",
      new UniformVariable1f (this.diffuseExponent)
    );
    
    shaderVariableSet.copyEntriesOfOtherSet (this.specularMaterial.getShaderVariableSet ());
    
    return shaderVariableSet;
  };
  
  
  //////////////////////////////////////////////////////////////////////
  // -- Implementation of the type "OrenNayarParameters".          -- //
  //////////////////////////////////////////////////////////////////////
  
  var OrenNayarParameters = function ()
  {
    this.diffuseColor        = COLOR_BEIGE.slice ();
    this.roughness           = 0.5;
    this.diffuseTermFunction = 0;
    this.useInterreflection  = false;
    this.specularMaterial    = new SpecularMaterial ();
  };
  
  OrenNayarParameters.prototype.getShaderVariableSet = function ()
  {
    var shaderVariableSet = new ShaderVariableSet ();
    
    shaderVariableSet.setUniformVariableValue
    (
      "orenNayarParameters.diffuseColor",
      new UniformVariable4fv (this.diffuseColor)
    );
    shaderVariableSet.setUniformVariableValue
    (
      "orenNayarParameters.roughness",
      new UniformVariable1f (this.roughness)
    );
    shaderVariableSet.setUniformVariableValue
    (
      "orenNayarParameters.diffuseTermFunction",
      new UniformVariable1i (this.diffuseTermFunction)
    );
    
    if (this.useInterreflection)
    {
      shaderVariableSet.setUniformVariableValue
      (
        "orenNayarParameters.useInterreflection",
        new UniformVariable1i (1)
      );
    }
    else
    {
      shaderVariableSet.setUniformVariableValue
      (
        "orenNayarParameters.useInterreflection",
        new UniformVariable1i (0)
      );
    }
    
    shaderVariableSet.copyEntriesOfOtherSet (this.specularMaterial.getShaderVariableSet ());
    
    return shaderVariableSet;
  };
  
  
  //////////////////////////////////////////////////////////////////////
  // -- Implementation of the type "MinnaertParameters".           -- //
  //////////////////////////////////////////////////////////////////////
  
  var MinnaertParameters = function ()
  {
    this.diffuseColor        = COLOR_BEIGE.slice ();
    this.roughness           = 0.5;
    this.specularMaterial    = new SpecularMaterial ();
  };
  
  MinnaertParameters.prototype.getShaderVariableSet = function ()
  {
    var shaderVariableSet = new ShaderVariableSet ();
    
    shaderVariableSet.setUniformVariableValue
    (
      "minnaertParameters.diffuseColor",
      new UniformVariable4fv (this.diffuseColor)
    );
    shaderVariableSet.setUniformVariableValue
    (
      "minnaertParameters.roughness",
      new UniformVariable1f (this.roughness)
    );
    
    shaderVariableSet.copyEntriesOfOtherSet (this.specularMaterial.getShaderVariableSet ());
    
    return shaderVariableSet;
  };
  
  
  //////////////////////////////////////////////////////////////////////
  // -- Implementation of the type "LambertParameters".            -- //
  //////////////////////////////////////////////////////////////////////
  
  var LambertParameters = function ()
  {
    this.diffuseColor        = COLOR_BEIGE.slice ();
    this.specularMaterial    = new SpecularMaterial ();
  };
  
  LambertParameters.prototype.getShaderVariableSet = function ()
  {
    var shaderVariableSet = new ShaderVariableSet ();
    
    shaderVariableSet.setUniformVariableValue
    (
      "lambertParameters.diffuseColor",
      new UniformVariable4fv (this.diffuseColor)
    );
    
    shaderVariableSet.copyEntriesOfOtherSet (this.specularMaterial.getShaderVariableSet ());
    
    return shaderVariableSet;
  };
  
  
  //////////////////////////////////////////////////////////////////////
  // -- Implementation of the type "GoochParameters".              -- //
  //////////////////////////////////////////////////////////////////////
  
  var GoochParameters = function ()
  {
    this.surfaceColor          = COLOR_WHITE.slice ();
    this.coolColor             = [0.0, 0.0, 1.0, 1.0];
    this.warmColor             = [1.0, 0.0, 0.0, 1.0];
    this.coolMixValue          = 0.5;
    this.warmMixValue          = 0.5;
    this.colorBlendingEquation = 0;
    this.ambientTermFormula    = 0;
    this.specularMaterial      = new SpecularMaterial ();
  };
  
  GoochParameters.prototype.getShaderVariableSet = function ()
  {
    var shaderVariableSet = new ShaderVariableSet ();
    
    shaderVariableSet.setUniformVariableValue
    (
      "goochParameters.surfaceColor",
      new UniformVariable4fv (this.surfaceColor)
    );
    shaderVariableSet.setUniformVariableValue
    (
      "goochParameters.coolColor",
      new UniformVariable4fv (this.coolColor)
    );
    shaderVariableSet.setUniformVariableValue
    (
      "goochParameters.warmColor",
      new UniformVariable4fv (this.warmColor)
    );
    shaderVariableSet.setUniformVariableValue
    (
      "goochParameters.coolMixValue",
      new UniformVariable1f (this.coolMixValue)
    );
    shaderVariableSet.setUniformVariableValue
    (
      "goochParameters.warmMixValue",
      new UniformVariable1f (this.warmMixValue)
    );
    shaderVariableSet.setUniformVariableValue
    (
      "goochParameters.colorBlendingEquation",
      new UniformVariable1i (this.colorBlendingEquation)
    );
    shaderVariableSet.setUniformVariableValue
    (
      "goochParameters.ambientTermFormula",
      new UniformVariable1i (this.ambientTermFormula)
    );
    
    shaderVariableSet.copyEntriesOfOtherSet (this.specularMaterial.getShaderVariableSet ());
    
    return shaderVariableSet;
  };
  
  
  //////////////////////////////////////////////////////////////////////
  // -- Implementation of the type "GammaCorrection".              -- //
  //////////////////////////////////////////////////////////////////////
  
  var GammaCorrection = function ()
  {
    this.enabled = false;
  };
  
  GammaCorrection.prototype.getShaderVariableSet = function ()
  {
    var shaderVariableSet = new ShaderVariableSet ();
    var enabledIdentifier = 0;
    
    if (this.enabled)
    {
      enabledIdentifier = 1;
    }
    else
    {
      enabledIdentifier = 0;
    }
    
    shaderVariableSet.setUniformVariableValue
    (
      "gammaCorrection.enabled",
      new UniformVariable1i (enabledIdentifier)
    );
    
    return shaderVariableSet;
  };
  
  
  //////////////////////////////////////////////////////////////////////
  // -- Implementation of the type "FresnelParameters".            -- //
  //////////////////////////////////////////////////////////////////////
  
  var FresnelParameters = function ()
  {
    this.bias    = 0.0;
    this.scale   = 1.0;
    this.power   = 1.0;
    this.color   = COLOR_WHITE.slice ();
    this.enabled = false;
  };
  
  FresnelParameters.prototype.getShaderVariableSet = function ()
  {
    var shaderVariableSet = new ShaderVariableSet ();
    var enabledIdentifier = 0;
    
    if (this.enabled)
    {
      enabledIdentifier = 1;
    }
    else
    {
      enabledIdentifier = 0;
    }
    
    shaderVariableSet.setUniformVariableValue
    (
      "fresnelParameters.bias",
      new UniformVariable1f (this.bias)
    );
    shaderVariableSet.setUniformVariableValue
    (
      "fresnelParameters.scale",
      new UniformVariable1f (this.scale)
    );
    shaderVariableSet.setUniformVariableValue
    (
      "fresnelParameters.power",
      new UniformVariable1f (this.power)
    );
    shaderVariableSet.setUniformVariableValue
    (
      "fresnelParameters.color",
      new UniformVariable4fv (this.color)
    );
    shaderVariableSet.setUniformVariableValue
    (
      "fresnelParameters.enabled",
      new UniformVariable1i (enabledIdentifier)
    );
    
    return shaderVariableSet;
  };
  
  
  //////////////////////////////////////////////////////////////////////
  // -- Implementation of the type "Texturing".                    -- //
  //////////////////////////////////////////////////////////////////////
  
  var Texturing = function ()
  {
    this.enabled = false;
    this.mode    = 0;
  };
  
  Texturing.MODE_REPLACE = 0;
  Texturing.MODE_BLEND   = 1;
  Texturing.MODE_ADD     = 2;
  
  Texturing.prototype.getShaderVariableSet = function ()
  {
    var shaderVariableSet = new ShaderVariableSet ();
    var enabledIdentifier = 0;
    
    if (this.enabled)
    {
      enabledIdentifier = 1;
    }
    else
    {
      enabledIdentifier = 0;
    }
    
    shaderVariableSet.setUniformVariableValue
    (
      "texturing.enabled",
      new UniformVariable1i (enabledIdentifier)
    );
    shaderVariableSet.setUniformVariableValue
    (
      "texturing.mode",
      new UniformVariable1i (this.mode)
    );
    
    return shaderVariableSet;
  };
  
  
  //////////////////////////////////////////////////////////////////////
  // -- Implementation of the type "Shape3D".                      -- //
  //////////////////////////////////////////////////////////////////////
  
  var Shape3D = function ()
  {
    this.name                       = null;
    this.geometry                   = null;
    this.appearance                 = new Appearance              ();
    this.transformation             = VecMath.SFMatrix4f.identity ();
    this.positionBuffer             = null;
    this.textureBuffer              = null;
    this.positionAttribName         = "vertex";
    this.transformAttribName        = null;
    this.shapeListeners             = [];
    this.behaviors                  = [];
    this.transparency               = new Transparency               ();
    this.straussParameters          = new StraussParameters          ();
    this.cookTorranceParameters     = new CookTorranceParameters     ();
    this.wardParameters             = new AnisotropicWardParameters  ();
    this.ashikhminShirleyParameters = new AshikhminShirleyParameters ();
    this.lommelSeeligerParameters   = new LommelSeeligerParameters   ();
    this.orenNayarParameters        = new OrenNayarParameters        ();
    this.minnaertParameters         = new MinnaertParameters         ();
    this.lambertParameters          = new LambertParameters          ();
    this.goochParameters            = new GoochParameters            ();
    this.gammaCorrection            = new GammaCorrection            ();
    this.fresnelParameters          = new FresnelParameters          ();
    this.texturing                  = new Texturing                  ();
    
    this.appearance.addAppearanceListener (this);
    
    /*
    // ------------> EXAMPLARY TRANSFORMATION //
    var axisOfRotation    = new VecMath.SFVec3f (0.0, 1.0, 0.0);
    var rotationAngle     = Math.PI * 1.25;
    var quaternion        = VecMath.Quaternion.axisAngle   (axisOfRotation, rotationAngle);
    var rotationMatrix    = quaternion.toMatrix            ();
    var scalingMatrix     = VecMath.SFMatrix4f.scale       (new VecMath.SFVec3f ( 0.9,  0.9, 0.9));
    var translationMatrix = VecMath.SFMatrix4f.translation (new VecMath.SFVec3f (-1.0, -0.4, 0.0));
    this.setTransformation (this.getTransformation ().mult (rotationMatrix)
                                                     .mult (scalingMatrix)
                                                     .mult (translationMatrix));
    */
    ////////////////////////////////////////////////////////////////////
  };
  
  Shape3D.prototype.getName = function ()
  {
    return this.name;
  };
  
  Shape3D.prototype.setName = function (name)
  {
    this.name = name;
  };
  
  Shape3D.prototype.setGeometry = function (geometry)
  {
    this.geometry = geometry;
  };
  
  Shape3D.prototype.getAppearance = function ()
  {
    return this.appearance;
  };
  
  Shape3D.prototype.setAppearance = function (appearance)
  {
    this.appearance = appearance;
    
    if (this.appearance != null)
    {
      this.appearance.addAppearanceListener (this);
    }
    //this.fireShapeUpdatedEvent ();
  };
  
  Shape3D.prototype.getTransformation = function ()
  {
    return this.transformation;
  };
  
  Shape3D.prototype.setTransformation = function (transformation)
  {
    this.transformation = transformation;
    
    this.appearance.getShaderVariableSet ().setUniformVariableValue
    (
      "modelMatrix",
      new UniformVariableMatrix4fv (this.transformation.toGL ())
    );
    
    this.fireShapeUpdatedEvent ();
  };
  
  Shape3D.prototype.addBehavior = function (behavior)
  {
    if (behavior != null)
    {
      this.behaviors.push (behavior);
    }
  };
  
  Shape3D.prototype.setPositionAttributeName = function (attributeName)
  {
    this.positionAttribName = attributeName;
  };
  
  Shape3D.prototype.setTransformAttributeName = function (attributeName)
  {
    this.transformAttribName = attributeName;
  };
  
  Shape3D.prototype.addShapeListener = function (listener)
  {
    this.shapeListeners.push (listener);
  };
  
  Shape3D.prototype.fireShapeUpdatedEvent = function ()
  {
    var firingShape3D      = this;
    var shapeListenerCount = this.shapeListeners.length;
    
    for (var listenerIndex = 0; listenerIndex < shapeListenerCount; listenerIndex++)
    {
      var listener = this.shapeListeners[listenerIndex];
      
      if ((listener != null) && (listener["shapeUpdated"] != null))
      {
        listener.shapeUpdated (firingShape3D);
      }
    }
  };
  
  Shape3D.prototype.appearanceUpdated = function ()
  {
    this.fireShapeUpdatedEvent ();
  };
  
  Shape3D.prototype.init = function (renderingContext)
  {
    var gl            = renderingContext.getGL ();
    var shaderProgram = null;
    
    shaderProgram = this.appearance.getShaderProgram ();
    shaderProgram.initialize (renderingContext);
    
    if (this.appearance.texture2D != null)
    {
      this.appearance.texture2D.initialize (gl);
    }
    
    this.geometry.initialize (renderingContext);
    
    for (var behaviorIndex = 0; behaviorIndex < this.behaviors.length;
             behaviorIndex++)
    {
      var behavior = this.behaviors[behaviorIndex];
      
      if (behavior != null)
      {
        behavior.initialize ();
      }
    }
  };
  
  Shape3D.prototype.draw = function (renderingContext)
  {
    var gl                = renderingContext.getGL               ();
    var shaderProgram     = this.appearance.getShaderProgram     ();
    var shaderVariableSet = this.appearance.getShaderVariableSet ();
    
    this.texturing.enabled = this.appearance.texture2D.enabled;
    
    shaderVariableSet.copyEntriesOfOtherSet (this.transparency.getShaderVariableSet               ());
    shaderVariableSet.copyEntriesOfOtherSet (this.straussParameters.getShaderVariableSet          ());
    shaderVariableSet.copyEntriesOfOtherSet (this.cookTorranceParameters.getShaderVariableSet     ());
    shaderVariableSet.copyEntriesOfOtherSet (this.wardParameters.getShaderVariableSet             ());
    shaderVariableSet.copyEntriesOfOtherSet (this.ashikhminShirleyParameters.getShaderVariableSet ());
    shaderVariableSet.copyEntriesOfOtherSet (this.lommelSeeligerParameters.getShaderVariableSet   ());
    shaderVariableSet.copyEntriesOfOtherSet (this.orenNayarParameters.getShaderVariableSet        ());
    shaderVariableSet.copyEntriesOfOtherSet (this.minnaertParameters.getShaderVariableSet         ());
    shaderVariableSet.copyEntriesOfOtherSet (this.lambertParameters.getShaderVariableSet          ());
    shaderVariableSet.copyEntriesOfOtherSet (this.goochParameters.getShaderVariableSet            ());
    shaderVariableSet.copyEntriesOfOtherSet (this.gammaCorrection.getShaderVariableSet            ());
    shaderVariableSet.copyEntriesOfOtherSet (this.fresnelParameters.getShaderVariableSet          ());
    shaderVariableSet.copyEntriesOfOtherSet (this.texturing.getShaderVariableSet                  ());
    
    shaderVariableSet.bindToContext (renderingContext, this.appearance.getShaderProgram ());
    
    var attribLocationMap =
    {
      positionAttrib  : shaderProgram.getAttributeVariableByName ("vertex"),
      normalAttrib    : shaderProgram.getAttributeVariableByName ("normal"),
      colorAttrib     : shaderProgram.getAttributeVariableByName ("color"),
      texCoordsAttrib : shaderProgram.getAttributeVariableByName ("texCoords"),
      tangentAttrib   : shaderProgram.getAttributeVariableByName ("tangent")
    };
    
    if (this.appearance.texture2D != null)
    {
      this.appearance.texture2D.prepareForDrawing (gl);
    }
    
    this.geometry.draw (gl, attribLocationMap);
    
    if (this.appearance.texture2D != null)
    {
      this.appearance.texture2D.prepareAfterDrawing (gl);
    }
  };
  
  Shape3D.prototype.getBoundingBox = function ()
  {
    var boundingBox    = null;
    var geometryPoints = null;
    
    boundingBox    = new BoundingBox ();
    geometryPoints = this.geometry.getCompletePoint3DArray ();
    
    for (var pointIndex = 0; pointIndex < geometryPoints.length;
             pointIndex++)
    {
      var originalPoint    = geometryPoints[pointIndex];
      var transformedPoint = originalPoint.getTransformed (this.transformation);
      
      geometryPoints[pointIndex] = transformedPoint;
    }
    
    boundingBox.setFromPoint3DArray (geometryPoints);
    
    return boundingBox;
  };
  
  Shape3D.prototype.getMidpoint = function ()
  {
    var point3D     = new Point3D         ();
    var boundingBox = this.getBoundingBox ();
    
    point3D.setX (boundingBox.midpointX);
    point3D.setY (boundingBox.midpointY);
    point3D.setZ (boundingBox.midpointZ);
    
    return point3D;
  };
  