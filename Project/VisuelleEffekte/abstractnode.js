  //////////////////////////////////////////////////////////////////////
  // -- Implementation of the type "AbstractNode".                 -- //
  //////////////////////////////////////////////////////////////////////
  
  var AbstractNode = function ()
  {
    this.shaderVariableSet = new ShaderVariableSet ();
    this.nodeListeners     = [];
  };
  
  AbstractNode.prototype.getShaderVariableSet = function ()
  {
    return this.shaderVariableSet;
  };
  
  AbstractNode.prototype.setShaderVariableSet = function (shaderVariableSet)
  {
    this.shaderVariableSet = shaderVariableSet;
  };
  
  AbstractNode.prototype.setUniformVariable = function (uniformName, uniformVariable)
  {
    this.shaderVariableSet.setUniformVariableValue (uniformName, uniformVariable);
  };
  
  AbstractNode.prototype.addNodeListener = function (listener)
  {
    this.nodeListeners.push (listener);
  };
  
  AbstractNode.prototype.fireNodeChangedEvent = function (changeFlags)
  {
    var firingNode  = this;
    
    for (var listenerIndex = 0; listenerIndex < this.nodeListeners.length; listenerIndex++)
    {
      var listener = this.nodeListeners[listenerIndex];
      
      if ((listener != null) && (listener["nodeChanged"] != null))
      {
        listener.nodeChanged (firingNode, changeFlags);
      }
    }
  };
  
  // Override to implement different behavior.
  AbstractNode.prototype.update = function (renderingContext, shaderProgram)
  {
    this.getShaderVariableSet ().bindToContext (renderingContext, shaderProgram);
  };
  