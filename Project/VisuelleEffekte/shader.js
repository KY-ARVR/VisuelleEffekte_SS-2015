  //////////////////////////////////////////////////////////////////////
  // -- Implementation of the type "AbstractShader".               -- //
  //////////////////////////////////////////////////////////////////////
  
  /**
   * Creates a shader of the given type.
   * 
   * @param  {string} shaderType  The shader type. Either "vertexShader"
   *                              or "fragmentShader".
   * @return {AbstractShader}  An instance of this shader object.
   */
  var AbstractShader = function (shaderType)
  {
    this.type = shaderType;
  };
  
  /**
   * Returns the shader's source code as string.
   * 
   * @return {string}  The shader source code as string.
   */
  AbstractShader.prototype.getSourceCode = function ()
  {
    return null;
  };
  
  /**
   * Returns the shader type as string.
   * 
   * @return {string}  The shader type as string, either "vertexShader"
   *                   or "fragmentShader".
   */
  AbstractShader.prototype.getType = function ()
  {
    return this.type;
  };
  
  
  //////////////////////////////////////////////////////////////////////
  // -- Implementation of the type "DefaultFragmentShader".        -- //
  //////////////////////////////////////////////////////////////////////
  
  // pointVariable: Name of 3D attribute name, e.g. "coordinates".
  var DefaultFragmentShader = function (sourceCode)
  {
    // Call super class constructor.
    AbstractShader.call (this, "vertexShader");
    
    this.sourceCode = sourceCode;
  };
  DefaultFragmentShader.prototype             = new AbstractShader ();
  DefaultFragmentShader.prototype.constructor = DefaultFragmentShader;
  
  DefaultFragmentShader.prototype.getSourceCode = function ()
  {
    return this.sourceCode;
  };
  
  DefaultFragmentShader.prototype.toString = function ()
  {
    var asString = null;
    
    asString = "DefaultVertexShader(sourceCode=\"" +
               this.sourceCode                     + "\")";
    
    return asString;
  };
  
  
  //////////////////////////////////////////////////////////////////////
  // -- Implementation of the type "SingleColorFragmentShader".    -- //
  //////////////////////////////////////////////////////////////////////
  
  /**
   * Creates a fragment shader, simply filling each fragment with a
   * predefined color.
   * 
   * @param  {number}  red    The red   value, usually in [0.0, 1.0].
   * @param  {number}  green  The green value, usually in [0.0, 1.0].
   * @param  {number}  blue   The blue  value, usually in [0.0, 1.0].
   * @param  {number}  alpha  The alpha value, usually in [0.0, 1.0].
   * @return {SingleColorFragmentShader}  An instance of this
   *                                      fragment shader.
   */
  var SingleColorFragmentShader = function (red, green, blue, alpha)
  {
    // Call super class constructor.
    AbstractShader.call (this, "fragmentShader");
    
    this.red   = red;
    this.green = green;
    this.blue  = blue;
    this.alpha = alpha;
  };
  SingleColorFragmentShader.prototype = new AbstractShader ();
  SingleColorFragmentShader.prototype.constructor = SingleColorFragmentShader;
  
  SingleColorFragmentShader.prototype.getSourceCode = function ()
  {
    var sourceCode = null;
    
    sourceCode =
      "void main (void) \n"                            +
      "{\n"                                            +
      "   gl_FragColor = vec4 (" + this.red   + ", "   +
                                   this.green + ", "   +
                                   this.blue  + ", "   +
                                   this.alpha + ");\n" +
      "}\n";
    
    return sourceCode;
  };
  
  SingleColorFragmentShader.prototype.setColor = function (red, gren, blue, alpha)
  {
    this.red    = red;
    this.green  = green;
    this.blue   = blue;
    this.alpha  = alpha;
  };
  
  SingleColorFragmentShader.prototype.toString = function ()
  {
    var asString = null;
    
    asString = "SingleColorFragmentShader(" +
               "red="   + this.red   + ", " +
               "green=" + this.green + ", " +
               "blue="  + this.blue  + ", " +
               "alpha=" + this.alpha +
               ")";
    
    return asString;
  };
  
  
  //////////////////////////////////////////////////////////////////////
  // -- Implementation of the type "DefaultVertexShader".          -- //
  //////////////////////////////////////////////////////////////////////
  
  // pointVariable: Name of 3D attribute name, e.g. "coordinates".
  var DefaultVertexShader = function (sourceCode)
  {
    // Call super class constructor.
    AbstractShader.call (this, "vertexShader");
    
    this.sourceCode = sourceCode;
  };
  DefaultVertexShader.prototype               = new AbstractShader ();
  DefaultVertexShader.prototype.constructor   = DefaultVertexShader;
  
  DefaultVertexShader.prototype.getSourceCode = function ()
  {
    return this.sourceCode;
  };
  
  DefaultVertexShader.prototype.toString = function ()
  {
    var asString = null;
    
    asString = "DefaultVertexShader(sourceCode=\"" +
               this.sourceCode                     + "\")";
    
    return asString;
  };
  
  
  //////////////////////////////////////////////////////////////////////
  // -- Implementation of the type "SimpleVertexShader".           -- //
  //////////////////////////////////////////////////////////////////////
  
  // pointVariable: Name of 3D attribute name, e.g. "coordinates".
  var SimpleVertexShader = function (pointVariable)
  {
    // Call super class constructor.
    AbstractShader.call (this, "vertexShader");
    
    this.pointVariable = pointVariable;
  };
  SimpleVertexShader.prototype               = new AbstractShader ();
  SimpleVertexShader.prototype.constructor   = SimpleVertexShader;
  
  SimpleVertexShader.prototype.getSourceCode = function ()
  {
    var sourceCode = null;
    
    sourceCode =
      "attribute vec3 " + this.pointVariable + ";\n"               +
      "void main (void) \n"                                        +
      "{\n"                                                        +
      "   gl_Position = vec4 (" + this.pointVariable + ", 1.0);\n" +
      "}\n";
    
    return sourceCode;
  };
  
  SimpleVertexShader.prototype.toString = function ()
  {
    var asString = null;
    
    asString = "SimpleVertexShader(pointVariable=\"" +
               this.pointVariable                     + "\")";
    
    return asString;
  };
  
  
  
  //////////////////////////////////////////////////////////////////////
  // -- Implementation of the type "ShaderProgram".                -- //
  //////////////////////////////////////////////////////////////////////
  
  var ShaderProgram = function ()
  {
    this.vertexShader         = null;
    this.fragmentShader       = null;
    this.shaderProgramObject  = null;
    this.vertexShaderObject   = null;
    this.fragmentShaderObject = null;
    // Maps attribute variable name to AttributeVariableData.
    this.attributeVarsMap     = new Object ();
    // Maps the uniform variable name to location.
    this.uniformVariablesMap  = new Object ();
    this.cleanedUp            = false;
  };
  
  ShaderProgram.prototype.getVertexShader = function ()
  {
    return this.vertexShader;
  };
  
  ShaderProgram.prototype.setVertexShader = function (vertexShader)
  {
    this.vertexShader = vertexShader;
  };
  
  ShaderProgram.prototype.getFragmentShader = function ()
  {
    return this.fragmentShader;
  };
  
  ShaderProgram.prototype.setFragmentShader = function (fragmentShader)
  {
    this.fragmentShader = fragmentShader;
  };
  
  ShaderProgram.prototype.addAttributeVariable = function (attributeVariableData)
  {
    if (attributeVariableData != null)
    {
      var attributeVariableName = attributeVariableData.getName ();
      
      this.attributeVarsMap[attributeVariableName] = attributeVariableData;
    }
  };
  
  ShaderProgram.prototype.getAttributeVariableMap = function ()
  {
    return this.attributeVarsMap;
  };
  
  ShaderProgram.prototype.getAttributeVariableByName = function (attributeName)
  {
    return this.attributeVarsMap[attributeName];
  };
  
  ShaderProgram.prototype.addUniformVariableName = function (variableName)
  {
    this.uniformVariablesMap[variableName] = null;
  };
  
  ShaderProgram.prototype.setUniformVariableNames = function (variableNames)
  {
    if (variableNames != null)
    {
      for (var nameIndex = 0; nameIndex < variableNames.length; nameIndex++)
      {
        this.addUniformVariableName (variableNames[nameIndex]);
      }
    }
  };
  
  ShaderProgram.prototype.addUniformVariable = function (variableName, variableLocation)
  {
    this.uniformVariablesMap[variableName] = variableLocation;
  };
  
  ShaderProgram.prototype.getUniformLocationByName = function (variableName)
  {
    return this.uniformVariablesMap[variableName];
  };
  
  ShaderProgram.prototype.checkShader = function (gl, shaderObject)
  {
    if (! gl.getShaderParameter (shaderObject, gl.COMPILE_STATUS))
    {
      // gl.getShaderInfoLog (...) is better than gl.getProgramInfoLog (...)
      throw new Error (gl.getShaderInfoLog (shaderObject));
      //throw new Error (gl.getProgramInfoLog (shaderObject));
    }
  };
  
  ShaderProgram.prototype.initialize = function (renderingContext)
  {
    var gl = renderingContext.getGL ();
    
    this.shaderProgramObject  = gl.createProgram ();
    this.vertexShaderObject   = gl.createShader  (gl.VERTEX_SHADER);
    this.fragmentShaderObject = gl.createShader  (gl.FRAGMENT_SHADER);
    
    // Prepare the vertex shader.
    gl.shaderSource  (this.vertexShaderObject,
                      this.vertexShader.getSourceCode ());
    gl.compileShader (this.vertexShaderObject);
    this.checkShader (gl, this.vertexShaderObject);
    
    // Prepare the fragment shader.
    gl.shaderSource  (this.fragmentShaderObject,
                      this.fragmentShader.getSourceCode ());
    gl.compileShader (this.fragmentShaderObject);
    this.checkShader (gl, this.fragmentShaderObject);
    
    // Bind the shaders to the shader program.
    gl.attachShader  (this.shaderProgramObject,
                      this.vertexShaderObject);
    gl.attachShader  (this.shaderProgramObject,
                      this.fragmentShaderObject);
    gl.linkProgram   (this.shaderProgramObject);
    
    gl.useProgram    (this.shaderProgramObject);
    
    // Add attribute variables.
    for (var attributeName in this.attributeVarsMap)
    {
      var attributeData = this.attributeVarsMap[attributeName];
      
      attributeData.initialize (renderingContext, this);
    }
    
    // Add uniform variables.
    for (var uniformName in this.uniformVariablesMap)
    {
      var uniformLocation = null;
      
      uniformLocation = gl.getUniformLocation
      (
        this.shaderProgramObject,
        uniformName
      );
      this.addUniformVariable (uniformName, uniformLocation);
    }
  };
  
  /**
   * Associates this shader program with a given graphics context.
   * 
   * @param {WebGLContext} gl  The graphics context to bind to.
   */
  ShaderProgram.prototype.bindToContext = function (renderingContext)
  {
    //renderingContext.getGL ().useProgram (this.shaderProgramObject);
  };
  
  ShaderProgram.prototype.getShaderProgramObject = function ()
  {
    return this.shaderProgramObject;
  };
  
  ShaderProgram.prototype.getVertexShaderObject = function ()
  {
    return this.vertexShaderObject;
  };
  
  ShaderProgram.prototype.getFragmentShaderObject = function ()
  {
    return this.fragmentShaderObject;
  };
  
  ShaderProgram.prototype.toString = function ()
  {
    var asString = null;
    
    asString = "ShaderProgram("                            +
               "vertexShader="   + this.vertexShader + "," +
               "fragmentShader=" + this.fragmentShader     + ")";
    
    return asString;
  };
  
  /**
   * Frees the context memory by detaching the shaders and deleting the
   * program.
   * 
   * @param {WebGLContext} gl  The graphics context to clean up.
   */
  ShaderProgram.prototype.cleanUp = function (gl)
  {
    if (! this.cleanedUp)
    {
      var shaderProgramObject  = null;
      var vertexShaderObject   = null;
      var fragmentShaderObject = null;
      
      shaderProgramObject  = this.getShaderProgramObject  ();
      vertexShaderObject   = this.getVertexShaderObject   ();
      fragmentShaderObject = this.getFragmentShaderObject ();
      
      gl.detachShader  (shaderProgramObject, vertexShaderObject);
      gl.detachShader  (shaderProgramObject, fragmentShaderObject);
      //gl.deleteProgram (shaderProgramObject);
      
      this.cleanedUp = true;
    }
  };
  
  
  
  //////////////////////////////////////////////////////////////////////
  // -- Implementation of the type "ShaderVariableSet".            -- //
  //////////////////////////////////////////////////////////////////////
  
  var ShaderVariableSet = function ()
  {
    this.attribVariableNames = [];
    this.uniformVariablesMap = new Object ();
  };
  
  ShaderVariableSet.prototype.addAttributeVariableName = function (attributeVariableName)
  {
    this.attribVariableNames.push (attributeVariableName);
  };
  
  ShaderVariableSet.prototype.hasAttributeVariableOfName = function (attributeVariableName)
  {
    var attributeCount = this.attribVariableNames.length;
    
    for (var attributeIndex = 0; attributeIndex < this.attribVariableNames.length; attributeIndex++)
    {
      var currentName = this.attribVariableNames[attributeIndex];
      
      if (currentName == attributeVariableName)
      {
        return true;
      }
    }
    
    return false;
  };
  
  ShaderVariableSet.prototype.getUniformVariablesMap = function ()
  {
    return this.uniformVariablesMap;
  };
  
  ShaderVariableSet.prototype.getUniformVariablesNames = function ()
  {
    return Object.keys (this.uniformVariablesMap);
  };
  
  ShaderVariableSet.prototype.getUniformVariableByName = function (variableName)
  {
    return this.uniformVariablesMap[variableName];
  };
  
  ShaderVariableSet.prototype.setUniformVariableValue = function (variableName, uniformVariable)
  {
    this.uniformVariablesMap[variableName] = uniformVariable;
  };
  
  ShaderVariableSet.prototype.hasUniformVariableOfName = function (uniformVariableName)
  {
    return (uniformVariableName in this.uniformVariablesMap);
  };
  
  ShaderVariableSet.prototype.getCopy = function ()
  {
    var newInstance = new ShaderVariableSet ();
    
    newInstance.attribVariableNames = this.attribVariablesNames.slice ();
    newInstance.uniformVariablesMap = new Object ();
    
    for (var uniformKey in this.uniformVariablesMap)
    {
      newInstance.uniformVariablesMap[uniformKey] = this.uniformVariablesMap[uniformKey];
    }
    
    return newInstance;
  };
  
  ShaderVariableSet.prototype.copyEntriesOfOtherSet = function (otherShaderAttributeSet)
  {
    // Copy the uniform variable names.
    for (var nameIndex = 0; nameIndex < otherShaderAttributeSet.attribVariableNames.length; nameIndex++)
    {
      var name = otherShaderAttributeSet.attribVariableNames[nameIndex];
      
      if (this.attribVariableNames.indexOf (name) == -1)
      {
        this.attribVariableNames.push (name);
      }
    }
    
    // Copy the uniform variable entries.
    for (var uniformKey in otherShaderAttributeSet.uniformVariablesMap)
    {
      this.uniformVariablesMap[uniformKey] = otherShaderAttributeSet.uniformVariablesMap[uniformKey];
    }
  };
  
  ShaderVariableSet.prototype.bindToContext = function (renderingContext, shaderProgram)
  {
    for (var uniformName in this.uniformVariablesMap)
    {
      var uniformVariable = null;
      var uniformLocation = null;
      
      if ((uniformName == null) || (uniformName == undefined))
      {
        //console.log ("Skipping null/undefined uniform name.");
      }
      else
      {
        uniformVariable = this.uniformVariablesMap[uniformName];
        
        if (uniformVariable != null)
        {
          uniformLocation = shaderProgram.getUniformLocationByName (uniformName);
          
          if (uniformLocation != null)
          {
            uniformVariable.bindToContext (renderingContext, uniformLocation);
          }
        }
      }
    }
  }