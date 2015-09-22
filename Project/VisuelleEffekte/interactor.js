  var MouseEventInfo = function ()
  {
    this.mouseButton = -1;
  };
  
  MouseEventInfo.UNKNOWN_MOUSE_BUTTON = -1;
  MouseEventInfo.LEFT_MOUSE_BUTTON    =  0;
  MouseEventInfo.RIGHT_MOUSE_BUTTON   =  1;


  //////////////////////////////////////////////////////////////////////
  // -- Implementation of the type "MouseInteractor".              -- //
  //////////////////////////////////////////////////////////////////////
  
  var MouseInteractor = function (canvas)
  {
    this.canvas         = canvas;
    this.lastPoint      = null;
    this.currentPoint   = null;
    this.dragging       = false;
    this.currentScroll  = 0.0;
    this.mouseListeners = [];
    this.currentMouseButton = MouseEventInfo.UNKNOWN;
  };
  
  MouseInteractor.prototype.initialize = function ()
  {
    var interactor = this;
    
    this.canvas.addEventListener
    (
      "mousedown",
      function (event)
      {
        interactor.lastPoint    = new Point3D (event.layerX, -event.layerY, 0.0);
        // Prevents jumping after "mouseup" event.
        interactor.currentPoint = interactor.lastPoint;
        interactor.dragging     = true;
        interactor.currentMouseButton = interactor.getMouseButtonFromEvent (event);
        interactor.fireMouseDragStartedEvent (interactor.createMouseEventInfo (event));
      },
      false
    );
    
    this.canvas.addEventListener
    (
      "mousemove",
      function (event)
      {
        if (interactor.dragging)
        {
          interactor.lastPoint    = interactor.currentPoint;
          interactor.currentPoint = new Point3D (event.layerX, -event.layerY, 0.0);
          
          var mouseEventInfo = new MouseEventInfo ();
          mouseEventInfo.mouseButton = interactor.currentMouseButton;
          
          interactor.fireMouseDragMovedEvent (mouseEventInfo);
        }
      },
      false
    );
    
    this.canvas.addEventListener
    (
      "mouseup",
      function (event)
      {
        interactor.currentPoint = new Point3D (event.layerX, -event.layerY, 0.0);
        interactor.dragging     = false;
        interactor.fireMouseDragFinishedEvent (interactor.createMouseEventInfo (event));
      },
      false
    );
    
    this.canvas.addEventListener
    (
      "mouseout",
      function (event)
      {
        interactor.currentPoint = new Point3D (event.layerX, -event.layerY, 0.0);
        interactor.dragging     = false;
        interactor.fireMouseDragFinishedEvent (interactor.createMouseEventInfo (event));
      },
      false
    );
    
    this.canvas.addEventListener
    (
      "mousewheel",
      function (event)
      {
        interactor.currentScroll = event.wheelDelta;
        interactor.fireMouseScrolledEvent ();
      },
      false
    );
    
    // "mousewheel" for Firefox.
    this.canvas.addEventListener
    (
      "DOMMouseScroll",
      function (event)
      {
        interactor.currentScroll = event.detail;
        interactor.fireMouseScrolledEvent ();
      },
      false
    );
  };
  
  MouseInteractor.prototype.getLastPoint = function ()
  {
    return this.lastPoint;
  };
  
  MouseInteractor.prototype.getCurrentPoint = function ()
  {
    return this.currentPoint;
  };
  
  MouseInteractor.prototype.isDragging = function ()
  {
    return this.dragging;
  };
  
  MouseInteractor.prototype.getDragVector = function ()
  {
    if ((this.lastPoint != null) && (this.currentPoint != null))
    {
      return this.currentPoint.getVectorFromOtherToMeAsSFVec3f (this.lastPoint);
    }
    else
    {
      return null;
    }
  };
  
  MouseInteractor.prototype.getCurrentScroll = function ()
  {
    return this.currentScroll;
  };
  
  MouseInteractor.prototype.addMouseListener = function (listener)
  {
    if (listener != null)
    {
      this.mouseListeners.push (listener);
    }
  };
  
  MouseInteractor.prototype.fireMouseDragStartedEvent = function (mouseEventInfo)
  {
    var firingInteractor = this;
    
    for (var listenerIndex = 0; listenerIndex < this.mouseListeners.length; listenerIndex++)
    {
      var listener = this.mouseListeners[listenerIndex];
      
      if ((listener != null) && (listener["mouseDragStarted"] != null))
      {
        listener.mouseDragStarted (firingInteractor, mouseEventInfo);
      }
    }
  };
  
  MouseInteractor.prototype.fireMouseDragMovedEvent = function (mouseEventInfo)
  {
    var firingInteractor = this;
    
    for (var listenerIndex = 0; listenerIndex < this.mouseListeners.length; listenerIndex++)
    {
      var listener = this.mouseListeners[listenerIndex];
      
      if ((listener != null) && (listener["mouseDragMoved"] != null))
      {
        listener.mouseDragMoved (firingInteractor, mouseEventInfo);
      }
    }
  };
  
  MouseInteractor.prototype.fireMouseDragFinishedEvent = function (mouseEventInfo)
  {
    var firingInteractor = this;
    
    for (var listenerIndex = 0; listenerIndex < this.mouseListeners.length; listenerIndex++)
    {
      var listener = this.mouseListeners[listenerIndex];
      
      if ((listener != null) && (listener["mouseDragFinished"] != null))
      {
        listener.mouseDragFinished (firingInteractor, mouseEventInfo);
      }
    }
  };
  
  MouseInteractor.prototype.fireMouseScrolledEvent = function ()
  {
    var firingInteractor = this;
    
    for (var listenerIndex = 0; listenerIndex < this.mouseListeners.length; listenerIndex++)
    {
      var listener = this.mouseListeners[listenerIndex];
      
      if ((listener != null) && (listener["mouseScrolled"] != null))
      {
        listener.mouseScrolled (firingInteractor);
      }
    }
  };
  
  MouseInteractor.prototype.getMouseButtonFromEvent = function (event)
  {
    if (event != null)
    {
      if (event.which == 1)
      {
        return MouseEventInfo.LEFT_MOUSE_BUTTON;
      }
      else if (event.which == 3)
      {
        return MouseEventInfo.RIGHT_MOUSE_BUTTON;
      }
      else
      {
        return MouseEventInfo.UNKNOWN_MOUSE_BUTTON;
      }
    }
    else
    {
      return MouseEventInfo.UNKNOWN_MOUSE_BUTTON;
    }
  };
  
  MouseInteractor.prototype.createMouseEventInfo = function (event)
  {
    if (event != null)
    {
      var mouseEventInfo = new MouseEventInfo ();
      
      mouseEventInfo.mouseButton = this.getMouseButtonFromEvent (event);
      
      return mouseEventInfo;
    }
    else
    {
      return null;
    }
  };