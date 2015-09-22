  //////////////////////////////////////////////////////////////////////
  // -- Implementation of the type "AbstractUniformVariable".      -- //
  //////////////////////////////////////////////////////////////////////
  
  var AbstractUniformVariable = function ()
  {
  };
  
  // Abstract method.
  AbstractUniformVariable.prototype.getValue = function ()
  {
    alert ("Method should have been implemented!");
  };
  
  // Abstract method.
  AbstractUniformVariable.prototype.bindToContext = function
  (
    renderingContext,
    uniformLocation
  )
  {
    alert ("Method should have been implemented!");
  };
  
  
  //////////////////////////////////////////////////////////////////////
  // -- Implementation of the type "UniformVariable1i".            -- //
  //////////////////////////////////////////////////////////////////////
  
  var UniformVariable1i = function (integerValue)
  {
    this.integerValue = integerValue;
  };
  UniformVariable1i.prototype             = new AbstractUniformVariable ();
  UniformVariable1i.prototype.constructor = UniformVariable1i;
  
  UniformVariable1i.prototype.getValue = function ()
  {
    return this.integerValue;
  };
  
  UniformVariable1i.prototype.bindToContext = function
  (
    renderingContext,
    uniformLocation
  )
  {
    renderingContext.getGL ().uniform1i
    (
      uniformLocation,
      this.integerValue
    );
  };
  
  
  //////////////////////////////////////////////////////////////////////
  // -- Implementation of the type "UniformVariable1f".            -- //
  //////////////////////////////////////////////////////////////////////
  
  var UniformVariable1f = function (floatValue)
  {
    this.floatValue = floatValue;
  };
  UniformVariable1f.prototype             = new AbstractUniformVariable ();
  UniformVariable1f.prototype.constructor = UniformVariable1f;
  
  UniformVariable1f.prototype.getValue = function ()
  {
    return this.floatValue;
  };
  
  UniformVariable1f.prototype.bindToContext = function
  (
    renderingContext,
    uniformLocation
  )
  {
    renderingContext.getGL ().uniform1f
    (
      uniformLocation,
      this.floatValue
    );
  };
  
  
  //////////////////////////////////////////////////////////////////////
  // -- Implementation of the type "UniformVariable2fv".           -- //
  //////////////////////////////////////////////////////////////////////
  
  var UniformVariable2fv = function (floatValueArray)
  {
    this.floatValueArray = floatValueArray;
  };
  UniformVariable2fv.prototype             = new AbstractUniformVariable ();
  UniformVariable2fv.prototype.constructor = UniformVariable2fv;
  
  UniformVariable2fv.prototype.getValue = function ()
  {
    return this.floatValueArray;
  };
  
  UniformVariable2fv.prototype.bindToContext = function
  (
    renderingContext,
    uniformLocation
  )
  {
    renderingContext.getGL ().uniform2fv
    (
      uniformLocation,
      this.floatValueArray
    );
  };
  
  
  //////////////////////////////////////////////////////////////////////
  // -- Implementation of the type "UniformVariable3f".            -- //
  //////////////////////////////////////////////////////////////////////
  
  var UniformVariable3f = function
  (
    floatValue1, floatValue2, floatValue3
  )
  {
    this.floatValue1 = floatValue1;
    this.floatValue2 = floatValue2;
    this.floatValue3 = floatValue3;
  };
  UniformVariable3f.prototype             = new AbstractUniformVariable ();
  UniformVariable3f.prototype.constructor = UniformVariable3f;
  
  UniformVariable3f.prototype.getValue = function ()
  {
    return [this.floatValue1, this.floatValue2, this.floatValue3];
  };
  
  UniformVariable3f.prototype.bindToContext = function
  (
    renderingContext,
    uniformLocation
  )
  {
    renderingContext.getGL ().uniform3f
    (
      uniformLocation,
      this.floatValue1,
      this.floatValue2,
      this.floatValue3
    );
  };
  
  
  //////////////////////////////////////////////////////////////////////
  // -- Implementation of the type "UniformVariable4f".            -- //
  //////////////////////////////////////////////////////////////////////
  
  var UniformVariable4f = function
  (
    floatValue1, floatValue2, floatValue3, floatValue4
  )
  {
    this.floatValue1 = floatValue1;
    this.floatValue2 = floatValue2;
    this.floatValue3 = floatValue3;
    this.floatValue4 = floatValue4;
  };
  UniformVariable4f.prototype             = new AbstractUniformVariable ();
  UniformVariable4f.prototype.constructor = UniformVariable4f;
  
  UniformVariable4f.prototype.getValue = function ()
  {
    return [this.floatValue1, this.floatValue2, this.floatValue3, this.floatValue4];
  };
  
  UniformVariable4f.prototype.bindToContext = function
  (
    renderingContext,
    uniformLocation
  )
  {
    renderingContext.getGL ().uniform4f
    (
      uniformLocation,
      this.floatValue1,
      this.floatValue2,
      this.floatValue3,
      this.floatValue4
    );
  };
  
  
  //////////////////////////////////////////////////////////////////////
  // -- Implementation of the type "UniformVariable3fv".           -- //
  //////////////////////////////////////////////////////////////////////
  
  var UniformVariable3fv = function (floatValueArray)
  {
    this.floatValueArray = floatValueArray;
  };
  UniformVariable3fv.prototype             = new AbstractUniformVariable ();
  UniformVariable3fv.prototype.constructor = UniformVariable3fv;
  
  UniformVariable3fv.prototype.getValue = function ()
  {
    return this.floatValueArray;
  };
  
  UniformVariable3fv.prototype.bindToContext = function
  (
    renderingContext,
    uniformLocation
  )
  {
    renderingContext.getGL ().uniform3fv
    (
      uniformLocation,
      this.floatValueArray
    );
  };
  
  
  //////////////////////////////////////////////////////////////////////
  // -- Implementation of the type "UniformVariable4fv".           -- //
  //////////////////////////////////////////////////////////////////////
  
  var UniformVariable4fv = function (floatValueArray)
  {
    this.floatValueArray = floatValueArray;
  };
  UniformVariable4fv.prototype             = new AbstractUniformVariable ();
  UniformVariable4fv.prototype.constructor = UniformVariable4fv;
  
  UniformVariable4fv.prototype.getValue = function ()
  {
    return this.floatValueArray;
  };
  
  UniformVariable4fv.prototype.bindToContext = function
  (
    renderingContext,
    uniformLocation
  )
  {
    renderingContext.getGL ().uniform4fv
    (
      uniformLocation,
      this.floatValueArray
    );
  };
  
  
  //////////////////////////////////////////////////////////////////////
  // -- Implementation of the type "UniformVariableMatrix3fv".     -- //
  //////////////////////////////////////////////////////////////////////
  
  var UniformVariableMatrix3fv = function (floatValueArray)
  {
    this.floatValueArray = floatValueArray;
  };
  UniformVariableMatrix3fv.prototype             = new AbstractUniformVariable ();
  UniformVariableMatrix3fv.prototype.constructor = UniformVariableMatrix3fv;
  
  UniformVariableMatrix3fv.prototype.getValue = function ()
  {
    return this.floatValueArray;
  };
  
  UniformVariableMatrix3fv.prototype.bindToContext = function
  (
    renderingContext,
    uniformLocation
  )
  {
    renderingContext.getGL ().uniformMatrix3fv
    (
      uniformLocation,
      false,
      new Float32Array (this.floatValueArray)
    );
  };
  
  
  //////////////////////////////////////////////////////////////////////
  // -- Implementation of the type "UniformVariableMatrix4fv".     -- //
  //////////////////////////////////////////////////////////////////////
  
  var UniformVariableMatrix4fv = function (floatValueArray)
  {
    this.floatValueArray = floatValueArray;
  };
  UniformVariableMatrix4fv.prototype             = new AbstractUniformVariable ();
  UniformVariableMatrix4fv.prototype.constructor = UniformVariableMatrix4fv;
  
  UniformVariableMatrix4fv.prototype.getValue = function ()
  {
    return this.floatValueArray;
  };
  
  UniformVariableMatrix4fv.prototype.bindToContext = function
  (
    renderingContext,
    uniformLocation
  )
  {
    renderingContext.getGL ().uniformMatrix4fv
    (
      uniformLocation,
      false,
      new Float32Array (this.floatValueArray)
    );
  };
