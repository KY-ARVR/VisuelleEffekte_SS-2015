  //////////////////////////////////////////////////////////////////////
  // -- Implementation of the type "Light".                        -- //
  //////////////////////////////////////////////////////////////////////
  
  var Light = function (lightName)
  {
    AbstractNode.call (this);
    
    this.position             = [0.0, 0.0, 0.0, 0.0];
    this.ambientColor         = [0.0, 0.0, 0.0, 1.0];
    this.diffuseColor         = [1.0, 1.0, 1.0, 1.0];
    this.specularColor        = [1.0, 1.0, 1.0, 1.0];
    this.enabled              = true;
    this.lightName            = lightName;
    this.constantAttenuation  = 1.0;
    this.linearAttenuation    = 0.0;
    this.quadraticAttenuation = 0.0;
    
    this.setPositionFromFloats      (0.0, 0.0, 0.0, 0.0);
    this.setAmbientColorFromFloats  (1.0, 1.0, 1.0, 1.0);
    this.setDiffuseColorFromFloats  (1.0, 1.0, 1.0, 1.0);
    this.setSpecularColorFromFloats (1.0, 1.0, 1.0, 1.0);
    this.setConstantAttenuation     (this.constantAttenuation);
    this.setLinearAttenuation       (this.linearAttenuation);
    this.setQuadraticAttenuation    (this.quadraticAttenuation);
    this.setEnabled                 (true);
  };
  
  Light.prototype             = new AbstractNode ();
  Light.prototype.constructor = Light;
  
  Light.prototype.getPositionAsFloatArray = function ()
  {
    return this.position;
  };
  
  Light.prototype.setPositionFromFloats = function (x, y, z, w)
  {
    this.position = [x, y, z, w];
    this.setUniformVariable
    (
      this.lightName + ".position",
      new UniformVariable4f (x, y, z, w)
    );
    this.fireNodeChangedEvent (["position"]);
  };

  Light.prototype.getAmbientColorAsFloatArray = function ()
  {
    return this.ambientColor;
  };
  
  Light.prototype.setAmbientColorFromFloats = function (red, green, blue, alpha)
  {
    this.ambientColor = [red, green, blue, alpha];
    this.setUniformVariable
    (
      this.lightName + ".ambientColor",
      new UniformVariable4fv (this.ambientColor)
    );
    this.fireNodeChangedEvent (["ambientColor"]);
  };
  
  Light.prototype.setAmbientColorFromFloatArray = function (floatArray)
  {
    this.ambientColor = floatArray;
    this.setUniformVariable
    (
      this.lightName + ".ambientColor",
      new UniformVariable4fv (this.ambientColor)
    );
    this.fireNodeChangedEvent (["ambientColor"]);
  };
  
  Light.prototype.getDiffuseColorAsFloatArray = function ()
  {
    return this.diffuseColor;
  };

  Light.prototype.setDiffuseColorFromFloats = function (red, green, blue, alpha)
  {
    this.diffuseColor = [red, green, blue, alpha];
    this.setUniformVariable
    (
      this.lightName + ".diffuseColor",
      new UniformVariable4fv (this.diffuseColor)
    );
    this.fireNodeChangedEvent (["diffuseColor"]);
  };
  
  Light.prototype.setDiffuseColorFromFloatArray = function (floatArray)
  {
    this.diffuseColor = floatArray;
    this.setUniformVariable
    (
      this.lightName + ".diffuseColor",
      new UniformVariable4fv (this.diffuseColor)
    );
    this.fireNodeChangedEvent (["diffuseColor"]);
  };
  
  Light.prototype.getSpecularColorAsFloatArray = function ()
  {
    return this.specularColor;
  };
  
  Light.prototype.setSpecularColorFromFloats = function (red, green, blue, alpha)
  {
    this.specularColor = [red, green, blue, alpha];
    this.setUniformVariable
    (
      this.lightName + ".specularColor",
      new UniformVariable4fv (this.specularColor)
    );
    this.fireNodeChangedEvent (["specularColor"]);
  };
  
  Light.prototype.setSpecularColorFromFloatArray = function (floatArray)
  {
    this.specularColor = floatArray;
    this.setUniformVariable
    (
      this.lightName + ".specularColor",
      new UniformVariable4fv (this.specularColor)
    );
    this.fireNodeChangedEvent (["specularColor"]);
  };
  
  Light.prototype.setConstantAttenuation = function (constantAttenuation)
  {
    this.constantAttenuation = constantAttenuation;
    this.setUniformVariable
    (
      this.lightName + ".constantAttenuation",
      new UniformVariable1f (this.constantAttenuation)
    );
    this.fireNodeChangedEvent (["constantAttenuation"]);
  };
  
  Light.prototype.setLinearAttenuation = function (linearAttenuation)
  {
    this.linearAttenuation = linearAttenuation;
    this.setUniformVariable
    (
      this.lightName + ".linearAttenuation",
      new UniformVariable1f (this.linearAttenuation)
    );
    this.fireNodeChangedEvent (["linearAttenuation"]);
  };
  
  Light.prototype.setQuadraticAttenuation = function (quadraticAttenuation)
  {
    this.quadraticAttenuation = quadraticAttenuation;
    this.setUniformVariable
    (
      this.lightName + ".quadraticAttenuation",
      new UniformVariable1f (this.quadraticAttenuation)
    );
    this.fireNodeChangedEvent (["quadraticAttenuation"]);
  };
  
  Light.prototype.isEnabled = function ()
  {
    return this.enabled;
  };

  Light.prototype.setEnabled = function (enabled)
  {
    var enabledAsInteger = 0;
    
    if (enabled)
    {
      enabledAsInteger = 1;
    }
    else
    {
      enabledAsInteger = 0;
    }
    
    this.enabled = enabled;
    this.setUniformVariable
    (
      this.lightName + ".isEnabled",
      new UniformVariable1i (enabledAsInteger)
    );
    this.fireNodeChangedEvent (["enabled"]);
  };
  
  Light.prototype.update = function (renderingContext, shaderProgram)
  {
    this.getShaderVariableSet ().bindToContext (renderingContext, shaderProgram);
  };