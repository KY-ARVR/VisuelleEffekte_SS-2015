
// 23.04.2015
// JSDoc:                         -> "http://en.wikipedia.org/wiki/JSDoc"
// Override "toString ()" method: -> "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/toString"
// structs in shaders:            -> "http://stackoverflow.com/questions/13476294/accessing-a-structure-in-vertex-shader-from-the-code-in-webgl"
// structs in shaders:            -> "https://github.com/KhronosGroup/WebGL/blob/master/sdk/tests/conformance/glsl/misc/shader-with-array-of-structs-uniform.html"
// array of structs in shaders:   -> "https://github.com/KhronosGroup/WebGL/blob/master/conformance-suites/1.0.3/conformance/glsl/misc/shader-with-array-of-structs-uniform.html"
// multiple lights in shaders:    -> "http://pyopengl.sourceforge.net/context/tutorials/shader_7.html"
// mousewheel event:              -> "http://www.sitepoint.com/html5-javascript-mouse-wheel/"
// add "select option" with JavaScript: -> "http://www.w3schools.com/jsref/met_select_add.asp"
// select - remove all options:   -> "http://stackoverflow.com/questions/3364493/how-do-i-clear-all-options-in-a-dropdown-box"
// select - remove option:        -> "http://www.w3schools.com/jsref/met_select_remove.asp"
// checkbox - create dynamically: -> "http://stackoverflow.com/questions/866239/creating-the-checkbox-dynamically-using-javascript"
// simulate class constants:      -> "http://stackoverflow.com/questions/4789323/where-to-declare-class-constants"
// VERY IMPORTANT: WebGL - attributes must be used in vertex shader, else location equals -1: -> "http://stackoverflow.com/questions/9008291/webgls-getattriblocation-oddly-returns-1"
// detect right mouse click:      -> "http://stackoverflow.com/questions/2405771/is-right-click-a-javascript-event"
// Blending in WebGL:             -> "http://stackoverflow.com/questions/6160004/how-does-blending-work-with-glsl-es-fragment-shaders-in-webgl?rq=1"


window.onload = function ()
{
  //////////////////////////////////////////////////////////////////////
  // -- Implementation of the type "RenderingContext".             -- //
  //////////////////////////////////////////////////////////////////////
  
  var RenderingContext = function (gl)
  {
    this.gl = gl;
  };
  
  RenderingContext.prototype.getGL = function ()
  {
    return this.gl;
  };
  
  
  
  //////////////////////////////////////////////////////////////////////
  // -- Implementation of the type "WebGLRenderer".                -- //
  //////////////////////////////////////////////////////////////////////
  
  var WebGLRenderer = function (canvas)
  {
    this.canvas             = canvas;
    this.gl                 =
    (
      canvas.getContext ("webgl")            ||
      canvas.getContext ("experimental-webgl")
    );
    this.shapes             = [];
    this.lights             = [];
    this.fog                = new Fog ();
    this.camera             = null;
    this.renderingContext   = new RenderingContext (this.gl);
    this.backgroundColor    = [0.0, 0.0, 0.0, 1.0];
    this.rendererListeners  = [];
    
    this.gl.getExtension ("OES_element_index_uint");
  };
  
  WebGLRenderer.prototype.getContext = function ()
  {
    return this.gl;
  };
  
  WebGLRenderer.prototype.sortShapeArray = function ()
  {
    this.shapes.sort (function (firstShape, secondShape)
    {
      var comparatorValue = 0;
      var firstMidpoint   = null;
      var secondMidpoint  = null;
      var firstZ          = 0.0;
      var secondZ         = 0.0;
      
      firstMidpoint  = firstShape.getMidpoint  ();
      secondMidpoint = secondShape.getMidpoint ();
      firstZ         = firstMidpoint.getZ      ();
      secondZ        = secondMidpoint.getZ     ();
      
      /*
      if (firstShape.transparency.transparencyValue < secondShape.transparency.transparencyValue)
      {
        return 1;
      }
      */
      
      if (firstZ < secondZ)
      {
        comparatorValue = 1;
      }
      else if (firstZ == secondZ)
      {
        comparatorValue = 0;
      }
      else
      {
        comparatorValue = -1;
      }
      
      return comparatorValue;
    });
  };
  
  WebGLRenderer.prototype.addShape3D = function (shape3D)
  {
    if (shape3D != null)
    {
      var insertionIndex = this.shapes.length;
      
      this.shapes.push         (shape3D);
      this.sortShapeArray      ();
      shape3D.addShapeListener (this);
      shape3D.init             (this.renderingContext);
      this.fireShapeAddedEvent (shape3D, insertionIndex);
      this.update              ();
    }
  };
  
  WebGLRenderer.prototype.removeShape3DAtIndex = function (shapeIndex)
  {
    if ((shapeIndex > -1) && (shapeIndex < this.getShapeCount ()))
    {
      var shapeToRemove = this.shapes[shapeIndex];
      
      this.shapes.splice         (shapeIndex, 1);
      this.fireShapeRemovedEvent (shapeToRemove, shapeIndex);
      this.update ();
    }
  };
  
  WebGLRenderer.prototype.removeShape3D = function (shapeToRemove)
  {
    if (shapeToRemove != null)
    {
      var shapeIndex = this.shapes.indexOf (shapeToRemove);
      
      this.shapes.splice         (shapeIndex, 1);
      this.fireShapeRemovedEvent (shapeToRemove, shapeIndex);
      this.update ();
    }
  };
  
  WebGLRenderer.prototype.getShapeCount = function ()
  {
    return this.shapes.length;
  };
  
  WebGLRenderer.prototype.getShapes = function ()
  {
    return this.shapes;
  };
  
  WebGLRenderer.prototype.getShapeAtIndex = function (index)
  {
    return this.shapes[index];
  };
  
  WebGLRenderer.prototype.getLights = function ()
  {
    return this.lights;
  };
  
  WebGLRenderer.prototype.getLightAtIndex = function (lightIndex)
  {
    return this.lights[lightIndex];
  };
  
  WebGLRenderer.prototype.addLight = function (light)
  {
    if (light != null)
    {
      this.lights.push      (light);
      light.addNodeListener (renderer);
    }
  };
  
  WebGLRenderer.prototype.getFog = function ()
  {
    return this.fog;
  };
  
  WebGLRenderer.prototype.setFog = function (fog)
  {
    this.fog = fog;
  };
  
  WebGLRenderer.prototype.getShaderProgram = function ()
  {
    if (this.shapes.length > 0)
    {
      return this.shapes[0].getShaderProgram ();
    }
    else
    {
      return null;
    }
  };
  
  WebGLRenderer.prototype.setBackgroundColor = function (red, green, blue, alpha)
  {
    this.backgroundColor = [red, green, blue, alpha];
  };
  
  WebGLRenderer.prototype.shapeUpdated = function (shape3D)
  {
    //this.sortShapeArray ();
    this.update ();
  };
  
  WebGLRenderer.prototype.drawScene = function ()
  {
    var gl         = this.gl;
    var shapeCount = this.getShapeCount ();
    
    gl.clearColor (this.backgroundColor[0], this.backgroundColor[1],
                   this.backgroundColor[2], this.backgroundColor[3]);
    gl.clear      (gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport   (0, 0, this.canvas.width, this.canvas.height);
    gl.enable     (gl.DEPTH_TEST);
    gl.depthFunc  (gl.LEQUAL);
    gl.enable     (gl.CULL_FACE);
    // Enable blending.
    gl.blendFunc  (gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable     (gl.BLEND);
    
    for (var shapeIndex = 0; shapeIndex < shapeCount; shapeIndex++)
    {
      var shape               = this.shapes[shapeIndex];
      var appearance          = shape.getAppearance                  ();
      var shaderProgram       = appearance.getShaderProgram          ();
      var shaderProgramObject = shaderProgram.getShaderProgramObject ();
      
      gl.useProgram (shaderProgramObject);
      
      // Set MODEL-VIEW MATRIX.
      appearance.getShaderVariableSet ().setUniformVariableValue
      (
        "modelViewMatrix",
        new UniformVariableMatrix4fv (camera.getModelViewMatrix (shape.getTransformation ()).toGL ())
      );
      
      shape.draw (this.renderingContext);
      
      // Update lights.
      for (var lightIndex = 0; lightIndex < this.lights.length; lightIndex++)
      {
        var light = this.lights[lightIndex];
        
        if (light != null)
        {
          light.update (this.renderingContext, shaderProgram);
        }
      }
      
      fog.update (this.renderingContext, shaderProgram);
    }
  };
  
  WebGLRenderer.prototype.update = function ()
  {
    this.drawScene ();
  };
  
  WebGLRenderer.prototype.cleanUp = function ()
  {
    var gl         = this.gl;
    var shapeCount = this.getShapeCount ();
    
    for (var shapeIndex = 0; shapeIndex < shapeCount; shapeIndex++)
    {
      var shape         = this.shapes[shapeIndex]
      var shaderProgram = shape.getAppearance ().getShaderProgram ();
      
      shaderProgram.cleanUp (gl);
    }
  };
  
  WebGLRenderer.prototype.render = function ()
  {
    this.drawScene ();
    this.cleanUp   ();
  };
  
  WebGLRenderer.prototype.addRendererListener = function (listener)
  {
    if (listener != null)
    {
      this.rendererListeners.push (listener);
    }
  };
  
  WebGLRenderer.prototype.fireShapeAddedEvent = function (shape3D, insertionIndex)
  {
    for (var listenerIndex = 0;
             listenerIndex < this.rendererListeners.length;
             listenerIndex++)
    {
      var listener = this.rendererListeners[listenerIndex];
      
      if ((listener != null) && (listener["shapeAdded"] != null))
      {
        listener.shapeAdded (this, shape3D, insertionIndex);
      }
    }
  };
  
  WebGLRenderer.prototype.fireShapeRemovedEvent = function (shape3D, removeIndex)
  {
    for (var listenerIndex = 0;
             listenerIndex < this.rendererListeners.length;
             listenerIndex++)
    {
      var listener      = this.rendererListeners[listenerIndex];
      var hasMethod     = (listener["shapeRemoved"] != null);
      var canBeNotified = ((listener != null) && (hasMethod));
      
      if (canBeNotified)
      {
        listener.shapeRemoved (this, shape3D, removeIndex);
      }
    }
  };
  
  WebGLRenderer.prototype.nodeChanged = function (node, changeFlags)
  {
    var shapeCount = this.getShapeCount ();
    
    for (var shapeIndex = 0; shapeIndex < shapeCount; shapeIndex++)
    {
      var shape         = this.shapes[shapeIndex]
      var shaderProgram = shape.getAppearance ().getShaderProgram ();
      
      node.getShaderVariableSet ().bindToContext (this.renderingContext, shaderProgram);
    }
    
    this.update ();
  };
  
  
  //////////////////////////////////////////////////////////////////////
  // -- Implementation of the type "Camera".                       -- //
  //////////////////////////////////////////////////////////////////////
  
  var Camera = function ()
  {
    AbstractNode.call (this);
    
    this.viewMatrix       = VecMath.SFMatrix4f.identity ();
    this.projectionMatrix = VecMath.SFMatrix4f.identity ();
  };
  
  Camera.prototype             = new AbstractNode ();
  Camera.prototype.constructor = Camera;
  
  Camera.prototype.getViewMatrix = function ()
  {
    return this.viewMatrix;
  };
  
  Camera.prototype.setViewMatrix = function (viewMatrix)
  {
    this.viewMatrix = viewMatrix;
    this.fireNodeChangedEvent (null);
  };
  
  Camera.prototype.getPosition = function ()
  {
    var position =
    [
      this.viewMatrix._03,
      this.viewMatrix._13,
      this.viewMatrix._23
    ];
    
    return position;
  };
  
  Camera.prototype.setPosition = function (x, y, z)
  {
    this.viewMatrix._03 = x;
    this.viewMatrix._13 = y;
    this.viewMatrix._23 = z;
    /*
    this.setUniformVariable
    (
      "modelViewMatrix",
      new UniformVariableMatrix4fv (this.getModelViewMatrix ().toGL ())
    );
    */
    this.fireNodeChangedEvent (null);
  };
  
  Camera.prototype.move = function (byX, byY, byZ)
  {
    this.viewMatrix._03 = this.viewMatrix._03 + byX;
    this.viewMatrix._13 = this.viewMatrix._13 + byY;
    this.viewMatrix._23 = this.viewMatrix._23 + byZ;
    /*
    this.setUniformVariable
    (
      "modelViewMatrix",
      new UniformVariableMatrix4fv (this.getModelViewMatrix ().toGL ())
    );
    */
    this.fireNodeChangedEvent (null);
  };
  
  Camera.prototype.rotateByQuaternion = function (quaternion)
  {
    // TODO
  };
  
  Camera.prototype.getProjectionMatrix = function ()
  {
    return this.projectionMatrix;
  };
  
  Camera.prototype.setProjectionMatrix = function (projectionMatrix)
  {
    this.projectionMatrix = projectionMatrix;
    this.fireNodeChangedEvent (null);
  };
  
  // -> "https://www.opengl.org/discussion_boards/showthread.php/180756-Gl_NormalMatrix-replacement-in-shaders"
  Camera.prototype.getNormalMatrix = function (modelMatrix)
  {
    return this.getModelViewMatrix (modelMatrix).inverse ().transpose ();
  };
  
  Camera.prototype.getModelViewMatrix = function (modelMatrix)
  {
    return this.getViewMatrix ().mult (modelMatrix);
  };
  
  
  
  //////////////////////////////////////////////////////////////////////
  // -- Implementation of the application logic.                   -- //
  //////////////////////////////////////////////////////////////////////
  
  var canvas              = null;
  var camera              = null;
  var renderer            = null;
  var simpleShaderProgram = null;
  var texShaderProgram    = null;
  var clockShaderProgram  = null;
  var mouseInteractor     = null;
  var fog                 = null;
  
  canvas   = document.getElementById ("glcanvas");
  renderer = new WebGLRenderer       (canvas);
  camera   = new Camera              ();
  fog      = new Fog                 ();
  
  mouseInteractor = new MouseInteractor (canvas);
  
  camera.addNodeListener (renderer);
  
  renderer.addLight (new Light ("lights[0]"));
  renderer.addLight (new Light ("lights[1]"));
  renderer.addLight (new Light ("lights[2]"));
  
  renderer.getLightAtIndex (0).setAmbientColorFromFloats  (0.0, 0.0, 0.0, 1.0);
  renderer.getLightAtIndex (0).setDiffuseColorFromFloats  (1.0, 1.0, 1.0, 1.0);
  renderer.getLightAtIndex (0).setSpecularColorFromFloats (1.0, 1.0, 1.0, 1.0);
  renderer.getLightAtIndex (1).setAmbientColorFromFloats  (0.0, 0.0, 0.0, 1.0);
  renderer.getLightAtIndex (1).setDiffuseColorFromFloats  (1.0, 1.0, 1.0, 1.0);
  renderer.getLightAtIndex (1).setSpecularColorFromFloats (1.0, 1.0, 1.0, 1.0);
  renderer.getLightAtIndex (2).setAmbientColorFromFloats  (0.0, 0.0, 0.0, 1.0);
  renderer.getLightAtIndex (2).setDiffuseColorFromFloats  (1.0, 1.0, 1.0, 1.0);
  renderer.getLightAtIndex (2).setSpecularColorFromFloats (1.0, 1.0, 1.0, 1.0);
  
  fog.setColorFromFloatArray ([1.0, 1.0, 1.0, 1.0]);
  fog.setDensity             (0.5);
  fog.setMinimumDistance     (5.0);
  fog.setMaximumDistance     (9.0);
  fog.setType                (Fog.LINEAR);
  renderer.setFog            (fog);
  
  mouseInteractor.initialize ();
  
  var cameraAnglePhi   = 0.0;
  var cameraAngleTheta = 0.0;
  
  canvas.oncontextmenu = function ()
  {
    return false;
  };
  
  renderer.scaling       = 0.01;
  renderer.scrollScaling = 0.10;
  renderer.mouseDragStarted = function (interactor, mouseEventInfo)
  {
  };
  renderer.mouseDragMoved = function (interactor, mouseEventInfo)
  {
    var dragVector = interactor.getDragVector ();
    
    // Use SFVec3f.multComponents(...) for scaling by a vector.
    //dragVector = dragVector.multiply (this.scaling);
    
    if (dragVector == null)
    {
      alert ("Drag vector equals null.");
    }
    
    /*
    //moveCamera (camera, dragVector.x, dragVector.y, dragVector.z);
    if (dragVector.x > 0.0)
    {
      cameraAnglePhi = cameraAnglePhi + 0.001;
    }
    else if (dragVector.x < 0.0)
    {
      cameraAnglePhi = cameraAnglePhi - 0.001;
    }
    
    if (dragVector.y > 0.0)
    {
      cameraAngleTheta = cameraAngleTheta - 0.001;
    }
    else if (dragVector.y < 0.0)
    {
      cameraAngleTheta = cameraAngleTheta + 0.001;
    }
    */
    
    /*
    cameraAnglePhi   = interactor.getCurrentPoint ().getX () * 0.00005;
    cameraAngleTheta = interactor.getCurrentPoint ().getY () * 0.00005;
    */
    
    if (mouseEventInfo.mouseButton == MouseEventInfo.LEFT_MOUSE_BUTTON)
    {
      cameraAnglePhi   = dragVector.x * -this.scaling;
      cameraAngleTheta = dragVector.y *  this.scaling;
      camtest ();
    }
    else if (mouseEventInfo.mouseButton == MouseEventInfo.RIGHT_MOUSE_BUTTON)
    {
      oldCenterOf = centerOf.negate ();
      centerOf = centerOf.add (dragVector.multiply (0.01));
      //console.log (centerOf);
      camtest ();
    }
  };
  renderer.mouseDragFinished = function (interactor, mouseEventInfo)
  {
  };
  renderer.mouseScrolled = function (interactor)
  {
    moveCamera (camera, 0.0, 0.0, interactor.getCurrentScroll () * this.scrollScaling);
  };
  mouseInteractor.addMouseListener (renderer);
  
  
  /* !!! IMPORTANT: Matrix is the INVERSE MATRIX!!!
   */
  camera.setPosition (0.0, 0.0, -5.0);
  camera.setProjectionMatrix
  (
    VecMath.SFMatrix4f.perspective
    (
      Math.PI / 4.0,
        1.0,
        0.1,
      50.00
    )
  );
  var centerOf    = new VecMath.SFVec3f (0.0, 0.0, 0.0);
  var oldCenterOf = new VecMath.SFVec3f (0.0, 0.0, 0.0);
  
  function moveCamera (camera, byX, byY, byZ)
  {
    camera.move (byX, byY, byZ);
    
    for (var shapeIndex = 0; shapeIndex < renderer.getShapeCount (); shapeIndex++)
    {
      var shape = renderer.getShapeAtIndex (shapeIndex);
      
      /*
      shape.getAppearance ().getShaderVariableSet ().setUniformVariableValue
      (
        "viewMatrix",
        new UniformVariableMatrix4fv (camera.getViewMatrix ().toGL ())
      );
      */
      
      shape.getAppearance ().getShaderVariableSet ().setUniformVariableValue
      (
        "modelViewMatrix",
        new UniformVariableMatrix4fv (camera.getModelViewMatrix (shape.getTransformation ()).toGL ())
      );
      shape.getAppearance ().getShaderVariableSet ().setUniformVariableValue
      (
        "normalMatrix",
        new UniformVariableMatrix4fv (camera.getNormalMatrix (shape.getTransformation ()).toGL ())
      );
      shape.getAppearance ().getShaderVariableSet ().setUniformVariableValue
      (
        "projectionMatrix",
        new UniformVariableMatrix4fv (camera.getProjectionMatrix ().toGL ())
      );
      
      lightPosition = new VecMath.SFVec3f (1.0, 1.0, -5.0);
      lightPosition = camera.getViewMatrix ().multMatrixVec (lightPosition);
      
      // Second light.
      shape.getAppearance ().getShaderVariableSet ().setUniformVariableValue
      (
        "lights[1].position",
        new UniformVariable4f (lightPosition.x, lightPosition.y, lightPosition.z, 0.0)
      );
      
      lightPosition = new VecMath.SFVec3f (6.0, 1.0, -7.0);
      lightPosition = camera.getViewMatrix ().multMatrixPnt (lightPosition);
      
      // Third light.
      shape.getAppearance ().getShaderVariableSet ().setUniformVariableValue
      (
        "lights[2].position",
        new UniformVariable4f (lightPosition.x, lightPosition.y, lightPosition.z, 1.0)
      );
    }
    
    renderer.update ();
  };
  
  
  function resetCamera (camera)
  {
    var shapeCount = 0;
    
    camera.setPosition (0.0, 0.0, -5.0);
    shapeCount = renderer.getShapeCount ();
    
    for (var shapeIndex = 0; shapeIndex < renderer.getShapeCount (); shapeIndex++)
    {
      var shape = renderer.getShapeAtIndex (shapeIndex);
      
      /*
      shape.getAppearance ().getShaderVariableSet ().setUniformVariableValue
      (
        "viewMatrix",
        new UniformVariableMatrix4fv (camera.getViewMatrix ().toGL ())
      );
      */
      shape.getAppearance ().getShaderVariableSet ().setUniformVariableValue
      (
        "modelViewMatrix",
        new UniformVariableMatrix4fv (camera.getModelViewMatrix (shape.getTransformation ()).toGL ())
      );
      shape.getAppearance ().getShaderVariableSet ().setUniformVariableValue
      (
        "projectionMatrix",
        new UniformVariableMatrix4fv (camera.getProjectionMatrix ().toGL ())
      );
    }
    
    renderer.update ();
  };
  
  function camtest ()
  {
    var centerOfRotation = new VecMath.SFVec3f (0.0, 0.0, 0.0);
    // Look left or right (angle phi). See page 31.
    var beta             = 0.0;
    beta = cameraAnglePhi;
    // Look up or down (angle theta). See page 31.
    var alpha            = 0.0;
    var cam              = null;
    var eye              = null;
    var up               = null;
    var mat              = null;
    var v                = null;
    var s                = null;
    
    alpha = cameraAngleTheta;
    
    cam = camera.getViewMatrix ().inverse ();
    eye = cam.e3 ();
    eye = eye.subtract (centerOfRotation);
    
    up = cam.e1 ();
    mat = new VecMath.Quaternion.axisAngle (up, beta).toMatrix ();
    eye = mat.multMatrixPnt (eye);
    v = eye.negate ().normalize ();
    s = v.cross (up);
    mat = new VecMath.Quaternion.axisAngle (s, alpha).toMatrix ();
    eye = mat.multMatrixPnt (eye);
    v = eye.negate ().normalize ();
    up = s.cross (v);
    eye = eye.add (centerOfRotation);
    cam.setValue (s, up, v.negate (), eye);
    camera.setViewMatrix (cam.inverse ());
    
    /*
    var t1 = new VecMath.SFMatrix4f.translation (centerOf).inverse ();
    var t2 = new VecMath.SFMatrix4f.translation (oldCenterOf).inverse ();
    var caminv = cam.inverse ();
    camera.setViewMatrix (t1.mult (caminv).mult (t2));
    */
    
    for (var shapeIndex = 0; shapeIndex < renderer.getShapeCount (); shapeIndex++)
    {
      var shape = renderer.getShapeAtIndex (shapeIndex);
      
      // ALLOWS CHANGE.
      shape.getAppearance ().getShaderVariableSet ().setUniformVariableValue
      (
        "modelViewMatrix",
        new UniformVariableMatrix4fv (camera.getModelViewMatrix (shape.getTransformation ()).toGL ())
      );
      
      
      shape.getAppearance ().getShaderVariableSet ().setUniformVariableValue
      (
        "normalMatrix",
        new UniformVariableMatrix4fv (camera.getNormalMatrix (shape.getTransformation ()).toGL ())
      );
      shape.getAppearance ().getShaderVariableSet ().setUniformVariableValue
      (
        "projectionMatrix",
        new UniformVariableMatrix4fv (camera.getProjectionMatrix ().toGL ())
      );
      
      lightPosition = new VecMath.SFVec3f (1.0, 1.0, -5.0);
      lightPosition = camera.getViewMatrix ().multMatrixVec (lightPosition);
      
      // Second light.
      shape.getAppearance ().getShaderVariableSet ().setUniformVariableValue
      (
        "lights[1].position",
        new UniformVariable4f (lightPosition.x, lightPosition.y, lightPosition.z, 0.0)
      );
      
      lightPosition = new VecMath.SFVec3f (6.0, 1.0, -7.0);
      lightPosition = camera.getViewMatrix ().multMatrixPnt (lightPosition);
      
      // Third light.
      shape.getAppearance ().getShaderVariableSet ().setUniformVariableValue
      (
        "lights[2].position",
        new UniformVariable4f (lightPosition.x, lightPosition.y, lightPosition.z, 1.0)
      );
      
    }
  }
  
  function initializeListeners (camera)
  {
    canvas.setAttribute ("tabindex", "0");
    
    canvas.addEventListener
    (
      "keypress",
      function (event)
      {
        switch (event.charCode)
        {
          // Space
          case 32 :
            resetCamera (camera);
            break;
          
          // +
          case 43 :
            moveCamera (camera,  0.01, 0.0, 0.0);
            break;
          
          // -
          case 45 :
            //moveCamera (camera, -0.01, 0.0, 0.0);
            camtest ();
            break;
          
          default :
            break;
        }
      },
      true
    );
  };
  
  initializeListeners (camera);
  
  var vertexShaderElement   = document.getElementById ("vertex-shader");
  var vertexShaderName      = vertexShaderElement.getAttribute ("name");
  var vertexShader          = vertexShaderElement.textContent;
  var fragmentShaderElement = document.getElementById ("fragment-shader");
  var fragmentShaderName    = fragmentShaderElement.getAttribute ("name");
  var fragmentShader        = fragmentShaderElement.textContent;
  
  
  var calculateFogScale = function ()
  {
    var fogScale           = 0.0;
    var minimumFogDistance = 0.0;
    var maximumFogDistance = 0.0;
    
    for (var shapeIndex = 0;
             shapeIndex < renderer.getShapeCount ();
             shapeIndex++)
    {
      var shape             = renderer.getShapeAtIndex (shapeIndex);
      var shaderVariableSet = null;
      
      shaderVariableSet  = shape.getAppearance ().getShaderVariableSet ();
      minimumFogDistance = shaderVariableSet.getUniformVariableByName ("fog.minimumDistance").getValue ();
      maximumFogDistance = shaderVariableSet.getUniformVariableByName ("fog.maximumDistance").getValue ();
      fogScale           = 1.0 / (maximumFogDistance - minimumFogDistance);
    }
    
    return fogScale;
  };
  
  // Vertex indices named as constants.
  // -> "3_GLSL_Texturen_Mathe.pdf", S. 13
  var LEFT_TOP_FRONT     = 0;
  var LEFT_BOTTOM_FRONT  = 1;
  var RIGHT_BOTTOM_FRONT = 2;
  var RIGHT_TOP_FRONT    = 3;
  var LEFT_TOP_BACK      = 4;
  var LEFT_BOTTOM_BACK   = 5;
  var RIGHT_BOTTOM_BACK  = 6;
  var RIGHT_TOP_BACK     = 7;
  
  var testShape             = null;
  var testGeometry          = null;
  var testVertices          = null;
  var testIndices           = null;
  var testAppearance        = null;
  var testShaderProgram     = null;
  var testUniformNames      = null;
  var testShaderVariableSet = null;
  
  testShape    = new Shape3D ();
  testVertices =
  [
    new Point3D (-0.5,  0.5,  0.5),     // 0 = Left-top-front.
    new Point3D (-0.5, -0.5,  0.5),     // 1 = Left-bottom-front.
    new Point3D ( 0.5, -0.5,  0.5),     // 2 = Right-bottom-front.
    new Point3D ( 0.5,  0.5,  0.5),     // 3 = Right-top-front.
    new Point3D (-0.5,  0.5, -0.5),     // 4 = Left-top-back.
    new Point3D (-0.5, -0.5, -0.5),     // 5 = Left-bottom-back.
    new Point3D ( 0.5, -0.5, -0.5),     // 6 = Right-bottom-back.
    new Point3D ( 0.5,  0.5, -0.5)      // 7 = Right-top-back.
  ];
  testIndices  =
  [
    // Front side:
    LEFT_BOTTOM_FRONT, RIGHT_BOTTOM_FRONT, RIGHT_TOP_FRONT,
    LEFT_BOTTOM_FRONT, RIGHT_TOP_FRONT,    LEFT_TOP_FRONT,
    
    // Left side:
    RIGHT_BOTTOM_FRONT, RIGHT_BOTTOM_BACK, RIGHT_TOP_BACK,
    RIGHT_BOTTOM_FRONT, RIGHT_TOP_BACK,    RIGHT_TOP_FRONT,
    
    // Top side:
    LEFT_TOP_FRONT,     RIGHT_TOP_FRONT,   RIGHT_TOP_BACK,
    RIGHT_TOP_BACK,     LEFT_TOP_BACK,     LEFT_TOP_FRONT,
    
    // Bottom side:
    LEFT_BOTTOM_FRONT,  RIGHT_BOTTOM_FRONT,   RIGHT_BOTTOM_BACK,
    RIGHT_BOTTOM_BACK,  LEFT_BOTTOM_BACK,     LEFT_BOTTOM_FRONT
  ];
  testGeometry = new IndexedTriangleGeometry (testVertices, testIndices);
  testGeometry.setColorAtIndexFromRGB  (0, 1.0, 1.0, 1.0);
  testGeometry.setColorAtIndexFromRGB  (1, 1.0, 0.0, 0.0);
  testGeometry.setColorAtIndexFromRGB  (2, 0.0, 1.0, 0.0);
  testGeometry.setColorAtIndexFromRGB  (3, 0.0, 0.0, 1.0);
  
  testGeometry.setNormalAtIndexFromXYZ (0, 0.0, 0.0, -1.0);
  testGeometry.setNormalAtIndexFromXYZ (1, 0.0, 0.0, -1.0);
  testGeometry.setNormalAtIndexFromXYZ (2, 0.0, 0.0, -1.0);
  testGeometry.setNormalAtIndexFromXYZ (3, 0.0, 0.0, -1.0);
  testGeometry.setNormalAtIndexFromXYZ (4, 0.0, 0.0, -1.0);
  testGeometry.setNormalAtIndexFromXYZ (5, 0.0, 0.0, -1.0);
  testGeometry.setNormalAtIndexFromXYZ (6, 0.0, 0.0, -1.0);
  testGeometry.setNormalAtIndexFromXYZ (7, 0.0, 0.0, -1.0);
  
  var lightPosition = null;
  //var viewMatrix    = camera.getViewMatrix ();
  
  testAppearance = createDefaultAppearance ();
  
  testShape.setGeometry                     (testGeometry);
  testShape.setAppearance                   (testAppearance);
  testShaderVariableSet = testAppearance.getShaderVariableSet ();
  testShaderVariableSet.setUniformVariableValue
  (
    "projectionMatrix",
    new UniformVariableMatrix4fv (camera.getProjectionMatrix ().toGL ())
  );
  /*
  testShaderVariableSet.setUniformVariableValue
  (
    "viewMatrix",
    new UniformVariableMatrix4fv (camera.getViewMatrix ().toGL ())
  );
  testShaderVariableSet.setUniformVariableValue
  (
    "modelMatrix",
    new UniformVariableMatrix4fv (testShape.getTransformation ().toGL ())
  );
  */
  testShaderVariableSet.setUniformVariableValue
  (
    "modelViewMatrix",
    new UniformVariableMatrix4fv (camera.getModelViewMatrix (testShape.getTransformation ()).toGL ())
  );
  testShaderVariableSet.setUniformVariableValue
  (
    "normalMatrix",
    new UniformVariableMatrix4fv (camera.getNormalMatrix (testShape.getTransformation ()).toGL ())
  );
  /*
  testShaderVariableSet.setUniformVariableValue
  (
    "eyePosition",
    new UniformVariable3fv (camera.getPosition ())
    //new UniformVariable3fv ([0.0, 0.0, 0.0])
  );
  */
  
  lightPosition = new VecMath.SFVec3f (1.0, 1.0, -5.0);
  lightPosition = camera.getViewMatrix ().multMatrixVec (lightPosition);
  
  // Second light.
  testShaderVariableSet.setUniformVariableValue
  (
    "lights[1].position",
    new UniformVariable4f (lightPosition.x, lightPosition.y, lightPosition.z, 0.0)
  );
  renderer.getLightAtIndex (1).setPositionFromFloats (lightPosition.x, lightPosition.y, lightPosition.z, 0.0);
  
  lightPosition = new VecMath.SFVec3f (6.0, 1.0, -7.0);
  lightPosition = camera.getViewMatrix ().multMatrixPnt (lightPosition);
  
  // Third light.
  testShaderVariableSet.setUniformVariableValue
  (
    "lights[2].position",
    new UniformVariable4f (lightPosition.x, lightPosition.y, lightPosition.z, 1.0)
  );
  renderer.getLightAtIndex (2).setPositionFromFloats (lightPosition.x, lightPosition.y, lightPosition.z, 0.0);
  
  
  function createDefaultUniformVariableNames ()
  {
    var uniformVariableNames = null;
    
    uniformVariableNames =
    [
      "projectionMatrix",
      //"viewMatrix",
      //"modelMatrix",
      "modelViewMatrix",
      "normalMatrix",
      //"eyePosition",
      
      "lights[0].position",
      "lights[0].ambientColor",
      "lights[0].diffuseColor",
      "lights[0].specularColor",
      "lights[0].isEnabled",
      "lights[0].constantAttenuation",
      "lights[0].linearAttenuation",
      "lights[0].quadraticAttenuation",
      "lights[1].position",
      "lights[1].ambientColor",
      "lights[1].diffuseColor",
      "lights[1].specularColor",
      "lights[1].isEnabled",
      "lights[1].constantAttenuation",
      "lights[1].linearAttenuation",
      "lights[1].quadraticAttenuation",
      "lights[2].position",
      "lights[2].ambientColor",
      "lights[2].diffuseColor",
      "lights[2].specularColor",
      "lights[2].isEnabled",
      "lights[2].constantAttenuation",
      "lights[2].linearAttenuation",
      "lights[2].quadraticAttenuation",
      
      "transparency",
      
      "straussParameters.surfaceColor",
      "straussParameters.highlightBaseColor",
      "straussParameters.metalness",
      "straussParameters.smoothness",
      "straussParameters.transparency",
      "straussParameters.fresnelConstant",
      "straussParameters.shadowConstant",
      "straussParameters.offSpecularPeak",
      
      "cookTorranceParameters.diffuseColor",
      "cookTorranceParameters.emissiveColor",
      "cookTorranceParameters.specularColor",
      "cookTorranceParameters.roughness",
      "cookTorranceParameters.distributionFunction",
      "cookTorranceParameters.distributionParameter",
      "cookTorranceParameters.fresnelFunction",
      "cookTorranceParameters.reflectionCoefficient",
      "cookTorranceParameters.specularTermScale",
      
      "wardParameters.direction",
      "wardParameters.roughnessParameters",
      "wardParameters.ambientColor",
      "wardParameters.diffuseColor",
      "wardParameters.emissiveColor",
      "wardParameters.specularColor",
      
      "ashikhminShirleyMaterial.referenceAxis",
      "ashikhminShirleyMaterial.exponentialFactors",
      "ashikhminShirleyMaterial.diffuseColor",
      "ashikhminShirleyMaterial.specularColor",
      
      "lommelSeeligerParameters.diffuseColor",
      "lommelSeeligerParameters.diffuseBias",
      "lommelSeeligerParameters.diffuseScale",
      "lommelSeeligerParameters.diffuseExponent",
      
      "specularMaterial.ambientColor",
      "specularMaterial.ambientIntensity",
      "specularMaterial.diffuseColor",
      "specularMaterial.emissiveColor",
      "specularMaterial.specularColor",
      "specularMaterial.specularIntensity",
      "specularMaterial.shininess",
      "specularMaterial.enabled",
      "specularMaterial.type",
      
      "orenNayarParameters.diffuseColor",
      "orenNayarParameters.roughness",
      "orenNayarParameters.diffuseTermFunction",
      "orenNayarParameters.useInterreflection",
      
      "minnaertParameters.diffuseColor",
      "minnaertParameters.roughness",
      
      "lambertParameters.diffuseColor",
      
      "goochParameters.surfaceColor",
      "goochParameters.coolColor",
      "goochParameters.warmColor",
      "goochParameters.coolMixValue",
      "goochParameters.warmMixValue",
      "goochParameters.colorBlendingEquation",
      "goochParameters.ambientTermFormula",
      
      "fog.color",
      "fog.density",
      "fog.minimumDistance",
      "fog.maximumDistance",
      "fog.scale",
      "fog.type",
      "fog.isEnabled",
      
      "gammaCorrection.enabled",
      
      "fresnelParameters.bias",
      "fresnelParameters.scale",
      "fresnelParameters.power",
      "fresnelParameters.color",
      "fresnelParameters.enabled",
      
      "texturing.enabled",
      "texturing.mode",
      "texture"
    ];
    
    return uniformVariableNames;
  }
  
  function createDefaultShaderProgram ()
  {
    var shaderProgram        = null;
    var uniformVariableNames = null;
    
    shaderProgram = new ShaderProgram ();
    shaderProgram.setVertexShader      (new DefaultVertexShader   (vertexShader));
    shaderProgram.setFragmentShader    (new DefaultFragmentShader (fragmentShader));
    
    shaderProgram.addAttributeVariable (new AttributeVariableData ("vertex",    3, "float", false, 0, 0));
    shaderProgram.addAttributeVariable (new AttributeVariableData ("normal",    3, "float", false, 0, 0));
    shaderProgram.addAttributeVariable (new AttributeVariableData ("color",     3, "float", false, 0, 0));
    shaderProgram.addAttributeVariable (new AttributeVariableData ("texCoords", 2, "float", false, 0, 0));
    shaderProgram.addAttributeVariable (new AttributeVariableData ("tangent",   3, "float", false, 0, 0));
    
    uniformVariableNames = createDefaultUniformVariableNames ();
    shaderProgram.setUniformVariableNames (uniformVariableNames);
    
    return shaderProgram;
  }
  
  function createDefaultAppearance ()
  {
    var appearance    = null;
    var shaderProgram = null;
    
    appearance    = new Appearance             ();
    shaderProgram = createDefaultShaderProgram ();
    appearance.setShaderProgram                (shaderProgram);
    
    return appearance;
  }
  
  
  
  function getBoundsNormalizingMatrix (sourceBounds, destinationBounds)
  {
    var compoundMatrix    = null;
    var sourceCenter      = null;
    var destinationCenter = null;
    var translationVector = null;
    var translationMatrix = null;
    var scaleFactor       = 0.0;
    var scaleVector       = null;
    var scaleMatrix       = null;
    
    sourceCenter      = new Point3D (sourceBounds.midpointX,
                                     sourceBounds.midpointY,
                                     sourceBounds.midpointZ);
    destinationCenter = new Point3D (destinationBounds.midpointX,
                                     destinationBounds.midpointY,
                                     destinationBounds.midpointZ);
    translationVector = sourceCenter.getVectorFromMeToOtherAsSFVec3f (destinationCenter);
    translationMatrix = new VecMath.SFMatrix4f.translation (translationVector);
    
    scaleFactor = Math.min (destinationBounds.width  / sourceBounds.width,
                            destinationBounds.height / sourceBounds.height,
                            destinationBounds.depth  / sourceBounds.depth);
    scaleVector = new VecMath.SFVec3f (scaleFactor, scaleFactor, scaleFactor);
    scaleMatrix = new VecMath.SFMatrix4f.scale (scaleVector);
    
    compoundMatrix = new VecMath.SFMatrix4f.identity ();
    compoundMatrix = compoundMatrix.mult (scaleMatrix);
    compoundMatrix = compoundMatrix.mult (translationMatrix);
    
    return compoundMatrix;
  };
  
  
  //var aLoaderListener   = new Object      ();
  var objectModelLoader = new ModelLoader ();
  renderer.modelLoaded = function (loader, fileName)
  {
    var loadedScene    = loader.getDrawingInfo ();
    var sceneShape3D   = new Shape3D           ();
    var scenePoints3D  = [];
    var sceneGeometry  = null
    var sceneIndices   = null;
    var sceneNormals   = null;
    var sceneColors    = null;
    var sceneTexCoords = null;
    var sceneTexName   = null;
    var behavior       = null;
    
    for (var pointIndex = 0; pointIndex < loadedScene.positions.length;
             pointIndex = pointIndex + 3)
    {
      var currentPoint = null;
      
      currentPoint = new Point3D
      (
        loadedScene.positions[pointIndex + 0],
        loadedScene.positions[pointIndex + 1],
        loadedScene.positions[pointIndex + 2]
      );
      scenePoints3D.push (currentPoint);
    }
    
    behavior = new RotationBehavior (sceneShape3D,
                                     0.0, 2.0 * Math.PI,
                                     Math.PI / 100.0,
                                     {delay : 100});
    //behavior.setAxisOfRotationFromFloats (0.0, 1.0, 1.0);
    
    sceneIndices   = loadedScene.indices;
    sceneNormals   = loadedScene.normals;
    sceneColors    = loadedScene.colors;
    // Currently unused.
    sceneTexCoords = loadedScene.texCoords;
    sceneTexName   = loadedScene.textureName;
    
    sceneGeometry  = new IndexedTriangleGeometry (scenePoints3D, sceneIndices);
    sceneGeometry.setNormalsFromFloatArray (sceneNormals);
    
    if (sceneColors != null)
    {
      sceneGeometry.setColorsRGBFromFloatArray (sceneColors);
    }
    
    sceneShape3D.setGeometry   (sceneGeometry);
    sceneShape3D.setAppearance (testAppearance);
    //sceneShape3D.addBehavior   (behavior);
    sceneShape3D.setName       (fileName);
    renderer.addShape3D        (sceneShape3D);
    
    if (loader.normalize)
    {
      var normalizingMatrix      = null;
      var sourceBoundingBox      = null;
      var destinationBoundingBox = null;
      
      destinationBoundingBox = new BoundingBox ();
      //destinationBoundingBox.setToUnitCube ();
      destinationBoundingBox.setToCoordinatesAndDimensions
      (
        0.0, 0.0, 0.0,
        4.0, 4.0, 4.0
      );
      
      sourceBoundingBox = sceneShape3D.getBoundingBox ();
      normalizingMatrix = getBoundsNormalizingMatrix
      (
        sourceBoundingBox,
        destinationBoundingBox
      );
      sceneShape3D.transformation = sceneShape3D.transformation.mult (normalizingMatrix);
    }
    
    renderer.render ();
  };
  renderer.modelLoadingFailed = function (loader, fileName)
  {
    alert ("Model could not be loaded?");
  };
  objectModelLoader.addModelLoaderListener (renderer);
  objectModelLoader.setScaleFactor         (0.5);
  objectModelLoader.setReverseNormals      (false);
  //objectModelLoader.loadObject             ("models/bunny.obj");
  //objectModelLoader.loadObject             ("models/teapot.obj");
  //objectModelLoader.loadObject             ("models/teapot_jburkhardt.obj");
  //objectModelLoader.loadObject             ("models/teapot_mit.obj");
  //objectModelLoader.loadObject             ("models/teddy.obj");
  //objectModelLoader.loadObject             ("models/models/buddha.obj");
  //objectModelLoader.loadObject             ("models/models/bunny.obj");
  objectModelLoader.loadObject             ("models/models/cow.obj");
  //objectModelLoader.loadObject             ("models/models/dragon.obj");
  
  
  var loadModelFromFileName = function (fileName, loadingOptions)
  {
    //var offModelLoader = new ModelLoader ();
    
    offModelLoader = objectModelLoader;
    //offModelLoader.addModelLoaderListener (renderer);
    
    if (loadingOptions != null)
    {
      offModelLoader.setScaleFactor    (loadingOptions.scaleFactor);
      offModelLoader.setReverseNormals (loadingOptions.reverseNormals);
      offModelLoader.normalize = loadingOptions.normalize;
    }
    else
    {
      offModelLoader.setScaleFactor    (1.0);
      offModelLoader.setReverseNormals (false);
      offModelLoader.normalize = false;
    }
    
    offModelLoader.loadObject (fileName);
  };
  
  
  
  function addSphere ()
  {
    var sphereShape3D    = null;
    var sphereCenter     = null;
    var sphereRadius     = 0.0;
    var sphereData       = null;
    var spherePositions  = null;
    var sphereIndices    = null;
    var sphereNormals    = null;
    var sphereTexCoords  = null;
    var sphereGeometry   = null;
    var sphereAppearance = null;
    
    sphereShape3D    = new Shape3D ();
    //sphereCenter     = new Point3D (-0.5, 1.5, 0.0);
    sphereCenter     = new Point3D (0.0, 0.0, 0.0);
    sphereRadius     = 1.0;
    sphereData       = getSphereData (sphereCenter, sphereRadius, 25, 25);
    spherePositions  = sphereData.points;
    sphereIndices    = getSpherePointIndices       (sphereData);
    sphereNormals    = getSphereNormals            (sphereData);
    sphereTexCoords  = getSphereTextureCoordinates (sphereData);
    sphereGeometry   = new IndexedTriangleGeometry (spherePositions, sphereIndices);
    sphereAppearance = createDefaultAppearance ();
    
    for (var pointIndex = 0; pointIndex < sphereData.pointCount; pointIndex++)
    {
      sphereGeometry.setNormalAtIndexFromXYZ
      (
        pointIndex,
        sphereNormals[pointIndex].x,
        sphereNormals[pointIndex].y,
        sphereNormals[pointIndex].z
      );
      
      sphereGeometry.setTextureCoordinatesAtIndexFromST
      (
        pointIndex,
        sphereTexCoords[pointIndex].x,
        sphereTexCoords[pointIndex].y
      );
    }
    
    var sphereTexture = new Texture2D ();
    sphereTexture.enabled = true;
    //var rotationBehavior = new RotationBehavior (sphereShape3D, 0.0, 2.0 * Math.PI, Math.PI / 100.0, {delay : 10});
    sphereShape3D.setGeometry   (sphereGeometry);
    sphereShape3D.setAppearance (sphereAppearance);
    sphereTexture.setImageFromURL ("textures/brick.jpg");
    sphereAppearance.setTexture2D (sphereTexture);
    sphereShape3D.setName       ("sphere");
    //sphereShape3D.addBehavior   (rotationBehavior);
    
    /*
    var translationMatrix = VecMath.SFMatrix4f.translation (new VecMath.SFVec3f (0.0, 1.95, 0.0));
    sphereShape3D.transformation = sphereShape3D.getTransformation ().mult (translationMatrix);
    */
    
    renderer.addShape3D         (sphereShape3D);
    renderer.update ();
    
    return sphereShape3D;
  }
  
  var addSphereButton = document.getElementById ("addSphereButton");
  
  if (addSphereButton != null)
  {
    addSphereButton.addEventListener
    (
      "click",
      function (event)
      {
        addSphere ();
      },
      false
    );
  }
  
  
  // Point3D objects --> VecMath.SFVec3f object
  function getTriangleSurfaceNormal (point1, point2, point3)
  {
    var surfaceNormal = null;
    var vector1       = null;
    var vector2       = null;
    
    vector1       = getSFVec3fBetweenPoint3Ds (point1, point2);
    vector2       = getSFVec3fBetweenPoint3Ds (point1, point3);
    surfaceNormal = vector1.cross             (vector2);
    
    return surfaceNormal;
  };
  
  
  
  // RGB as float array.
  // -> "http://jscolor.com/try.php#getting-color"
  function getRGBColorArrayFromColorChooser (colorChooserElement)
  {
    if (colorChooserElement != null)
    {
      return colorChooserElement.color.rgb;
    }
    else
    {
      return null;
    }
  };
  
  function getRGBAColorArrayFromColorChooser (colorChooserElement)
  {
    var colorRGBA = null;
    var colorRGB  = null;
    
    colorRGB = getRGBColorArrayFromColorChooser (colorChooserElement);
    
    if (colorRGB)
    {
      colorRGBA = colorRGB.slice ();
      colorRGBA.push (1.0);
    }
    else
    {
      colorRGBA = null;
    }
    
    return colorRGBA;
  };
  
  function updateSpecularColor (color)
  {
  };
  
  
  var selectedLightIndex = 0;
  var selectedShapes     = [];
  
  // Return the selected light's index.
  function getSelectedLightIndex ()
  {
    return selectedLightIndex;
  };
  
  // Return the selected light's uniform variable name, e.g. "light[0]".
  function getSelectedLightName ()
  {
    var lightName  = null;
    var lightIndex = 0;
    
    lightIndex = getSelectedLightIndex ();
    lightName  = "lights[" + lightIndex + "]";
    
    return lightName;
  }
  
  function getSelectedLight ()
  {
    var selectedLightName  = null;
    
    selectedLightName = getSelectedLightName ();
    
    for (var lightIndex = 0; lightIndex < renderer.lights.length; lightIndex++)
    {
      var light = renderer.lights[lightIndex];
      
      if (light.lightName == selectedLightName)
      {
        return light;
      }
    }
    
    return null;
  }
  
  
  // Light property configuration elements.
  var lightIndexSelectMenu         = document.getElementById ("lightIndexSelectMenu");
  var lightEnabledCheckbox         = document.getElementById ("lightEnabledCheckbox");
  var lightPositionXInput          = document.getElementById ("lightPositionXInput");
  var lightPositionYInput          = document.getElementById ("lightPositionYInput");
  var lightPositionZInput          = document.getElementById ("lightPositionZInput");
  var ambientLightColorChooser     = document.getElementById ("ambientLightColorChooser");
  var diffuseLightColorChooser     = document.getElementById ("diffuseLightColorChooser");
  var specularLightColorChooser    = document.getElementById ("specularLightColorChooser");
  var lightAttenuationConstant     = document.getElementById ("lightAttenuationConstant");
  var lightAttenuationLinear       = document.getElementById ("lightAttenuationLinear");
  var lightAttenuationQuadratic    = document.getElementById ("lightAttenuationQuadratic");
  
  // Fog property configuration elements.
  var fogTypeSelectMenu            = document.getElementById ("fogTypeSelectMenu");
  var fogMinimumDistanceInput      = document.getElementById ("fogMinimumDistance");
  var fogMaximumDistanceInput      = document.getElementById ("fogMaximumDistance");
  var fogDensityInput              = document.getElementById ("fogDensityInput");
  var fogColorChooser              = document.getElementById ("fogColorChooser");
  var fogEnabledCheckbox           = document.getElementById ("fogEnabledCheckbox");
  // Material property configuration elements.
  var transparencySlider           = document.getElementById ("transparencySlider");
  var showUniformVariablesButton   = document.getElementById ("showUniformVariablesButton");
  // Scene graph elements.
  var sceneGraphSelectMenu         = document.getElementById ("sceneGraphSelectMenu");
  var sceneGraphListContent        = document.getElementById ("sceneGraphListContent");
  
  renderer.addRendererListener (sceneGraphSelectMenu);
  renderer.addRendererListener (sceneGraphListContent);
  
  var setColorChooserRGBFromArray = function (colorChooser, colorComponents)
  {
    if ((colorChooser != null) && (colorComponents != null))
    {
      colorChooser.color.fromRGB
      (
        colorComponents[0],
        colorComponents[1],
        colorComponents[2]
      );
    }
  };
  
  var initializeLightPositionFields = function ()
  {
    var lightPosition = getSelectedLight ().getPositionAsFloatArray ();
    
    lightPositionXInput.value = lightPosition[0];
    lightPositionYInput.value = lightPosition[1];
    lightPositionZInput.value = lightPosition[2];
  };
  
  var initializeLightAttenuationFields = function ()
  {
    var light = getSelectedLight ();
    
    lightAttenuationConstant.value  = light.constantAttenuation;
    lightAttenuationLinear.value    = light.linearAttenuation;
    lightAttenuationQuadratic.value = light.quadraticAttenuation;
  };
  
  var initializeLightColorFields = function ()
  {
    var light           = getSelectedLight                   ();
    var ambientColor    = light.getAmbientColorAsFloatArray  ();
    var diffuseColor    = light.getDiffuseColorAsFloatArray  ();
    var specularColor   = light.getSpecularColorAsFloatArray ();
    
    setColorChooserRGBFromArray (ambientLightColorChooser,  ambientColor);
    setColorChooserRGBFromArray (diffuseLightColorChooser,  diffuseColor);
    setColorChooserRGBFromArray (specularLightColorChooser, specularColor);
  };
  
  var initializeLightEnablingField = function ()
  {
    lightEnabledCheckbox.checked = getSelectedLight ().isEnabled ();
  };
  
  var initializeLightSelectMenu = function ()
  {
    lightIndexSelectMenu.value = "0";
  };
  
  var initializeAllLightFields = function ()
  {
    initializeLightSelectMenu        ();
    initializeLightEnablingField     ();
    initializeLightPositionFields    ();
    initializeLightAttenuationFields ();
    initializeLightColorFields       ();
  };
  
  var initializeFogFields = function ()
  {
    var fog                = renderer.getFog ();
    var fogType            = fog.type;
    var fogMinimumDistance = fog.minimumDistance;
    var fogMaximumDistance = fog.maximumDistance;
    var fogDensity         = fog.density;
    var fogColor           = fog.color;
    var isFogEnabled       = fog.isEnabled;
    
    setColorChooserRGBFromArray (fogColorChooser,  fogColor);
    fogTypeSelectMenu.value       = fogType;
    fogMinimumDistanceInput.value = fogMinimumDistance;
    fogMaximumDistanceInput.value = fogMaximumDistance;
    fogDensityInput.value         = fogDensity;
    fogEnabledCheckbox.checked    = isFogEnabled;
  };
  
  // Enable/Disable all material related form fields.
  var updateMaterialFields = function ()
  {
    var materialFields = null;
    var disableFields  = false;
    
    materialFields = document.getElementsByClassName ("materialElement");
    disableFields  = (selectedShapes.length <= 0);
    
    for (var fieldIndex = 0; fieldIndex < materialFields.length; fieldIndex++)
    {
      var field = materialFields[fieldIndex];
      
      field.disabled = disableFields;
    }
  };
  
  initializeAllLightFields      ();
  initializeFogFields           ();
  
  lightIndexSelectMenu.addEventListener
  (
    "change",
    function (event)
    {
      selectedLightIndex = lightIndexSelectMenu.value;
      
      initializeLightEnablingField     ();
      initializeLightPositionFields    ();
      initializeLightAttenuationFields ();
      initializeLightColorFields       ();
    },
    false
  );
  
  lightEnabledCheckbox.addEventListener
  (
    "click",
    function (event)
    {
      var isLightEnabled = lightEnabledCheckbox.checked;
      
      getSelectedLight ().setEnabled (isLightEnabled);
      
      renderer.update ();
    },
    false
  );
  
  ambientLightColorChooser.addEventListener
  (
    "change",
    function (event)
    {
      var light             = null;
      var ambientLightColor = null;
      
      light             = getSelectedLight ();
      ambientLightColor = getRGBAColorArrayFromColorChooser (ambientLightColorChooser);
      
      if (light != null)
      {
        light.setAmbientColorFromFloatArray (ambientLightColor);
      }
      
      renderer.update ();
    },
    false
  );
  
  diffuseLightColorChooser.addEventListener
  (
    "change",
    function (event)
    {
      var light             = null;
      var diffuseLightColor = null;
      
      light             = getSelectedLight ();
      diffuseLightColor = getRGBAColorArrayFromColorChooser (diffuseLightColorChooser);
      
      if (light != null)
      {
        light.setDiffuseColorFromFloatArray (diffuseLightColor);
      }
      
      renderer.update ();
    },
    false
  );
  
  specularLightColorChooser.addEventListener
  (
    "change",
    function (event)
    {
      var light              = null;
      var specularLightColor = null;
      
      light              = getSelectedLight ();
      specularLightColor = getRGBAColorArrayFromColorChooser (specularLightColorChooser);
      
      if (light != null)
      {
        light.setSpecularColorFromFloatArray (specularLightColor);
      }
      renderer.update ();
    },
    false
  );
  
  if (lightAttenuationConstant != null)
  {
    lightAttenuationConstant.addEventListener
    (
      "change",
      function (event)
      {
        var light = null;
        var value = null;
        
        light = getSelectedLight ();
        value = parseFloat       (lightAttenuationConstant.value);
        
        if (light != null)
        {
          light.setConstantAttenuation (value);
        }
        
        renderer.update ();
      },
      false
    );
  }
  
  if (lightAttenuationLinear != null)
  {
    lightAttenuationLinear.addEventListener
    (
      "change",
      function (event)
      {
        var light = null;
        var value = null;
        
        light = getSelectedLight ();
        value = parseFloat       (lightAttenuationLinear.value);
        
        if (light != null)
        {
          light.setLinearAttenuation (value);
        }
        
        renderer.update ();
      },
      false
    );
  }
  
  if (lightAttenuationQuadratic != null)
  {
    lightAttenuationQuadratic.addEventListener
    (
      "change",
      function (event)
      {
        var light = null;
        var value = null;
        
        light = getSelectedLight ();
        value = parseFloat       (lightAttenuationQuadratic.value);
        
        if (light != null)
        {
          light.setQuadraticAttenuation (value);
        }
        
        renderer.update ();
      },
      false
    );
  }
  
  
  
  fogColorChooser.addEventListener
  (
    "change",
    function (event)
    {
      var fogColor = null;
      
      fogColor = getRGBAColorArrayFromColorChooser (fogColorChooser);
      
      renderer.getFog ().setColorFromFloatArray (fogColor);
      renderer.update ();
    },
    false
  );
  
  fogTypeSelectMenu.addEventListener
  (
    "change",
    function (event)
    {
      var fogType = fogTypeSelectMenu.value;
      
      renderer.getFog ().setType (fogType);
      renderer.update ();
    },
    false
  );
  
  fogMinimumDistanceInput.addEventListener
  (
    "change",
    function (event)
    {
      var minimumFogDistance = fogMinimumDistanceInput.value;
      
      renderer.getFog ().setMinimumDistance (minimumFogDistance);
      renderer.update ();
    }
  );
  
  fogMaximumDistanceInput.addEventListener
  (
    "change",
    function (event)
    {
      var maximumFogDistance = fogMaximumDistanceInput.value;
      
      renderer.getFog ().setMaximumDistance (maximumFogDistance);
      renderer.update ();
    }
  );
  
  fogDensityInput.addEventListener
  (
    "change",
    function (event)
    {
      var fogDensity = fogDensityInput.value;
      
      renderer.getFog ().setDensity (fogDensity);
      renderer.update ();
    }
  );
  
  fogEnabledCheckbox.addEventListener
  (
    "click",
    function (event)
    {
      var isFogEnabled = fogEnabledCheckbox.checked;
      
      renderer.getFog ().setEnabled (isFogEnabled);
      renderer.update ();
    },
    false
  );
  
  
  if (transparencySlider != null)
  {
    transparencySlider.addEventListener
    (
      "change",
      function (event)
      {
        var transparency = 0.0;
        
        transparency = transparencySlider.value;
        
        for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
                 shapeIndex++)
        {
          var shape = selectedShapes[shapeIndex];
          
          shape.transparency.setTransparencyFromFloat (transparency);
        }
        renderer.update ();
      },
      false
    );
  }
  
  function updateTransparencyControlElements ()
  {
    if ((transparencySlider == null) || (! hasSelectedShapes ()))
    {
      return;
    }
    
    var firstShape = getFirstSelectedShape ();
    
    transparencySlider.value = firstShape.transparency.transparencyValue;
  }
  
  
  var straussSurfaceColor       = document.getElementById ("straussSurfaceColor");
  var straussHighlightBaseColor = document.getElementById ("straussHighlightBaseColor");
  var straussMetalness          = document.getElementById ("straussMetalness");
  var straussSmoothness         = document.getElementById ("straussSmoothness");
  var straussTransparency       = document.getElementById ("straussTransparency");
  var straussFresnelConstant    = document.getElementById ("straussFresnelConstant");
  var straussShadowConstant     = document.getElementById ("straussShadowConstant");
  var straussOffSpecularPeak    = document.getElementById ("straussOffSpecularPeak");
  
  if (straussMetalness != null)
  {
    straussMetalness.addEventListener
    (
      "change",
      function (event)
      {
        var metalness = 0.0;
        
        metalness = straussMetalness.value;
        
        for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
                 shapeIndex++)
        {
          var shape = selectedShapes[shapeIndex];
          
          shape.straussParameters.metalness = metalness;
        }
        renderer.update ();
      },
      false
    );
  }
  
  if (straussSmoothness != null)
  {
    straussSmoothness.addEventListener
    (
      "change",
      function (event)
      {
        var smoothness = 0.0;
        
        smoothness = straussSmoothness.value;
        
        for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
                 shapeIndex++)
        {
          var shape = selectedShapes[shapeIndex];
          
          shape.straussParameters.smoothness = smoothness;
        }
        
        renderer.update ();
      },
      false
    );
  }
  
  if (straussTransparency != null)
  {
    straussTransparency.addEventListener
    (
      "change",
      function (event)
      {
        var transparency = 0.0;
        
        transparency = straussTransparency.value;
        
        for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
                 shapeIndex++)
        {
          var shape = selectedShapes[shapeIndex];
          
          shape.straussParameters.transparency = transparency;
        }
        
        renderer.update ();
      },
      false
    );
  }
  
  if (straussFresnelConstant != null)
  {
    straussFresnelConstant.addEventListener
    (
      "change",
      function (event)
      {
        var value = 0.0;
        
        value = straussFresnelConstant.value;
        
        for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
                 shapeIndex++)
        {
          var shape = selectedShapes[shapeIndex];
          
          shape.straussParameters.fresnelConstant = value;
        }
        
        renderer.update ();
      },
      false
    );
  }
  
  if (straussShadowConstant != null)
  {
    straussShadowConstant.addEventListener
    (
      "change",
      function (event)
      {
        var value = 0.0;
        
        value = straussShadowConstant.value;
        
        for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
                 shapeIndex++)
        {
          var shape = selectedShapes[shapeIndex];
          
          shape.straussParameters.shadowConstant = value;
        }
        
        renderer.update ();
      },
      false
    );
  }
  
  if (straussOffSpecularPeak != null)
  {
    straussOffSpecularPeak.addEventListener
    (
      "change",
      function (event)
      {
        var value = 0.0;
        
        value = straussOffSpecularPeak.value;
        
        for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
                 shapeIndex++)
        {
          var shape = selectedShapes[shapeIndex];
          
          shape.straussParameters.offSpecularPeak = value;
        }
        
        renderer.update ();
      },
      false
    );
  }
  
  if (straussSurfaceColor != null)
  {
    straussSurfaceColor.addEventListener
    (
      "change",
      function (event)
      {
        var color = null;
        
        color = getRGBAColorArrayFromColorChooser (straussSurfaceColor);
        
        for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
                 shapeIndex++)
        {
          var shape = selectedShapes[shapeIndex];
          
          shape.straussParameters.surfaceColor = color;
        }
        renderer.update ();
      },
      false
    );
  }
  
  if (straussHighlightBaseColor != null)
  {
    straussHighlightBaseColor.addEventListener
    (
      "change",
      function (event)
      {
        var color = null;
        
        color = getRGBAColorArrayFromColorChooser (straussHighlightBaseColor);
        
        for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
                 shapeIndex++)
        {
          var shape = selectedShapes[shapeIndex];
          
          shape.straussParameters.highlightBaseColor = color;
        }
        renderer.update ();
      },
      false
    );
  }
  
  function updateStraussControlElements ()
  {
    var straussBlock = document.getElementById ("straussConfigBlock");
    
    if ((straussBlock == null) || (! hasSelectedShapes ()))
    {
      return;
    }
    
    var firstShape = getFirstSelectedShape ();
    
    setColorChooserRGBFromArray (straussSurfaceColor,       firstShape.straussParameters.surfaceColor);
    setColorChooserRGBFromArray (straussHighlightBaseColor, firstShape.straussParameters.highlightBaseColor);
    straussMetalness.value        = firstShape.straussParameters.metalness;
    straussSmoothness.value       = firstShape.straussParameters.smoothness;
    straussTransparency.value     = firstShape.straussParameters.transparency;
    straussFresnelConstant.value  = firstShape.straussParameters.fresnelConstant;
    straussShadowConstant.value   = firstShape.straussParameters.shadowConstant;
    straussOffSpecularPeak.value  = firstShape.straussParameters.offSpecularPeak;
  }
  
  
  
  lightPositionXInput.addEventListener
  (
    "change",
    function (event)
    {
      var lightPositionX = lightPositionXInput.value;
      var light          = getSelectedLight              ();
      var oldPosition    = light.getPositionAsFloatArray ();
      
      light.setPositionFromFloats (lightPositionX, oldPosition[1], oldPosition[2], oldPosition[3]);
      
      renderer.update ();
    }
  );
  
  lightPositionYInput.addEventListener
  (
    "change",
    function (event)
    {
      var lightPositionY = lightPositionYInput.value;
      var light          = getSelectedLight              ();
      var oldPosition    = light.getPositionAsFloatArray ();
      
      light.setPositionFromFloats (oldPosition[0], lightPositionY, oldPosition[2], oldPosition[3]);
      
      renderer.update ();
    }
  );
  
  lightPositionZInput.addEventListener
  (
    "change",
    function (event)
    {
      var lightPositionZ = lightPositionZInput.value;
      var light          = getSelectedLight              ();
      var oldPosition    = light.getPositionAsFloatArray ();
      
      light.setPositionFromFloats (oldPosition[0], oldPosition[1], lightPositionZ, oldPosition[3]);
      
      renderer.update ();
    }
  );
  
  function updateSceneGraphSelectMenu (renderer)
  {
    var selectNoneOption = null;
    var selectAllOption  = null;
    
    // Remove all options: -> "http://stackoverflow.com/questions/4618763/removing-all-option-of-dropdown-box-in-javascript"
    sceneGraphSelectMenu.options.length = 0;
    
    selectNoneOption       = document.createElement ("option");
    selectNoneOption.text  = "-";
    selectNoneOption.value = "";
    sceneGraphSelectMenu.add (selectNoneOption);
    
    selectAllOption       = document.createElement ("option");
    selectAllOption.text  = "all";
    selectAllOption.value = "*";
    sceneGraphSelectMenu.add (selectAllOption);
    
    for (var shapeIndex = 0; shapeIndex < renderer.getShapeCount (); shapeIndex++)
    {
      var shapeOption = null;
      var shape       = null;
      
      shape             = renderer.getShapeAtIndex (shapeIndex);
      shapeOption       = document.createElement   ("option");
      shapeOption.text  = "(" + shapeIndex + ") " + shape.getName ();
      shapeOption.value = shapeIndex;
      sceneGraphSelectMenu.add (shapeOption);
    }
  };
  
  sceneGraphSelectMenu.shapeAdded = function (renderer, shape3D, insertionIndex)
  {
    updateSceneGraphSelectMenu (renderer);
  };
  
  sceneGraphSelectMenu.shapeRemoved = function (renderer, shape3D, removeIndex)
  {
    updateSceneGraphSelectMenu (renderer);
  };
  
  // Getting multiple selected options: -> "http://stackoverflow.com/questions/5866169/getting-all-selected-values-of-a-multiple-select-box-when-clicking-on-a-button-u"
  sceneGraphSelectMenu.addEventListener
  (
    "change",
    function (event)
    {
      var selectedValue = sceneGraphSelectMenu.value;
      
      if (selectedValue == "")
      {
        selectedShapes = [];
      }
      else if (selectedValue == "*")
      {
        selectedShapes = renderer.getShapes ();
      }
      else
      {
        //selectedShapes = [renderer.getShapeAtIndex (selectedValue)];
        selectedShapes = [];
        
        for (var optionIndex = 0;
                 optionIndex < sceneGraphSelectMenu.options.length;
                 optionIndex++)
        {
          var option = sceneGraphSelectMenu.options[optionIndex];
          
          if (option.selected)
          {
            selectedShapes.push (renderer.getShapeAtIndex (option.value));
          }
        }
      }
      
      updateControlElements    ();
      //initializeCookTorranceParameters ();
    },
    false
  );
  
  var removeShapeButton = document.getElementById ("removeShape");
  
  if (removeShapeButton != null)
  {
    removeShapeButton.addEventListener
    (
      "click",
      function (event)
      {
        // "all" selected? => Remove all shapes.
        if (sceneGraphSelectMenu.options[1].selected)
        {
          var shapesToRemove = [];
          var shapeCount     = 0;
          
          shapeCount = renderer.getShapeCount ();
          
          // Collect shapes to remove.
          for (var shapeIndex = 0; shapeIndex < shapeCount;
                   shapeIndex++)
          {
            shapesToRemove.push (renderer.getShapeAtIndex (shapeIndex));
          }
          
          // Remove each shape.
          for (var shapeIndex = 0; shapeIndex < shapeCount;
                   shapeIndex++)
          {
            renderer.removeShape3D (shapesToRemove[shapeIndex]);
          }
          
          selectedShapes = [];
          updateControlElements ();
        }
        // Not "all" selected? => Remove selected shapes only.
        else
        {
          var shapesToRemove = selectedShapes.slice ();
          
          for (var shapeIndex = 0;
                   shapeIndex < selectedShapes.length;
                   shapeIndex++)
          {
            renderer.removeShape3D (selectedShapes[shapeIndex]);
            shapesToRemove.pop     ();
          }
          
          selectedShapes = shapesToRemove;
          updateControlElements ();
        }
      },
      false
    );
  }
  
  
  
  var wardConfigBlock   = document.getElementById ("wardAnisotropicConfigBlock");
  var wardRoughnessX    = document.getElementById ("wardRoughnessX");
  var wardRoughnessY    = document.getElementById ("wardRoughnessY");
  var wardDirectionX    = document.getElementById ("wardDirectionX");
  var wardDirectionY    = document.getElementById ("wardDirectionY");
  var wardDirectionZ    = document.getElementById ("wardDirectionZ");
  var wardAmbientColor  = document.getElementById ("wardAmbientColor");
  var wardDiffuseColor  = document.getElementById ("wardDiffuseColor");
  var wardEmissiveColor = document.getElementById ("wardEmissiveColor");
  var wardSpecularColor = document.getElementById ("wardSpecularColor");
  
  if (wardRoughnessX != null)
  {
    wardRoughnessX.addEventListener
    (
      "change",
      function (event)
      {
        var value = 0.0;
        
        value = parseFloat (wardRoughnessX.value);
        
        for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
                 shapeIndex++)
        {
          var shape = selectedShapes[shapeIndex];
          
          shape.wardParameters.roughnessParameters[0] = value;
        }
        renderer.update ();
      },
      false
    );
  }
  
  if (wardRoughnessY != null)
  {
    wardRoughnessY.addEventListener
    (
      "change",
      function (event)
      {
        var value = 0.0;
        
        value = parseFloat (wardRoughnessY.value);
        
        for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
                 shapeIndex++)
        {
          var shape = selectedShapes[shapeIndex];
          
          shape.wardParameters.roughnessParameters[1] = value;
        }
        renderer.update ();
      },
      false
    );
  }
  
  if (wardDirectionX != null)
  {
    wardDirectionX.addEventListener
    (
      "change",
      function (event)
      {
        var value = 0.0;
        
        value = parseFloat (wardDirectionX.value);
        
        for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
                 shapeIndex++)
        {
          var shape = selectedShapes[shapeIndex];
          
          shape.wardParameters.direction[0] = value;
        }
        renderer.update ();
      },
      false
    );
  }
  
  if (wardDirectionY != null)
  {
    wardDirectionY.addEventListener
    (
      "change",
      function (event)
      {
        var value = 0.0;
        
        value = parseFloat (wardDirectionY.value);
        
        for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
                 shapeIndex++)
        {
          var shape = selectedShapes[shapeIndex];
          
          shape.wardParameters.direction[1] = value;
        }
        renderer.update ();
      },
      false
    );
  }
  
  if (wardDirectionZ != null)
  {
    wardDirectionZ.addEventListener
    (
      "change",
      function (event)
      {
        var value = 0.0;
        
        value = parseFloat (wardDirectionZ.value);
        
        for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
                 shapeIndex++)
        {
          var shape = selectedShapes[shapeIndex];
          
          shape.wardParameters.direction[2] = value;
        }
        renderer.update ();
      },
      false
    );
  }
  
  if (wardAmbientColor != null)
  {
    wardAmbientColor.addEventListener
    (
      "change",
      function (event)
      {
        var color = null;
        
        color = getRGBAColorArrayFromColorChooser (wardAmbientColor);
        
        for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
                 shapeIndex++)
        {
          var shape = selectedShapes[shapeIndex];
          
          shape.wardParameters.ambientColor = color;
        }
        renderer.update ();
      },
      false
    );
  }
  
  if (wardDiffuseColor != null)
  {
    wardDiffuseColor.addEventListener
    (
      "change",
      function (event)
      {
        var color = null;
        
        color = getRGBAColorArrayFromColorChooser (wardDiffuseColor);
        
        for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
                 shapeIndex++)
        {
          var shape = selectedShapes[shapeIndex];
          
          shape.wardParameters.diffuseColor = color;
        }
        renderer.update ();
      },
      false
    );
  }
  
  if (wardEmissiveColor != null)
  {
    wardEmissiveColor.addEventListener
    (
      "change",
      function (event)
      {
        var color = null;
        
        color = getRGBAColorArrayFromColorChooser (wardEmissiveColor);
        
        for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
                 shapeIndex++)
        {
          var shape = selectedShapes[shapeIndex];
          
          shape.wardParameters.emissiveColor = color;
        }
        renderer.update ();
      },
      false
    );
  }
  
  if (wardSpecularColor != null)
  {
    wardSpecularColor.addEventListener
    (
      "change",
      function (event)
      {
        var color = null;
        
        color = getRGBAColorArrayFromColorChooser (wardSpecularColor);
        
        for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
                 shapeIndex++)
        {
          var shape = selectedShapes[shapeIndex];
          
          shape.wardParameters.specularColor = color;
        }
        renderer.update ();
      },
      false
    );
  }
  
  function updateWardControlElements ()
  {
    if ((wardConfigBlock == null) || (! hasSelectedShapes ()))
    {
      return;
    }
    
    var firstShape = getFirstSelectedShape ();
    
    setColorChooserRGBFromArray (wardAmbientColor,  firstShape.wardParameters.ambientColor);
    setColorChooserRGBFromArray (wardDiffuseColor,  firstShape.wardParameters.diffuseColor);
    setColorChooserRGBFromArray (wardEmissiveColor, firstShape.wardParameters.emissiveColor);
    setColorChooserRGBFromArray (wardSpecularColor, firstShape.wardParameters.specularColor);
    
    wardRoughnessX.value = firstShape.wardParameters.roughnessParameters[0];
    wardRoughnessY.value = firstShape.wardParameters.roughnessParameters[1];
    wardDirectionX.value = firstShape.wardParameters.direction[0];
    wardDirectionY.value = firstShape.wardParameters.direction[1];
    wardDirectionZ.value = firstShape.wardParameters.direction[2];
  }
  
  
  
  
  renderer.modelLoadDialogAccepted = function (dialog)
  {
    var selectedFileName = "models/" + dialog.getSelectedFile ();
    var loaderOptions    = dialog.getLoaderOptions ();
    
    loadModelFromFileName (selectedFileName, loaderOptions);
  };
  
  renderer.modelLoadDialogCancelled = function (dialog)
  {
  };
  
  var dialog = new ModelLoadDialog (document);
  dialog.addDialogListener (renderer);
  var loadModelButton = document.getElementById ("loadModelButton");
  loadModelButton.disabled = false;
  loadModelButton.addEventListener
  (
    "click",
    function (event)
    {
      dialog.setVisible (true);
    },
    false
  );
  
  // -> "http://stackoverflow.com/questions/12030686/html-input-file-selection-event-not-firing-upon-selecting-the-same-file"
  var loadModelButton = document.getElementById ("loadModelButton");
  if (loadModelButton != null)
  {
    loadModelButton.addEventListener
    (
      "change",
      function (event)
      {
        //var selectedFileName = event.target.files[0];
        var selectedFileName = this.value;
        
        //alert (selectedFileName);
        //alert (URL.createObjectURL (event.target.files[0]));
      },
      false
    );
  }
  
  
  //???
  var SceneGraphObjectMenu = function ()
  {
    this.displayElement = null;
  };
  
  SceneGraphObjectMenu.prototype.attachToRenderer = function (renderer)
  {
    if (renderer != null)
    {
      renderer.addRendererListener (this);
    }
  };
  //???
  
  
  
  var ashikhminShirleyConfigBlock = document.getElementById ("ashikhminShirleyConfigBlock");
  
  if (ashikhminShirleyConfigBlock != null)
  {
    var ashikhminExponentialFactorXSpinner = document.getElementById ("ashikhminShirleyExponentialFactorX");
    var ashikhminExponentialFactorYSpinner = document.getElementById ("ashikhminShirleyExponentialFactorY");
    var ashikhminDiffuseColorChooser       = document.getElementById ("ashikhminShirleyDiffuseColor");
    var ashikhminSpecularColorChooser      = document.getElementById ("ashikhminShirleySpecularColor");
    var ashikhminReferenceAxisX            = document.getElementById ("ashikhminShirleyReferenceAxisX");
    var ashikhminReferenceAxisY            = document.getElementById ("ashikhminShirleyReferenceAxisY");
    var ashikhminReferenceAxisZ            = document.getElementById ("ashikhminShirleyReferenceAxisZ");
    
    ashikhminExponentialFactorXSpinner.addEventListener
    (
      "change",
      function (event)
      {
        for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
               shapeIndex++)
        {
          var shape = selectedShapes[shapeIndex];
          var value = ashikhminExponentialFactorXSpinner.value;
          
          shape.ashikhminShirleyParameters.setExponentialFactorX (value);
        }
        renderer.update ();
      },
      false
    );
    
    ashikhminExponentialFactorYSpinner.addEventListener
    (
      "change",
      function (event)
      {
        for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
               shapeIndex++)
        {
          var shape = selectedShapes[shapeIndex];
          var value = ashikhminExponentialFactorYSpinner.value;
          
          shape.ashikhminShirleyParameters.setExponentialFactorY (value);
        }
        renderer.update ();
      },
      false
    );
    
    //
    //getRGBColorArrayFromColorChooser (ashikhminDiffuseColorChooser);
    
    ashikhminDiffuseColorChooser.addEventListener
    (
      "change",
      function (event)
      {
        var color = null;
        
        //color = getRGBAColorArrayFromColorChooser (ashikhminDiffuseColorChooser);
        color = getRGBColorArrayFromColorChooser (ashikhminDiffuseColorChooser);
        
        for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
                 shapeIndex++)
        {
          var shape = selectedShapes[shapeIndex];
          
          shape.ashikhminShirleyParameters.diffuseColor = color;
        }
        renderer.update ();
      },
      false
    );
    
    ashikhminSpecularColorChooser.addEventListener
    (
      "change",
      function (event)
      {
        var color = null;
        
        //color = getRGBAColorArrayFromColorChooser (ashikhminSpecularColorChooser);
        color = getRGBColorArrayFromColorChooser (ashikhminSpecularColorChooser);
        
        for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
                 shapeIndex++)
        {
          var shape = selectedShapes[shapeIndex];
          
          shape.ashikhminShirleyParameters.specularColor = color;
        }
        renderer.update ();
      },
      false
    );
    
    ashikhminReferenceAxisX.addEventListener
    (
      "change",
      function (event)
      {
        for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
               shapeIndex++)
        {
          var shape = selectedShapes[shapeIndex];
          var value = ashikhminReferenceAxisX.value;
          
          shape.ashikhminShirleyParameters.referenceAxis[0] = value;
        }
        renderer.update ();
      },
      false
    );
    
    ashikhminReferenceAxisY.addEventListener
    (
      "change",
      function (event)
      {
        for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
               shapeIndex++)
        {
          var shape = selectedShapes[shapeIndex];
          var value = ashikhminReferenceAxisY.value;
          
          shape.ashikhminShirleyParameters.referenceAxis[1] = value;
        }
        renderer.update ();
      },
      false
    );
    
    ashikhminReferenceAxisZ.addEventListener
    (
      "change",
      function (event)
      {
        for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
               shapeIndex++)
        {
          var shape = selectedShapes[shapeIndex];
          var value = ashikhminReferenceAxisZ.value;
          
          shape.ashikhminShirleyParameters.referenceAxis[2] = value;
        }
        renderer.update ();
      },
      false
    );
  }
  
  function updateAshikhminShirleyControlElements ()
  {
    if ((ashikhminShirleyConfigBlock == null) || (! hasSelectedShapes ()))
    {
      return;
    }
    
    var firstShape = getFirstSelectedShape ();
    
    setColorChooserRGBFromArray (ashikhminDiffuseColorChooser,  firstShape.ashikhminShirleyParameters.diffuseColor);
    setColorChooserRGBFromArray (ashikhminSpecularColorChooser, firstShape.ashikhminShirleyParameters.specularColor);
    
    ashikhminExponentialFactorXSpinner.value = firstShape.ashikhminShirleyParameters.exponentialFactors[0];
    ashikhminExponentialFactorYSpinner.value = firstShape.ashikhminShirleyParameters.exponentialFactors[1];
    ashikhminReferenceAxisX.value            = firstShape.ashikhminShirleyParameters.referenceAxis[0];
    ashikhminReferenceAxisY.value            = firstShape.ashikhminShirleyParameters.referenceAxis[1];
    ashikhminReferenceAxisZ.value            = firstShape.ashikhminShirleyParameters.referenceAxis[2];
  }
  
  
  
  var lommelSeeligerConfigBlock  = document.getElementById    ("lommelSeeligerConfigBlock");
  var lommelSeeligerBias         = document.getElementById    ("lommelSeeligerBias");
  var lommelSeeligerScale        = document.getElementById    ("lommelSeeligerScale");
  var lommelSeeligerExponent     = document.getElementById    ("lommelSeeligerExponent");
  var lommelSeeligerDiffuseColor = document.getElementById    ("lommelSeeligerDiffuseColor");
  var specularMaterialTypes      = document.getElementsByName ("specularMaterialType");
  var specularComponentShininess = document.getElementById    ("specularComponentShininess");
  var specularComponentAmbient   = document.getElementById    ("specularComponentAmbientColor");
  var specularComponentDiffuse   = document.getElementById    ("specularComponentDiffuseColor");
  var specularComponentEmissive  = document.getElementById    ("specularComponentEmissiveColor");
  var specularComponentSpecular  = document.getElementById    ("specularComponentSpecularColor");
  
  function updateSpecularComponentControlElements (specularMaterial)
  {
    setColorChooserRGBFromArray (specularComponentAmbient,  specularMaterial.ambientColor);
    setColorChooserRGBFromArray (specularComponentDiffuse,  specularMaterial.diffuseColor);
    setColorChooserRGBFromArray (specularComponentEmissive, specularMaterial.emissiveColor);
    setColorChooserRGBFromArray (specularComponentSpecular, specularMaterial.specularColor);
    
    specularComponentShininess.value = specularMaterial.shininess;
    
    // Update specular material type radio buttons.
    var specularTypes = document.getElementsByName ("specularMaterialType");
    
    for (var radiobuttonIndex = 0;
             radiobuttonIndex < specularTypes.length;
             radiobuttonIndex++)
    {
      var radiobutton = specularTypes[radiobuttonIndex];
      
      if (radiobutton.value == specularMaterial.type)
      {
        radiobutton.checked = true;
      }
      else
      {
        radiobutton.checked = false;
      }
    }
  }
  
  function setSpecularComponentShininess (shape, shininess)
  {
    shape.lommelSeeligerParameters.specularMaterial.shininess = shininess;
    shape.orenNayarParameters.specularMaterial.shininess      = shininess;
    shape.minnaertParameters.specularMaterial.shininess       = shininess;
    shape.lambertParameters.specularMaterial.shininess        = shininess;
    shape.goochParameters.specularMaterial.shininess          = shininess;
  }
  
  function setSpecularComponentAmbientColor (shape, color)
  {
    shape.lommelSeeligerParameters.specularMaterial.ambientColor = color;
    shape.orenNayarParameters.specularMaterial.ambientColor      = color;
    shape.minnaertParameters.specularMaterial.ambientColor       = color;
    shape.lambertParameters.specularMaterial.ambientColor        = color;
    shape.goochParameters.specularMaterial.ambientColor          = color;
  }
  
  function setSpecularComponentDiffuseColor (shape, color)
  {
    shape.lommelSeeligerParameters.specularMaterial.diffuseColor = color;
    shape.orenNayarParameters.specularMaterial.diffuseColor      = color;
    shape.minnaertParameters.specularMaterial.diffuseColor       = color;
    shape.lambertParameters.specularMaterial.diffuseColor        = color;
    shape.goochParameters.specularMaterial.diffuseColor          = color;
  }
  
  function setSpecularComponentEmissiveColor (shape, color)
  {
    shape.lommelSeeligerParameters.specularMaterial.emissiveColor = color;
    shape.orenNayarParameters.specularMaterial.emissiveColor      = color;
    shape.minnaertParameters.specularMaterial.emissiveColor       = color;
    shape.lambertParameters.specularMaterial.emissiveColor        = color;
    shape.goochParameters.specularMaterial.emissiveColor          = color;
  }
  
  function setSpecularComponentSpecularColor (shape, color)
  {
    shape.lommelSeeligerParameters.specularMaterial.specularColor = color;
    shape.orenNayarParameters.specularMaterial.specularColor      = color;
    shape.minnaertParameters.specularMaterial.specularColor       = color;
    shape.lambertParameters.specularMaterial.specularColor        = color;
    shape.goochParameters.specularMaterial.specularColor          = color;
  }
  
  function setSpecularComponentType (shape, type)
  {
    shape.lommelSeeligerParameters.specularMaterial.type = type;
    shape.orenNayarParameters.specularMaterial.type      = type;
    shape.minnaertParameters.specularMaterial.type       = type;
    shape.lambertParameters.specularMaterial.type        = type;
    shape.goochParameters.specularMaterial.type          = type;
  }
  
  if (lommelSeeligerBias != null)
  {
    lommelSeeligerBias.addEventListener
    (
      "change",
      function (event)
      {
        var bias = 0.0;
        
        bias = parseFloat (lommelSeeligerBias.value);
        
        for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
                 shapeIndex++)
        {
          var shape = selectedShapes[shapeIndex];
          
          shape.lommelSeeligerParameters.diffuseBias = bias;
        }
        renderer.update ();
      },
      false
    );
  }
  
  if (lommelSeeligerScale != null)
  {
    lommelSeeligerScale.addEventListener
    (
      "change",
      function (event)
      {
        var scale = 0.0;
        
        scale = parseFloat (lommelSeeligerScale.value);
        
        for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
                 shapeIndex++)
        {
          var shape = selectedShapes[shapeIndex];
          
          shape.lommelSeeligerParameters.diffuseScale = scale;
        }
        renderer.update ();
      },
      false
    );
  }
  
  if (lommelSeeligerExponent != null)
  {
    lommelSeeligerExponent.addEventListener
    (
      "change",
      function (event)
      {
        var exponent = 0.0;
        
        exponent = parseFloat (lommelSeeligerExponent.value);
        
        for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
                 shapeIndex++)
        {
          var shape = selectedShapes[shapeIndex];
          
          shape.lommelSeeligerParameters.diffuseExponent = exponent;
        }
        renderer.update ();
      },
      false
    );
  }
  
  if (lommelSeeligerDiffuseColor != null)
  {
    lommelSeeligerDiffuseColor.addEventListener
    (
      "change",
      function (event)
      {
        var color = null;
        
        color = getRGBAColorArrayFromColorChooser (lommelSeeligerDiffuseColor);
        
        for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
                 shapeIndex++)
        {
          var shape = selectedShapes[shapeIndex];
          
          shape.lommelSeeligerParameters.diffuseColor = color;
        }
        renderer.update ();
      },
      false
    );
  }
  
  function updateLommelSeeligerControlElements ()
  {
    if ((lommelSeeligerConfigBlock == null) || (! hasSelectedShapes ()))
    {
      return;
    }
    
    var firstShape = getFirstSelectedShape ();
    
    setColorChooserRGBFromArray (lommelSeeligerDiffuseColor, firstShape.lommelSeeligerParameters.diffuseColor);
    lommelSeeligerBias.value     = firstShape.lommelSeeligerParameters.diffuseBias;
    lommelSeeligerScale.value    = firstShape.lommelSeeligerParameters.diffuseScale;
    lommelSeeligerExponent.value = firstShape.lommelSeeligerParameters.diffuseExponent;
    
    updateSpecularComponentControlElements (firstShape.lommelSeeligerParameters.specularMaterial);
  }
  
  
  
  function setSpecularComponentConfigurationsEnabled (areEnabled)
  {
    var configurationElements = document.getElementsByClassName ("specularConfigurationElement");
    
    for (var elementIndex = 0;
             elementIndex < configurationElements.length;
             elementIndex++)
    {
      configurationElements[elementIndex].disabled = (! areEnabled);
    }
  }
  
  // Loop + closures.
  if (specularMaterialTypes.length > 0)
  {
    var numberOfTypes = specularMaterialTypes.length;
    
    for (var typeIndex = 0; typeIndex < numberOfTypes; typeIndex++)
    {
      var typeElement = specularMaterialTypes[typeIndex];
      
      if (typeElement != null)
      {
        (function (boundTypeElement)
        {
          boundTypeElement.addEventListener
          (
            "change",
            function (event)
            {
              for (var shapeIndex = 0;
                       shapeIndex < selectedShapes.length;
                       shapeIndex++)
              {
                var shape = selectedShapes[shapeIndex];
                var type  = boundTypeElement.value;
                
                setSpecularComponentType (shape, type);
                
                if (type == -1)
                {
                  setSpecularComponentConfigurationsEnabled (false);
                }
                else
                {
                  setSpecularComponentConfigurationsEnabled (true);
                }
              }
              renderer.update ();
            },
            false
          );
        }) (typeElement);
      }
    }
  }
  
  if (specularComponentShininess != null)
  {
    specularComponentShininess.addEventListener
    (
      "change",
      function (event)
      {
        var shininess = specularComponentShininess.value;
        
        for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
                 shapeIndex++)
        {
          var shape = selectedShapes[shapeIndex];
          
          setSpecularComponentShininess (shape, shininess);
        }
        renderer.update ();
      },
      false
    );
  }
  
  if (specularComponentAmbient != null)
  {
    specularComponentAmbient.addEventListener
    (
      "change",
      function (event)
      {
        var color = null;
        
        color = getRGBAColorArrayFromColorChooser (specularComponentAmbient);
        
        for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
                 shapeIndex++)
        {
          var shape = selectedShapes[shapeIndex];
          
          setSpecularComponentAmbientColor (shape, color);
        }
        renderer.update ();
      },
      false
    );
  }
  
  if (specularComponentDiffuse != null)
  {
    specularComponentDiffuse.addEventListener
    (
      "change",
      function (event)
      {
        var color = null;
        
        color = getRGBAColorArrayFromColorChooser (specularComponentDiffuse);
        
        for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
                 shapeIndex++)
        {
          var shape = selectedShapes[shapeIndex];
          
          setSpecularComponentDiffuseColor (shape, color);
        }
        renderer.update ();
      },
      false
    );
  }
  
  if (specularComponentEmissive != null)
  {
    specularComponentEmissive.addEventListener
    (
      "change",
      function (event)
      {
        var color = null;
        
        color = getRGBAColorArrayFromColorChooser (specularComponentEmissive);
        
        for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
                 shapeIndex++)
        {
          var shape = selectedShapes[shapeIndex];
          
          setSpecularComponentEmissiveColor (shape, color);
        }
        renderer.update ();
      },
      false
    );
  }
  
  if (specularComponentSpecular != null)
  {
    specularComponentSpecular.addEventListener
    (
      "change",
      function (event)
      {
        var color = null;
        
        color = getRGBAColorArrayFromColorChooser (specularComponentSpecular);
        
        for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
                 shapeIndex++)
        {
          var shape = selectedShapes[shapeIndex];
          
          setSpecularComponentSpecularColor (shape, color);
        }
        renderer.update ();
      },
      false
    );
  }
  
  
  var orenNayarConfigBlock  = document.getElementById ("orenNayarConfigBlock");
  var orenNayarDiffuseColor = document.getElementById ("orenNayarDiffuseColor");
  var orenNayarRoughness    = document.getElementById ("orenNayarRoughness");
  
  if (orenNayarDiffuseColor != null)
  {
    orenNayarDiffuseColor.addEventListener
    (
      "change",
      function (event)
      {
        var color = null;
        
        color = getRGBAColorArrayFromColorChooser (orenNayarDiffuseColor);
        
        for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
                 shapeIndex++)
        {
          var shape = selectedShapes[shapeIndex];
          
          shape.orenNayarParameters.diffuseColor = color;
        }
        renderer.update ();
      },
      false
    );
  }
  
  if (orenNayarRoughness != null)
  {
    orenNayarRoughness.addEventListener
    (
      "change",
      function (event)
      {
        var roughnessValue = 0.0;
        
        roughnessValue = parseFloat (orenNayarRoughness.value);
        
        for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
                 shapeIndex++)
        {
          var shape = selectedShapes[shapeIndex];
          
          shape.orenNayarParameters.roughness = roughnessValue;
        }
        renderer.update ();
      },
      false
    );
  }
  
  function hasSelectedShapes ()
  {
    return (selectedShapes.length > 0);
  }
  
  function getFirstSelectedShape ()
  {
    if (hasSelectedShapes ())
    {
      return selectedShapes[0];
    }
    else
    {
      return null;
    }
  }
  
  function updateOrenNayarControlElements ()
  {
    if ((orenNayarConfigBlock == null) || (! hasSelectedShapes ()))
    {
      return;
    }
    
    var firstShape = getFirstSelectedShape ();
    
    setColorChooserRGBFromArray (orenNayarDiffuseColor, firstShape.orenNayarParameters.diffuseColor);
    orenNayarRoughness.value = firstShape.orenNayarParameters.roughness;
    
    updateSpecularComponentControlElements (firstShape.orenNayarParameters.specularMaterial);
  }
  
  
  var minnaertConfigBlock  = document.getElementById ("minnaertConfigBlock");
  var minnaertDiffuseColor = document.getElementById ("minnaertDiffuseColor");
  var minnaertRoughness    = document.getElementById ("minnaertRoughness");
  
  if (minnaertDiffuseColor != null)
  {
    minnaertDiffuseColor.addEventListener
    (
      "change",
      function (event)
      {
        var color = null;
        
        color = getRGBAColorArrayFromColorChooser (minnaertDiffuseColor);
        
        for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
                 shapeIndex++)
        {
          var shape = selectedShapes[shapeIndex];
          
          shape.minnaertParameters.diffuseColor = color;
        }
        renderer.update ();
      },
      false
    );
  }
  
  if (minnaertRoughness != null)
  {
    minnaertRoughness.addEventListener
    (
      "change",
      function (event)
      {
        var roughnessValue = 0.0;
        
        roughnessValue = parseFloat (minnaertRoughness.value);
        
        for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
                 shapeIndex++)
        {
          var shape = selectedShapes[shapeIndex];
          
          shape.minnaertParameters.roughness = roughnessValue;
        }
        renderer.update ();
      },
      false
    );
  }
  
  function updateMinnaertControlElements ()
  {
    if ((minnaertConfigBlock == null) || (! hasSelectedShapes ()))
    {
      return;
    }
    
    var firstShape = getFirstSelectedShape ();
    
    setColorChooserRGBFromArray (minnaertDiffuseColor, firstShape.minnaertParameters.diffuseColor);
    minnaertRoughness.value = firstShape.minnaertParameters.roughness;
    
    updateSpecularComponentControlElements (firstShape.minnaertParameters.specularMaterial);
  }
  
  
  var lambertConfigBlock  = document.getElementById ("lambertConfigBlock");
  var lambertDiffuseColor = document.getElementById ("lambertDiffuseColor");
  
  if (lambertDiffuseColor != null)
  {
    lambertDiffuseColor.addEventListener
    (
      "change",
      function (event)
      {
        var color = null;
        
        color = getRGBAColorArrayFromColorChooser (lambertDiffuseColor);
        
        for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
                 shapeIndex++)
        {
          var shape = selectedShapes[shapeIndex];
          
          shape.lambertParameters.diffuseColor = color;
        }
        renderer.update ();
      },
      false
    );
  }
  
  function updateLambertControlElements ()
  {
    if ((lambertConfigBlock == null) || (! hasSelectedShapes ()))
    {
      return;
    }
    
    var firstShape = getFirstSelectedShape ();
    
    setColorChooserRGBFromArray (lambertDiffuseColor, firstShape.lambertParameters.diffuseColor);
    updateSpecularComponentControlElements (firstShape.lambertParameters.specularMaterial);
  }
  
  
  
  var cookTorranceDiffuseColor     = document.getElementById ("cookTorranceDiffuseColor");
  var cookTorranceEmissiveColor    = document.getElementById ("cookTorranceEmissiveColor");
  var cookTorranceSpecularColor    = document.getElementById ("cookTorranceSpecularColor");
  var cookTorranceRoughness        = document.getElementById ("cookTorranceRoughness");
  var cookTorranceDistribParameter = document.getElementById ("cookTorranceDistributionParameter");
  var cookTorranceDistribFunctions = document.getElementsByName ("cookTorranceDistributionFunction");
  var cookTorranceFresnelFunctions = document.getElementsByName ("cookTorranceFresnelFunction");
  var cookTorranceReflectionCoefficient = document.getElementById ("cookTorranceReflectionCoefficient");
  var cookTorranceSpecularTermScale     = document.getElementById ("cookTorranceSpecularTermScale");
  
  function setCookTorranceDistributionFunction (shape, distributionFunction)
  {
    shape.cookTorranceParameters.distributionFunction = distributionFunction;
  }
  
  function setCookTorranceFresnelFunction (shape, fresnelFunction)
  {
    shape.cookTorranceParameters.fresnelFunction = fresnelFunction;
  }
  
  if (cookTorranceDiffuseColor != null)
  {
    cookTorranceDiffuseColor.addEventListener
    (
      "change",
      function (event)
      {
        var color = null;
        
        color = getRGBAColorArrayFromColorChooser (cookTorranceDiffuseColor);
        
        for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
                 shapeIndex++)
        {
          var shape = selectedShapes[shapeIndex];
          
          shape.cookTorranceParameters.diffuseColor = color;
        }
        renderer.update ();
      },
      false
    );
  }
  
  if (cookTorranceEmissiveColor != null)
  {
    cookTorranceEmissiveColor.addEventListener
    (
      "change",
      function (event)
      {
        var color = null;
        
        color = getRGBAColorArrayFromColorChooser (cookTorranceEmissiveColor);
        
        for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
                 shapeIndex++)
        {
          var shape = selectedShapes[shapeIndex];
          
          shape.cookTorranceParameters.emissiveColor = color;
        }
        renderer.update ();
      },
      false
    );
  }
  
  if (cookTorranceSpecularColor != null)
  {
    cookTorranceSpecularColor.addEventListener
    (
      "change",
      function (event)
      {
        var color = null;
        
        color = getRGBAColorArrayFromColorChooser (cookTorranceSpecularColor);
        
        for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
                 shapeIndex++)
        {
          var shape = selectedShapes[shapeIndex];
          
          shape.cookTorranceParameters.specularColor = color;
        }
        renderer.update ();
      },
      false
    );
  }
  
  if (cookTorranceRoughness != null)
  {
    cookTorranceRoughness.addEventListener
    (
      "change",
      function (event)
      {
        var roughnessValue = 0.0;
        
        roughnessValue = parseFloat (cookTorranceRoughness.value);
        
        for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
                 shapeIndex++)
        {
          var shape = selectedShapes[shapeIndex];
          
          shape.cookTorranceParameters.roughness = roughnessValue;
        }
        renderer.update ();
      },
      false
    );
  }
  
  if (cookTorranceSpecularTermScale != null)
  {
    cookTorranceSpecularTermScale.addEventListener
    (
      "change",
      function (event)
      {
        var value = 0.0;
        
        value = parseFloat (cookTorranceSpecularTermScale.value);
        
        for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
                 shapeIndex++)
        {
          var shape = selectedShapes[shapeIndex];
          
          shape.cookTorranceParameters.specularTermScale = value;
        }
        renderer.update ();
      },
      false
    );
  }
  
  if (cookTorranceDistribFunctions.length > 0)
  {
    var numberOfTypes = cookTorranceDistribFunctions.length;
    
    for (var typeIndex = 0; typeIndex < numberOfTypes; typeIndex++)
    {
      var typeElement = cookTorranceDistribFunctions[typeIndex];
      
      if (typeElement != null)
      {
        (function (boundTypeElement)
        {
          boundTypeElement.addEventListener
          (
            "change",
            function (event)
            {
              for (var shapeIndex = 0;
                       shapeIndex < selectedShapes.length;
                       shapeIndex++)
              {
                var shape                 = selectedShapes[shapeIndex];
                var distributionFunction  = boundTypeElement.value;
                
                setCookTorranceDistributionFunction (shape, distributionFunction);
              }
              renderer.update ();
            },
            false
          );
        }) (typeElement);
      }
    }
  }
  
  if (cookTorranceDistribParameter != null)
  {
    cookTorranceDistribParameter.addEventListener
    (
      "change",
      function (event)
      {
        var value = 0.0;
        
        value = parseFloat (cookTorranceDistribParameter.value);
        
        for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
                 shapeIndex++)
        {
          var shape = selectedShapes[shapeIndex];
          
          shape.cookTorranceParameters.distributionParameter = value;
        }
        renderer.update ();
      },
      false
    );
  }
  
  if (cookTorranceFresnelFunctions.length > 0)
  {
    var numberOfTypes = cookTorranceFresnelFunctions.length;
    
    for (var typeIndex = 0; typeIndex < numberOfTypes; typeIndex++)
    {
      var typeElement = cookTorranceFresnelFunctions[typeIndex];
      
      if (typeElement != null)
      {
        (function (boundTypeElement)
        {
          boundTypeElement.addEventListener
          (
            "change",
            function (event)
            {
              for (var shapeIndex = 0;
                       shapeIndex < selectedShapes.length;
                       shapeIndex++)
              {
                var shape            = selectedShapes[shapeIndex];
                var fresnelFunction  = boundTypeElement.value;
                
                setCookTorranceFresnelFunction (shape, fresnelFunction);
              }
              renderer.update ();
            },
            false
          );
        }) (typeElement);
      }
    }
  }
  
  if (cookTorranceReflectionCoefficient != null)
  {
    cookTorranceReflectionCoefficient.addEventListener
    (
      "change",
      function (event)
      {
        var value = 0.0;
        
        value = parseFloat (cookTorranceReflectionCoefficient.value);
        
        for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
                 shapeIndex++)
        {
          var shape = selectedShapes[shapeIndex];
          
          shape.cookTorranceParameters.reflectionCoefficient = value;
        }
        renderer.update ();
      },
      false
    );
  }
  
  function updateCookTorranceControlElements ()
  {
    if ((cookTorranceDiffuseColor == null) || (! hasSelectedShapes ()))
    {
      return;
    }
    
    var firstShape = getFirstSelectedShape ();
    
    setColorChooserRGBFromArray (cookTorranceDiffuseColor,  firstShape.cookTorranceParameters.diffuseColor);
    setColorChooserRGBFromArray (cookTorranceEmissiveColor, firstShape.cookTorranceParameters.emissiveColor);
    setColorChooserRGBFromArray (cookTorranceSpecularColor, firstShape.cookTorranceParameters.specularColor);
    
    cookTorranceRoughness.value             = firstShape.cookTorranceParameters.roughness;
    cookTorranceDistribParameter.value      = firstShape.cookTorranceParameters.distributionParameter;
    cookTorranceSpecularTermScale.value     = firstShape.cookTorranceParameters.specularTermScale;
    cookTorranceReflectionCoefficient.value = firstShape.cookTorranceParameters.reflectionCoefficient;
    
    // Update the distribution function elements.
    for (var radiobuttonIndex = 0;
             radiobuttonIndex < cookTorranceDistribFunctions.length;
             radiobuttonIndex++)
    {
      var radiobutton = cookTorranceDistribFunctions[radiobuttonIndex];
      
      if (radiobutton.value == firstShape.cookTorranceParameters.distributionFunction)
      {
        radiobutton.checked = true;
      }
      else
      {
        radiobutton.checked = false;
      }
    }
    
    // Update the Fresnel function elements.
    for (var radiobuttonIndex = 0;
             radiobuttonIndex < cookTorranceFresnelFunctions.length;
             radiobuttonIndex++)
    {
      var radiobutton = cookTorranceFresnelFunctions[radiobuttonIndex];
      
      if (radiobutton.value == firstShape.cookTorranceParameters.fresnelFunction)
      {
        radiobutton.checked = true;
      }
      else
      {
        radiobutton.checked = false;
      }
    }
  }
  
  
  
  var goochSurfaceColor = document.getElementById ("goochSurfaceColor");
  var goochCoolColor    = document.getElementById ("goochCoolColor");
  var goochWarmColor    = document.getElementById ("goochWarmColor");
  var goochCoolMixValue = document.getElementById ("goochCoolMixValue");
  var goochWarmMixValue = document.getElementById ("goochWarmMixValue");
  var goochColorBlendingEquations = document.getElementsByName ("goochColorBlendingEquation");
  var goochAmbientTerms = document.getElementsByName ("goochAmbientTermFormula");
  
  if (goochSurfaceColor != null)
  {
    goochSurfaceColor.addEventListener
    (
      "change",
      function (event)
      {
        var color = null;
        
        color = getRGBAColorArrayFromColorChooser (goochSurfaceColor);
        
        for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
                 shapeIndex++)
        {
          var shape = selectedShapes[shapeIndex];
          
          shape.goochParameters.surfaceColor = color;
        }
        renderer.update ();
      },
      false
    );
  }
  
  if (goochWarmColor != null)
  {
    goochWarmColor.addEventListener
    (
      "change",
      function (event)
      {
        var color = null;
        
        color = getRGBAColorArrayFromColorChooser (goochWarmColor);
        
        for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
                 shapeIndex++)
        {
          var shape = selectedShapes[shapeIndex];
          
          shape.goochParameters.warmColor = color;
        }
        renderer.update ();
      },
      false
    );
  }
  
  if (goochCoolColor != null)
  {
    goochCoolColor.addEventListener
    (
      "change",
      function (event)
      {
        var color = null;
        
        color = getRGBAColorArrayFromColorChooser (goochCoolColor);
        
        for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
                 shapeIndex++)
        {
          var shape = selectedShapes[shapeIndex];
          
          shape.goochParameters.coolColor = color;
        }
        renderer.update ();
      },
      false
    );
  }
  
  if (goochCoolMixValue != null)
  {
    goochCoolMixValue.addEventListener
    (
      "change",
      function (event)
      {
        var value = 0.0;
        
        value = parseFloat (goochCoolMixValue.value);
        
        for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
                 shapeIndex++)
        {
          var shape = selectedShapes[shapeIndex];
          
          shape.goochParameters.coolMixValue = value;
        }
        renderer.update ();
      },
      false
    );
  }
  
  if (goochWarmMixValue != null)
  {
    goochWarmMixValue.addEventListener
    (
      "change",
      function (event)
      {
        var value = 0.0;
        
        value = parseFloat (goochWarmMixValue.value);
        
        for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
                 shapeIndex++)
        {
          var shape = selectedShapes[shapeIndex];
          
          shape.goochParameters.warmMixValue = value;
        }
        renderer.update ();
      },
      false
    );
  }
  
  function setGoochColorBlendingEquation (shape, blendingEquation)
  {
    shape.goochParameters.colorBlendingEquation = blendingEquation;
  }
  
  function setGoochAmbientTerm (shape, ambientTerm)
  {
    shape.goochParameters.ambientTermFormula = ambientTerm;
  }
  
  if ((goochColorBlendingEquations        != null) &&
      (goochColorBlendingEquations.length  > 0))
  {
    var numberOfTypes = goochColorBlendingEquations.length;
    
    for (var typeIndex = 0; typeIndex < numberOfTypes; typeIndex++)
    {
      var typeElement = goochColorBlendingEquations[typeIndex];
      
      if (typeElement != null)
      {
        (function (boundTypeElement)
        {
          boundTypeElement.addEventListener
          (
            "change",
            function (event)
            {
              for (var shapeIndex = 0;
                       shapeIndex < selectedShapes.length;
                       shapeIndex++)
              {
                var shape    = selectedShapes[shapeIndex];
                var equation = boundTypeElement.value;
                
                setGoochColorBlendingEquation (shape, equation);
              }
              renderer.update ();
            },
            false
          );
        }) (typeElement);
      }
    }
  }
  
  if ((goochAmbientTerms != null) && (goochAmbientTerms.length > 0))
  {
    var numberOfTypes = goochAmbientTerms.length;
    
    for (var typeIndex = 0; typeIndex < numberOfTypes; typeIndex++)
    {
      var typeElement = goochAmbientTerms[typeIndex];
      
      if (typeElement != null)
      {
        (function (boundTypeElement)
        {
          boundTypeElement.addEventListener
          (
            "change",
            function (event)
            {
              for (var shapeIndex = 0;
                       shapeIndex < selectedShapes.length;
                       shapeIndex++)
              {
                var shape = selectedShapes[shapeIndex];
                var term  = boundTypeElement.value;
                
                setGoochAmbientTerm (shape, term);
              }
              renderer.update ();
            },
            false
          );
        }) (typeElement);
      }
    }
  }
  
  function updateGoochControlElements ()
  {
    if ((goochSurfaceColor == null) || (! hasSelectedShapes ()))
    {
      return;
    }
    
    var firstShape = getFirstSelectedShape ();
    
    setColorChooserRGBFromArray (goochSurfaceColor, firstShape.goochParameters.surfaceColor);
    setColorChooserRGBFromArray (goochCoolColor,    firstShape.goochParameters.coolColor);
    setColorChooserRGBFromArray (goochWarmColor,    firstShape.goochParameters.warmColor);
    
    goochCoolMixValue.value = firstShape.goochParameters.coolMixValue;
    goochWarmMixValue.value = firstShape.goochParameters.warmMixValue;
    
    // Update the color blending equation elements.
    for (var radiobuttonIndex = 0;
             radiobuttonIndex < goochColorBlendingEquations.length;
             radiobuttonIndex++)
    {
      var radiobutton = goochColorBlendingEquations[radiobuttonIndex];
      
      if (radiobutton.value == firstShape.goochParameters.colorBlendingEquation)
      {
        radiobutton.checked = true;
      }
      else
      {
        radiobutton.checked = false;
      }
    }
    
    // Update the ambient term elements.
    for (var radiobuttonIndex = 0;
             radiobuttonIndex < goochAmbientTerms.length;
             radiobuttonIndex++)
    {
      var radiobutton = goochAmbientTerms[radiobuttonIndex];
      
      if (radiobutton.value == firstShape.goochParameters.ambientTermFormula)
      {
        radiobutton.checked = true;
      }
      else
      {
        radiobutton.checked = false;
      }
    }
    
    updateSpecularComponentControlElements (firstShape.goochParameters.specularMaterial);
  }
  
  
  
  
  var gammaCorrectionCheckbox = document.getElementById ("gammaCorrection");
  
  if (gammaCorrectionCheckbox != null)
  {
    gammaCorrectionCheckbox.addEventListener
    (
      "change",
      function (event)
      {
        var enableGammaCorrection = gammaCorrectionCheckbox.checked;
        
        for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
                 shapeIndex++)
        {
          var shape = selectedShapes[shapeIndex];
          
          shape.gammaCorrection.enabled = enableGammaCorrection;
        }
        renderer.update ();
      },
      false
    );
  }
  
  function updateGammaCorrectionControlElements ()
  {
    if ((gammaCorrectionCheckbox == null) || (! hasSelectedShapes ()))
    {
      return;
    }
    
    var firstShape = getFirstSelectedShape ();
    
    gammaCorrectionCheckbox.checked = firstShape.gammaCorrection.enabled;
  }
  
  
  
  var modelTranslationX = document.getElementById ("modelTranslationX");
  var modelTranslationY = document.getElementById ("modelTranslationY");
  var modelTranslationZ = document.getElementById ("modelTranslationZ");
  
  var modelScalingX = document.getElementById ("modelScalingX");
  var modelScalingY = document.getElementById ("modelScalingY");
  var modelScalingZ = document.getElementById ("modelScalingZ");
  
  function setShapeTranslation (shape)
  {
    var translationVector3f = new VecMath.SFVec3f
    (
      modelTranslationX.value,
      modelTranslationY.value,
      modelTranslationZ.value
    );
    
    shape.transformation.setTranslate (translationVector3f)
  }
  
  function setShapeScaling (shape)
  {
    var scalingVector3f = new VecMath.SFVec3f
    (
      modelScalingX.value,
      modelScalingY.value,
      modelScalingZ.value
    );
    
    shape.transformation.setScale (scalingVector3f)
  }
  
  if (modelTranslationX != null)
  {
    modelTranslationX.addEventListener
    (
      "change",
      function (event)
      {
        for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
                 shapeIndex++)
        {
          var shape = selectedShapes[shapeIndex];
          
          setShapeTranslation (shape);
        }
        renderer.update ();
      },
      false
    );
  }
  if (modelTranslationY != null)
  {
    modelTranslationY.addEventListener
    (
      "change",
      function (event)
      {
        for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
                 shapeIndex++)
        {
          var shape = selectedShapes[shapeIndex];
          
          setShapeTranslation (shape);
        }
        renderer.update ();
      },
      false
    );
  }
  if (modelTranslationZ != null)
  {
    modelTranslationZ.addEventListener
    (
      "change",
      function (event)
      {
        for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
                 shapeIndex++)
        {
          var shape = selectedShapes[shapeIndex];
          
          setShapeTranslation (shape);
        }
        renderer.update ();
      },
      false
    );
  }
  
  if (modelScalingX != null)
  {
    modelScalingX.addEventListener
    (
      "change",
      function (event)
      {
        for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
                 shapeIndex++)
        {
          var shape = selectedShapes[shapeIndex];
          
          setShapeScaling (shape);
        }
        renderer.update ();
      },
      false
    );
  }
  if (modelScalingY != null)
  {
    modelScalingY.addEventListener
    (
      "change",
      function (event)
      {
        for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
                 shapeIndex++)
        {
          var shape = selectedShapes[shapeIndex];
          
          setShapeScaling (shape);
        }
        renderer.update ();
      },
      false
    );
  }
  if (modelScalingZ != null)
  {
    modelScalingZ.addEventListener
    (
      "change",
      function (event)
      {
        for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
                 shapeIndex++)
        {
          var shape = selectedShapes[shapeIndex];
          
          setShapeScaling (shape);
        }
        renderer.update ();
      },
      false
    );
  }
  
  function updateModelTransformationControlElements ()
  {
    if ((modelTranslationX == null) || (! hasSelectedShapes ()))
    {
      return;
    }
    
    var firstShape = getFirstSelectedShape ();
    
    modelTranslationX.value = firstShape.transformation._03;
    modelTranslationY.value = firstShape.transformation._13;
    modelTranslationZ.value = firstShape.transformation._23;
    
    modelScalingX.value     = firstShape.transformation._00;
    modelScalingY.value     = firstShape.transformation._11;
    modelScalingZ.value     = firstShape.transformation._22;
  }
  
  
  
  var fresnelEnableCheckbox = document.getElementById ("fresnelEnabled");
  var fresnelBias           = document.getElementById ("fresnelBias");
  var fresnelScale          = document.getElementById ("fresnelScale");
  var fresnelPower          = document.getElementById ("fresnelPower");
  var fresnelColor          = document.getElementById ("fresnelColor");
  
  if (fresnelEnableCheckbox != null)
  {
    fresnelEnableCheckbox.addEventListener
    (
      "change",
      function (event)
      {
        var enableFresnel = fresnelEnableCheckbox.checked;
        
        for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
                 shapeIndex++)
        {
          var shape = selectedShapes[shapeIndex];
          
          shape.fresnelParameters.enabled = enableFresnel;
        }
        renderer.update ();
      },
      false
    );
  }
  
  if (fresnelBias != null)
  {
    fresnelBias.addEventListener
    (
      "change",
      function (event)
      {
        var biasValue = 0.0;
        
        biasValue = parseFloat (fresnelBias.value);
        
        for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
                 shapeIndex++)
        {
          var shape = selectedShapes[shapeIndex];
          
          shape.fresnelParameters.bias = biasValue;
        }
        renderer.update ();
      },
      false
    );
  }
  
  if (fresnelScale != null)
  {
    fresnelScale.addEventListener
    (
      "change",
      function (event)
      {
        var scaleValue = 0.0;
        
        scaleValue = parseFloat (fresnelScale.value);
        
        for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
                 shapeIndex++)
        {
          var shape = selectedShapes[shapeIndex];
          
          shape.fresnelParameters.scale = scaleValue;
        }
        renderer.update ();
      },
      false
    );
  }
  
  if (fresnelPower != null)
  {
    fresnelPower.addEventListener
    (
      "change",
      function (event)
      {
        var powerValue = 0.0;
        
        powerValue = parseFloat (fresnelPower.value);
        
        for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
                 shapeIndex++)
        {
          var shape = selectedShapes[shapeIndex];
          
          shape.fresnelParameters.power = powerValue;
        }
        renderer.update ();
      },
      false
    );
  }
  
  if (fresnelColor != null)
  {
    fresnelColor.addEventListener
    (
      "change",
      function (event)
      {
        var color = null;
        
        color = getRGBAColorArrayFromColorChooser (fresnelColor);
        
        for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
                 shapeIndex++)
        {
          var shape = selectedShapes[shapeIndex];
          
          shape.fresnelParameters.color = color;
        }
        renderer.update ();
      },
      false
    );
  }
  
  function updateFresnelControlElements ()
  {
    if ((fresnelEnableCheckbox == null) || (! hasSelectedShapes ()))
    {
      return;
    }
    
    var firstShape = getFirstSelectedShape ();
    
    setColorChooserRGBFromArray (fresnelColor, firstShape.fresnelParameters.color);
    
    fresnelEnableCheckbox.checked = firstShape.fresnelParameters.enabled;
    fresnelBias.value             = firstShape.fresnelParameters.bias;
    fresnelScale.value            = firstShape.fresnelParameters.scale;
    fresnelPower.value            = firstShape.fresnelParameters.power;
  }
  
  
  var textureFileInput   = document.getElementById ("textureFileInput");
  var textureEnabled     = document.getElementById ("textureEnabled");
  var textureModeReplace = document.getElementById ("textureModeReplace");
  var textureModeBlend   = document.getElementById ("textureModeBlend");
  var textureModeAdd     = document.getElementById ("textureModeAdd");
  
  // Getting files from file input: -> "http://stackoverflow.com/questions/15791279/how-to-get-files-from-input-type-file-indirect-with-javascript"
  // FileList API: -> "https://developer.mozilla.org/en-US/docs/Web/API/FileList"
  if (textureFileInput != null)
  {
    textureFileInput.addEventListener
    (
      "change",
      function (event)
      {
        var selectedFiles = textureFileInput.files;
        var numberOfFiles = selectedFiles.length;
        var firstFile     = null;
        
        if (numberOfFiles > 0)
        {
          firstFile = selectedFiles[0];
          
          for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
                 shapeIndex++)
          {
            var shape     = selectedShapes[shapeIndex];
            var texture2D = null;
            
            texture2D = new Texture2D     ();
            texture2D.setImageFromURL     ("textures/" + firstFile.name);
            texture2D.enabled             = true;
            shape.appearance.setTexture2D (texture2D);
          }
          renderer.update ();
        }
      },
      false
    );
  }
  
  if (textureEnabled != null)
  {
    textureEnabled.addEventListener
    (
      "change",
      function (event)
      {
        var enabled = textureEnabled.checked;
        
        for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
                 shapeIndex++)
        {
          var shape = selectedShapes[shapeIndex];
          
          shape.appearance.texture2D.enabled = enabled;
        }
        renderer.update ();
      },
      false
    );
  }
  
  if (textureModeReplace != null)
  {
    textureModeReplace.addEventListener
    (
      "change",
      function (event)
      {
        var enabled = textureModeReplace.checked;
        
        if (enabled)
        {
          for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
                   shapeIndex++)
          {
            var shape = selectedShapes[shapeIndex];
            
            shape.texturing.mode = Texturing.MODE_REPLACE;
          }
          renderer.update ();
        }
      },
      false
    );
  }
  
  if (textureModeBlend != null)
  {
    textureModeBlend.addEventListener
    (
      "change",
      function (event)
      {
        var enabled = textureModeBlend.checked;
        
        if (enabled)
        {
          for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
                   shapeIndex++)
          {
            var shape = selectedShapes[shapeIndex];
            
            shape.texturing.mode = Texturing.MODE_BLEND;
          }
          renderer.update ();
        }
      },
      false
    );
  }
  
  if (textureModeAdd != null)
  {
    textureModeAdd.addEventListener
    (
      "change",
      function (event)
      {
        var enabled = textureModeAdd.checked;
        
        if (enabled)
        {
          for (var shapeIndex = 0; shapeIndex < selectedShapes.length;
                   shapeIndex++)
          {
            var shape = selectedShapes[shapeIndex];
            
            shape.texturing.mode = Texturing.MODE_ADD;
          }
          renderer.update ();
        }
      },
      false
    );
  }
  
  function updateTextureControlElements ()
  {
    if ((textureEnabled == null) || (! hasSelectedShapes ()))
    {
      return;
    }
    
    var firstShape = getFirstSelectedShape ();
    
    setColorChooserRGBFromArray (fresnelColor, firstShape.fresnelParameters.color);
    
    textureEnabled.checked = firstShape.appearance.texture2D.enabled;
    
    if (firstShape.texturing.mode == Texturing.MODE_REPLACE)
    {
      textureModeReplace.checked = true;
    }
    else if (firstShape.texturing.mode == Texturing.MODE_BLEND)
    {
      textureModeBlend.checked = true;
    }
    else if (firstShape.texturing.mode == Texturing.MODE_ADD)
    {
      textureModeAdd.checked = true;
    }
  }
  
  
  
  function getUniformValuesAsString (shaderVariableSet)
  {
    var uniformVariablesAsString = "";
    
    for (var uniformName in shaderVariableSet.getUniformVariablesMap ())
    {
      var uniformValue = null;
      
      uniformValue             = shaderVariableSet.getUniformVariableByName (uniformName).getValue ();
      uniformVariablesAsString = uniformVariablesAsString + uniformName +
                                 "=" + uniformValue + "\n";
    }
    
    return uniformVariablesAsString;
  };
  
  function loadUniformValuesFromString (uniformVariablesAsString)
  {
    var linesAsArray = null;
    
    linesAsArray = uniformVariablesAsString.split ("\n");
    
    for (var lineIndex = 0; lineIndex < linesAsArray.length; lineIndex++)
    {
      var line         = linesAsArray[lineIndex];
      var lineTokens   = line.split ("=");
      var uniformName  = lineTokens[0];
      var uniformValue = lineTokens[1];
      
      // Use uniformName & uniformValue
    }
  };
  
  function getUniformVariableTypeAsString (uniformVariable)
  {
    var typeAsString = null;
    
    if (uniformVariable == null)
    {
      typeAsString = null;
    }
    else if (uniformVariable instanceof UniformVariable1i)
    {
      typeAsString = "UniformVariable1i";
    }
    else if (uniformVariable instanceof UniformVariable1f)
    {
      typeAsString = "UniformVariable1f";
    }
    else if (uniformVariable instanceof UniformVariable3f)
    {
      typeAsString = "UniformVariable3f";
    }
    else if (uniformVariable instanceof UniformVariable4f)
    {
      typeAsString = "UniformVariable4f";
    }
    else if (uniformVariable instanceof UniformVariable3fv)
    {
      typeAsString = "UniformVariable3fv";
    }
    else if (uniformVariable instanceof UniformVariable4fv)
    {
      typeAsString = "UniformVariable4fv";
    }
    else if (uniformVariable instanceof UniformVariableMatrix3fv)
    {
      typeAsString = "UniformVariableMatrix3fv";
    }
    else if (uniformVariable instanceof UniformVariableMatrix4fv)
    {
      typeAsString = "UniformVariableMatrix4fv";
    }
    else if (uniformVariable instanceof UniformVariable4fv)
    {
      typeAsString = "unknown";
    }
    
    return typeAsString;
  };
  
  /**
   * Creates and returns an object acting as an associative array,
   * mapping each uniform variable to a separate object, containing
   * name, value and type as data.
   * 
   * @param  {ShaderVariableSet} shaderVariableSet  An object holding
   *                                                the uniforms
   *                                                variables.
   * @return {Object}  A new object mapping each uniform variable name
   *                   to an object with following members:
   *                     name
   *                     value
   *                     type
   */
  function getUniformValuesAsObject (shaderVariableSet)
  {
    var resultObject = new Object ();
    
    for (var uniformName in shaderVariableSet.getUniformVariablesMap ())
    {
      var uniformVariable = null;
      var uniformValue    = null;
      var uniformType     = null;
      var uniformObject   = null;
      
      uniformVariable           = shaderVariableSet.getUniformVariableByName (uniformName);
      uniformValue              = uniformVariable.getValue ();
      uniformType               = getUniformVariableTypeAsString (uniformVariable);
      uniformObject             =
      {
        "name"  : uniformName,
        "value" : uniformValue,
        "type"  : uniformType
      };
      resultObject[uniformName] = uniformObject;
    }
    
    return resultObject;
  };
  
  /**
   * Creates and returns an object containing all data necessary for
   * an Ajax shader configuration store request.
   * 
   * @param  {ShaderVariableSet} shaderVariableSet  An object holding
   *                                                the uniforms
   *                                                variables.
   * @return {Object}  A new object with following members:
   *                     metadata.vertexShaderName
   *                     metadata.fragmentShaderName
   *                     uniformData
   */
  var getAjaxSendData = function (shaderVariableSet)
  {
    var sendDataObject         = null;
    var metadataObject         = null;
    var uniformVariablesObject = null;
    
    sendDataObject         = new Object ();
    metadataObject         = new Object ();
    uniformVariablesObject = getUniformValuesAsObject (shaderVariableSet);
    
    metadataObject.vertexShaderName   = vertexShaderName;
    metadataObject.fragmentShaderName = fragmentShaderName;
    
    sendDataObject.metadata    = metadataObject;
    sendDataObject.uniformData = uniformVariablesObject;
    
    return sendDataObject;
  };
  
  /**
   * Prompts the user for a file name and returns it.
   * 
   * @return {string}  The selected file name or "null", if the dialog
   *                   has been aborted.
   */
  var selectFileName = function ()
  {
    var fileName = null;
    
    fileName = prompt ("Please enter the file to save to.",
                       "ShaderConfig.xml");
    
    return fileName;
  };
  
  var getSelectedShaderVariableSet = function ()
  {
    return testAppearance.getShaderVariableSet ();
  };
  
  // -> "http://stackoverflow.com/questions/12096941/how-to-send-arrays-using-xmlhttprequest-to-server"
  showUniformVariablesButton.addEventListener
  (
    "click",
    function ()
    {
      var ajaxRequest       = null;
      var sendData          = null;
      var configFileName    = null;
      var shaderVariableSet = null;
      var dataAsJSONString  = null;
      
      configFileName    = selectFileName ();
      shaderVariableSet = getSelectedShaderVariableSet ();
      
      // No file name selected? => User has cancelled the process.
      if (configFileName == null)
      {
        return;
      }
      // No ShaderVariableSet? => Nothing to save.
      else if (shaderVariableSet == null)
      {
        return;
      }
      
      ajaxRequest       = new XMLHttpRequest ();
      sendData          = getAjaxSendData (shaderVariableSet);
      sendData.fileName = configFileName;
      dataAsJSONString  = JSON.stringify (sendData);
      
      ajaxRequest.onload = function ()
      {
        var ajaxResponse = this.responseText;
        
        alert (ajaxResponse);
      };
      
      ajaxRequest.open ("POST", "ajaxConfigurationSaver.php", true);
      ajaxRequest.send (dataAsJSONString);
    },
    false
  );
  
  
  
  function updateControlElements ()
  {
    updateMaterialFields                     ();
    updateModelTransformationControlElements ();
    updateAshikhminShirleyControlElements    ();
    updateCookTorranceControlElements        ();
    updateLommelSeeligerControlElements      ();
    updateOrenNayarControlElements           ();
    updateMinnaertControlElements            ();
    updateLambertControlElements             ();
    updateGoochControlElements               ();
    updateStraussControlElements             ();
    updateWardControlElements                ();
    updateTextureControlElements             ();
    updateTransparencyControlElements        ();
    updateFresnelControlElements             ();
    updateGammaCorrectionControlElements     ();
  }
  
  
  
  var sphere = addSphere ();
  
  var translationMatrix = VecMath.SFMatrix4f.translation (new VecMath.SFVec3f (0.0, 1.95, 0.0));
  sphere.transformation = sphere.getTransformation ().mult (translationMatrix);
  
  updateControlElements ();
};
