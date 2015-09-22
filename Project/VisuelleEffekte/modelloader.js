  //////////////////////////////////////////////////////////////////////
  // -- Implementation of the type "ModelLoader".                  -- //
  //////////////////////////////////////////////////////////////////////
  
  // -> "https://github.com/yjung/WebStuff/blob/master/webgl/frameworkExtMRT/app.js"
  //    (method "loadObject", line 125)
  var ModelLoader = function ()
  {
    this.scaleFactor     = 1.0;
    this.reverseNormals  = false;
    this.drawingInfo     = null;
    this.loaderListeners = [];
  };
  
  ModelLoader.prototype.addModelLoaderListener = function (listener)
  {
    this.loaderListeners.push (listener);
  };
  
  ModelLoader.prototype.fireModelLoadedEvent = function (fileName)
  {
    var firingModelLoader = this;
    var listenerCount     = this.loaderListeners.length;
    
    for (var listenerIndex = 0; listenerIndex < listenerCount;
             listenerIndex++)
    {
      var listener = this.loaderListeners[listenerIndex];
      
      if ((listener != null) && (listener["modelLoaded"] != null))
      {
        listener.modelLoaded (firingModelLoader, fileName);
      }
    }
  };
  
  ModelLoader.prototype.fireModelLoadingFailedEvent = function (fileName)
  {
    var firingModelLoader = this;
    var listenerCount     = this.loaderListeners.length;
    
    for (var listenerIndex = 0; listenerIndex < listenerCount;
             listenerIndex++)
    {
      var listener = this.loaderListeners[listenerIndex];
      
      if ((listener                       != null) &&
          (listener["modelLoadingFailed"] != null))
      {
        listener.modelLoadingFailed (firingModelLoader, fileName);
      }
    }
  };
  
  ModelLoader.prototype.getScaleFactor = function (scaleFactor)
  {
    return this.scaleFactor;
  };
  
  ModelLoader.prototype.setScaleFactor = function (scaleFactor)
  {
    this.scaleFactor = scaleFactor;
  };
  
  ModelLoader.prototype.isReverseNormals = function ()
  {
    return this.reverseNormals;
  };
  
  ModelLoader.prototype.setReverseNormals = function (reverseNormals)
  {
    this.reverseNormals = reverseNormals;
  };
  
  ModelLoader.prototype.loadObject = function (fileName)
  {
    var thisModelLoader = this;
    var ajaxRequest     = null;
    var objDoc          = null;
    var canParseObjDoc  = false;
    var objDocGeometry  = null;
    var fileString      = null;
    var scaleFactor     = false;
    var reverseNormals  = false;
    
    ajaxRequest = new XMLHttpRequest ();
    ajaxRequest.open ("GET", fileName);
    ajaxRequest.send ();
    
    ajaxRequest.onload = function ()
    {
      objDoc         = new OBJDoc (fileName);
      fileString     = ajaxRequest.responseText;
      scaleFactor    = thisModelLoader.scaleFactor;
      reverseNormals = thisModelLoader.reverseNormals;
      canParseObjDoc = objDoc.parse (fileString, scaleFactor, reverseNormals);
      
      if (! canParseObjDoc)
      {
        thisModelLoader.drawingInfo = null;
        thisModelLoader.fireModelLoadingFailedEvent (fileName);
      }
      else
      {
        thisModelLoader.drawingInfo = objDoc.getDrawingInfo ();
        thisModelLoader.fireModelLoadedEvent                (fileName);
      }
    };
  };
  
  ModelLoader.prototype.getDrawingInfo = function ()
  {
    return this.drawingInfo;
  };