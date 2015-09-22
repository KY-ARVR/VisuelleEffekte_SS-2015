  //////////////////////////////////////////////////////////////////////
  // -- Implementation of the type "AttributeVariableData".        -- //
  //////////////////////////////////////////////////////////////////////
  
  var AttributeVariableData = function
  (
    variableName,
    componentCount,
    componentType,
    normalized,
    stride,
    offset
  )
  {
    this.variableName    = variableName;
    this.componentCount  = componentCount;
    this.componentType   = componentType;
    this.glComponentType = 0;
    this.normalized      = normalized;
    this.stride          = stride;
    this.offset          = offset;
    this.attribLocation  = -1;
    this.bound           = false;
  };
  
  AttributeVariableData.prototype.getName = function ()
  {
    return this.variableName;
  };
  
  AttributeVariableData.prototype.getLocation = function ()
  {
    return this.attribLocation;
  };
  
  AttributeVariableData.prototype.initialize = function (renderingContext, shaderProgram)
  {
    if (this.bound)
    {
      return;
    }
    
    var gl              = renderingContext.getGL ();
    this.attribLocation = gl.getAttribLocation (shaderProgram.getShaderProgramObject (), this.variableName);
    
    if (this.componentType == "float")
    {
      this.glComponentType = gl.FLOAT;
    }
    else
    {
      this.glComponentType = gl.FIXED;
    }
    
    if (this.attribLocation == -1)
    {
      console.log ("AttributeVariableData.initialize(): "   +
                   this.variableName + " initialized with " +
                   this.attribLocation + ".");
    }
    
    this.bound = true;
  };
  
  AttributeVariableData.prototype.enable = function (gl)
  {
    gl.vertexAttribPointer
    (
      this.attribLocation,
      this.componentCount,
      this.glComponentType,
      this.normalized,
      this.stride,
      this.offset
    );
    gl.enableVertexAttribArray (this.attribLocation);
  };
  
  AttributeVariableData.prototype.disable = function (gl)
  {
    if (this.attribLocation == -1)
    {
      console.log ("AttributeVariableData.disable(): " +
                   this.variableName + " is not initialized!");
    }
    
    gl.disableVertexAttribArray (this.attribLocation);
  };
  
  