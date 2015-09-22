  //////////////////////////////////////////////////////////////////////
  // -- Implementation of the type "Point3D".                      -- //
  //////////////////////////////////////////////////////////////////////
  
  /**
   * Creates a new Point3D with the given coordinates.
   * 
   * @param  {number} x  The x-coordinates.
   * @param  {number} y  The y-coordinates.
   * @param  {number} z  The z-coordinates.
   * @return {Point3D}   A new Point3D with the given coordinates.
   */
  var Point3D = function (x, y, z)
  {
    this.coordinates = [x, y, z];
    
    this.getCoordinates = function ()
    {
      return this.coordinates;
    };
    
    this.setCoordinates = function (x, y, z)
    {
      this.coordinates = [x, y, z];
    };
    
    this.getX = function ()
    {
      return this.coordinates[0];
    };
    
    this.setX = function (newX)
    {
      this.coordinates[0] = newX;
    };
    
    this.getY = function ()
    {
      return this.coordinates[1];
    };
    
    this.setY = function (newY)
    {
      this.coordinates[1] = newY;
    };
    
    this.getZ = function ()
    {
      return this.coordinates[2];
    };
    
    this.setZ = function (newZ)
    {
      this.coordinates[2] = newZ;
    };
    
    /**
     * Creates a new Point3D by adding the given coordinates to this
     * instance's.
     * 
     * @param  {number} deltaX  The translation for the x-coordinates.
     * @param  {number} deltaY  The translation for the y-coordinates.
     * @param  {number} deltaZ  The translation for the z-coordinates.
     * @return {Point3D}        A new Point3D with this object's
     *                          coordinates translated by the
     *                          given values.
     */
    this.addAndCreateNew = function (deltaX, deltaY, deltaZ)
    {
      var newPoint = null;
      
      newPoint = new Point3D
      (
        this.getX () + deltaX,
        this.getY () + deltaY,
        this.getZ () + deltaZ
      );
      
      return newPoint;
    };
  };
  
  Point3D.prototype.getVectorFromOtherToMeAsSFVec3f = function (startPoint)
  {
    var vector             = null;
    var startPointAsVector = null;
    var endPointAsVector   = null;
    
    startPointAsVector = new VecMath.SFVec3f (startPoint.getX (),
                                              startPoint.getY (),
                                              startPoint.getZ ());
    endPointAsVector   = new VecMath.SFVec3f (this.getX (),
                                              this.getY (),
                                              this.getZ ());
    vector             = endPointAsVector.subtract (startPointAsVector);
    
    return vector;
  };
  
  Point3D.prototype.getVectorFromMeToOtherAsSFVec3f = function (endPoint)
  {
    var vector             = null;
    var startPointAsVector = null;
    var endPointAsVector   = null;
    
    startPointAsVector = new VecMath.SFVec3f (this.getX (),
                                              this.getY (),
                                              this.getZ ());
    endPointAsVector   = new VecMath.SFVec3f (endPoint.getX (),
                                              endPoint.getY (),
                                              endPoint.getZ ());
    vector             = endPointAsVector.subtract (startPointAsVector);
    
    return vector;
  };
  
  Point3D.prototype.getAsSFVec3f = function ()
  {
    var vector = new VecMath.SFVec3f (this.getX (),
                                      this.getY (),
                                      this.getZ ());
    return vector;
  };
  
  // Matrix is of type "SFMatrix4f"
  Point3D.prototype.transform = function (transformationMatrix4f)
  {
    var vector = this.getAsSFVec3f ();
    
    vector = transformationMatrix4f.multMatrixPnt (vector);
    this.setX (vector.x);
    this.setY (vector.y);
    this.setZ (vector.z);
  };
  
  // Matrix is of type "SFMatrix4f"
  Point3D.prototype.getTransformed = function (transformationMatrix4f)
  {
    var transformedPoint3D = new Point3D       ();
    var vector             = this.getAsSFVec3f ();
    
    vector = transformationMatrix4f.multMatrixPnt (vector);
    transformedPoint3D.setX (vector.x);
    transformedPoint3D.setY (vector.y);
    transformedPoint3D.setZ (vector.z);
    
    return transformedPoint3D;
  };
  
  Point3D.prototype.toString = function ()
  {
    var asString = null;
    
    asString = "Point3D(x=" + this.getX () + ", " +
                       "y=" + this.getY () + ", " +
                       "z=" + this.getZ () + ")";
    
    return asString;
  };