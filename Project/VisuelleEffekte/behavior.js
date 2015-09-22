//////////////////////////////////////////////////////////////////////
  // -- Implementation of the type "AbstractBehavior".             -- //
  //////////////////////////////////////////////////////////////////////
  
  var AbstractBehavior = function ()
  {
    this.behaviorListeners = [];
  };
  
  AbstractBehavior.prototype.addBehaviorListener = function (listener)
  {
    this.behaviorListeners.push (listener);
  };
  
  AbstractBehavior.prototype.fireBehaviorChangedEvent = function ()
  {
    var firingBehavior = this;
    var listenerCount  = this.behaviorListeners.length;
    
    for (var listenerIndex = 0; listenerIndex < listenerCount; listenerIndex++)
    {
      var listener = this.behaviorListeners[listenerIndex];
      
      if ((listener != null) && (listener["behaviorChanged"] != null))
      {
        listener.behaviorChanged (firingBehavior);
      }
    }
  };
  
  // Abstract method.
  AbstractBehavior.prototype.initialize = function ()
  {
  };
  
  // Abstract method.
  AbstractBehavior.prototype.execute = function ()
  {
  };
  
  
  //////////////////////////////////////////////////////////////////////
  // -- Implementation of the type "RotationBehavior".             -- //
  //////////////////////////////////////////////////////////////////////
  
  var RotationBehavior = function
  (
    shape3D,
    startAngle,
    endAngle,
    angleStep,
    timeData
  )
  {
    AbstractBehavior.call (this);
    
    this.shape3D        = shape3D;
    this.startAngle     = startAngle;
    this.endAngle       = endAngle;
    this.angleStep      = angleStep;
    this.angleInRadians = this.startAngle;
    this.timeData       = timeData;
    this.axisOfRotation = new VecMath.SFVec3f (0.0, 1.0, 0.0);
  };
  
  RotationBehavior.prototype = new AbstractBehavior ();
  RotationBehavior.prototype.constructor = RotationBehavior;
  
  RotationBehavior.prototype.setAxisOfRotationFromFloats = function (x, y, z)
  {
    this.axisOfRotation = new VecMath.SFVec3f (x, y, z);
  };
  
  RotationBehavior.prototype.initialize = function ()
  {
    var callingBehavior = this;
    
    setInterval
    (
      function ()
      {
        callingBehavior.execute ();
      },
      this.timeData.delay
    );
  };
  
  RotationBehavior.prototype.execute = function ()
  {
    var rotationMatrix  = null;
    
    this.angleInRadians = this.angleInRadians + this.angleStep;
    
    if (this.angleInRadians > this.endAngle)
    {
      this.angleInRadians = this.startAngle;
    }
    
    //rotationMatrix = VecMath.SFMatrix4f.rotationY (this.angleInRadians);
    /*
    rotationMatrix = VecMath.SFMatrix4f.rotationX (this.angleStep);
    rotationMatrix = rotationMatrix.mult (VecMath.SFMatrix4f.rotationY (this.angleStep));
    rotationMatrix = rotationMatrix.mult (VecMath.SFMatrix4f.rotationZ (this.angleStep));
    */
    
    // Using "this.angleInRadians" leads to acceleration.
    var quaternion = VecMath.Quaternion.axisAngle (this.axisOfRotation, this.angleStep);
    
    rotationMatrix = quaternion.toMatrix ();
    
    // -------------> !!!UNCOMMENT TO ACTIVATE!!!
    this.shape3D.setTransformation (this.shape3D.getTransformation ().mult (rotationMatrix));
    this.fireBehaviorChangedEvent  ();
  };