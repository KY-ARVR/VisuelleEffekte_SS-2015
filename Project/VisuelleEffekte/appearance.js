  //////////////////////////////////////////////////////////////////////
  // -- Implementation of the type "Texture2D".                    -- //
  //////////////////////////////////////////////////////////////////////
  
  var Texture2D = function ()
  {
    this.image         = null;
    this.imageReady    = false;
    this.loadListeners = [];
    this.textureObject = null;
    this.textureBuffer = null;
    this.enabled       = false;
  };
  
  Texture2D.prototype.setImageFromURL = function (imageURL)
  {
    var firingTexture2D = this;
    
    this.image = new Image ();
    
    this.image.crossOrigin = "";
    this.image.src         = imageURL;
    
    this.image.onload = function ()
    {
      firingTexture2D.imageReady = true;
      firingTexture2D.fireImageLoadedEvent ();
    };
  };
  
  Texture2D.prototype.isImageReady = function ()
  {
    return this.imageReady;
  };
  
  Texture2D.prototype.addLoadListener = function (listener)
  {
    if (listener != null)
    {
      this.loadListeners.push (listener);
    }
  };
  
  Texture2D.prototype.removeLoadListener = function (listener)
  {
    // TODO
  };
  
  Texture2D.prototype.fireImageLoadedEvent = function ()
  {
    for (var listenerIndex = 0; listenerIndex < this.loadListeners.length; listenerIndex++)
    {
      var listener = this.loadListeners[listenerIndex];
      
      if ((listener != null) && (listener["imageLoaded"] != null))
      {
        listener.imageLoaded (this);
      }
    }
  };
  
  // NEEDS TEXTURE COORDINATES. BUT THEY ARE IN THE GEOMETRY!
  Texture2D.prototype.initialize = function (gl)
  {
    //var texCoordsAsBufferData = null;
    
    this.textureObject = gl.createTexture ();
    //this.textureBuffer = gl.createBuffer  ();
    
    // Bind texture coordinates.
    //gl.bindBuffer (gl.ARRAY_BUFFER, this.textureBuffer);
    //gl.bufferData (gl.ARRAY_BUFFER, texCoordsAsBufferData, gl.STATIC_DRAW);
  };
  
  Texture2D.prototype.prepareForDrawing = function (gl)
  {
    if (! this.imageReady)
    {
      return;
    }
    
    // Occurs, if texture image changed.
    if (this.textureObject == null)
    {
      this.textureObject = gl.createTexture ();
    }
    
    //gl.bindBuffer    (gl.ARRAY_BUFFER, this.textureBuffer);
    gl.activeTexture (gl.TEXTURE0);
    gl.bindTexture   (gl.TEXTURE_2D,   this.textureObject);
    // Flip image's Y axis to match WebGL's texture coordinate space.
    gl.pixelStorei   (gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D    (gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);
  };
  
  Texture2D.prototype.prepareAfterDrawing = function (gl)
  {
    gl.bindTexture (gl.TEXTURE_2D, null);
  };
  
  Texture2D.prototype.cleanUp = function (gl)
  {
    gl.deleteTexture (texture);
  };
  
  Texture2D.prototype.draw = function (gl)
  {
  };
  
  Texture2D.prototype.toString = function ()
  {
    var asString = null;
    
    asString = "Texture2D(imageURL=\"" + this.image.src +
               "\", imageReady=" + this.imageReady +
               ", enabled=" + this.enabled + ")";
    
    return asString;
  };
  
  
  //////////////////////////////////////////////////////////////////////
  // -- Implementation of the type "Appearance".                   -- //
  //////////////////////////////////////////////////////////////////////
  
  var Appearance = function ()
  {
    this.shaderProgram       = new ShaderProgram     ();
    this.shaderVariableSet   = new ShaderVariableSet ();
    this.texture2D           = new Texture2D         ();
    this.appearanceListeners = [];
  };
  
  Appearance.prototype.getShaderProgram = function ()
  {
    return this.shaderProgram;
  };
  
  Appearance.prototype.setShaderProgram = function (shaderProgram)
  {
    this.shaderProgram = shaderProgram;
  };
  
  Appearance.prototype.setTexture2D = function (texture2D)
  {
    this.texture2D = texture2D;
    
    if (texture2D != null)
    {
      texture2D.addLoadListener (this);
    }
  };
  
  Appearance.prototype.getShaderVariableSet = function ()
  {
    return this.shaderVariableSet;
  };
  
  Appearance.prototype.setShaderVariableSet = function (shaderVariableSet)
  {
    this.shaderVariableSet = shaderVariableSet;
  };
  
  Appearance.prototype.addAppearanceListener = function (listener)
  {
    this.appearanceListeners.push (listener);
  };
  
  Appearance.prototype.fireAppearanceUpdatedEvent = function ()
  {
    var firingAppearance = this;
    var listenerCount    = this.appearanceListeners.length;
    
    for (var listenerIndex = 0; listenerIndex < listenerCount; listenerIndex++)
    {
      var listener = this.appearanceListeners[listenerIndex];
      
      if ((listener != null) && listener["appearanceUpdated"] != null)
      {
        listener.appearanceUpdated (firingAppearance);
      }
    }
  };
  
  Appearance.prototype.imageLoaded = function ()
  {
    this.fireAppearanceUpdatedEvent ();
  };