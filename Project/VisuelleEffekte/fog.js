  //////////////////////////////////////////////////////////////////////
  // -- Implementation of the type "Fog".                          -- //
  //////////////////////////////////////////////////////////////////////
  
  var Fog = function ()
  {
    AbstractNode.call (this);
    
    this.fogName         = "fog";
    this.type            = 0;
    this.color           = [1.0, 1.0, 1.0, 1.0];
    this.minimumDistance = 0.0;
    this.maximumDistance = 1.0;
    this.scale           = 1.0;
    this.density         = 0.1;
    this.enabled         = false;
    
    this.setType                (this.type);
    this.setColorFromFloatArray (this.color);
    this.setMinimumDistance     (this.minimumDistance);
    this.setMaximumDistance     (this.maximumDistance);
    this.setDensity             (this.density);
    this.setEnabled             (this.enabled);
  };
  
  Fog.prototype             = new AbstractNode ();
  Fog.prototype.constructor = Fog;
  
  Fog.LINEAR              = 0;
  Fog.EXPONENTIAL         = 1;
  Fog.SQUARED_EXPONENTIAL = 2;
  
  Fog.prototype.setType = function (type)
  {
    this.type = type;
    this.setUniformVariable
    (
      this.fogName + ".type",
      new UniformVariable1i (this.type)
    );
    this.fireNodeChangedEvent (["type"]);
  };
  
  Fog.prototype.setColorFromFloatArray = function (color)
  {
    this.color = color;
    this.setUniformVariable
    (
      this.fogName + ".color",
      new UniformVariable4fv (this.color)
    );
    this.fireNodeChangedEvent (["color"]);
  };
  
  Fog.prototype.setMinimumDistance = function (minimumDistance)
  {
    this.minimumDistance = minimumDistance;
    this.scale           = this.computeScale ();
    this.setUniformVariable
    (
      this.fogName + ".minimumDistance",
      new UniformVariable1f (this.minimumDistance)
    );
    this.setUniformVariable
    (
      this.fogName + ".scale",
      new UniformVariable1f (this.scale)
    );
    this.fireNodeChangedEvent (["minimumDistance", "scale"]);
  };
  
  Fog.prototype.setMaximumDistance = function (maximumDistance)
  {
    this.maximumDistance = maximumDistance;
    this.scale           = this.computeScale ();
    this.setUniformVariable
    (
      this.fogName + ".maximumDistance",
      new UniformVariable1f (this.maximumDistance)
    );
    this.setUniformVariable
    (
      this.fogName + ".scale",
      new UniformVariable1f (this.scale)
    );
    this.fireNodeChangedEvent (["maximumDistance", "scale"]);
  };
  
  Fog.prototype.computeScale = function ()
  {
    return (1.0 / (this.maximumDistance - this.minimumDistance));
  };
  
  Fog.prototype.setDensity = function (density)
  {
    this.density = density;
    this.setUniformVariable
    (
      this.fogName + ".density",
      new UniformVariable1f (this.density)
    );
    this.fireNodeChangedEvent (["density"]);
  };
  
  Fog.prototype.setEnabled = function (isEnabled)
  {
    var enabledAsInteger = 0;
    
    if (isEnabled)
    {
      enabledAsInteger = 1;
    }
    else
    {
      enabledAsInteger = 0;
    }
    
    this.enabled = isEnabled;
    this.setUniformVariable
    (
      this.fogName + ".isEnabled",
      new UniformVariable1i (enabledAsInteger)
    );
    this.fireNodeChangedEvent (["enabled"]);
  };
  