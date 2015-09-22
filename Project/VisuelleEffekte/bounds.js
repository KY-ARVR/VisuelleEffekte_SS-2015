  var BoundingBox = function ()
  {
    this.minimumX  = 0.0;
    this.maximumX  = 0.0;
    this.minimumY  = 0.0;
    this.maximumY  = 0.0;
    this.minimumZ  = 0.0;
    this.maximumZ  = 0.0;
    this.midpointX = 0.0;
    this.midpointY = 0.0;
    this.midpointZ = 0.0;
    this.width     = 0.0;
    this.height    = 0.0;
    this.depth     = 0.0;
  };
  
  BoundingBox.prototype.setFromPoint3DArray = function (point3DArray)
  {
    var minimumX    = 0.0;
    var maximumX    = 0.0;
    var minimumY    = 0.0;
    var maximumY    = 0.0;
    var minimumZ    = 0.0;
    var maximumZ    = 0.0;
    var width       = 0.0;
    var height      = 0.0;
    var depth       = 0.0;
    var midpointX   = 0.0;
    var midpointY   = 0.0;
    var midpointZ   = 0.0;
    
    for (var pointIndex = 0; pointIndex < point3DArray.length; pointIndex++)
    {
      var point  = point3DArray[pointIndex];
      var pointX = point.getX ();
      var pointY = point.getY ();
      var pointZ = point.getZ ();
      
      if (pointX < minimumX)
      {
        minimumX = pointX;
      }
      if (pointX > maximumX)
      {
        maximumX = pointX;
      }
      
      if (pointY < minimumY)
      {
        minimumY = pointY;
      }
      if (pointY > maximumY)
      {
        maximumY = pointY;
      }
      
      if (pointZ < minimumZ)
      {
        minimumZ = pointZ;
      }
      if (pointZ > maximumZ)
      {
        maximumZ = pointZ;
      }
    }
    
    width     = (maximumX - minimumX);
    height    = (maximumY - minimumY);
    depth     = (maximumZ - minimumZ);
    midpointX = (minimumX + (width  / 2.0));
    midpointY = (minimumY + (height / 2.0));
    midpointZ = (minimumZ + (depth  / 2.0));
    
    this.minimumX  = minimumX;
    this.maximumX  = maximumX;
    this.minimumY  = minimumY;
    this.maximumY  = maximumY;
    this.minimumZ  = minimumZ;
    this.maximumZ  = maximumZ;
    this.midpointX = midpointX;
    this.midpointY = midpointY;
    this.midpointZ = midpointZ;
    this.width     = width;
    this.height    = height;
    this.depth     = depth;
  };
  
  BoundingBox.prototype.setToUnitCube = function ()
  {
    var minimumX    = -0.5;
    var maximumX    =  0.5;
    var minimumY    = -0.5;
    var maximumY    =  0.5;
    var minimumZ    = -0.5;
    var maximumZ    =  0.5;
    var width       =  1.0;
    var height      =  1.0;
    var depth       =  1.0;
    var midpointX   =  0.0;
    var midpointY   =  0.0;
    var midpointZ   =  0.0;
    
    this.minimumX  = minimumX;
    this.maximumX  = maximumX;
    this.minimumY  = minimumY;
    this.maximumY  = maximumY;
    this.minimumZ  = minimumZ;
    this.maximumZ  = maximumZ;
    this.midpointX = midpointX;
    this.midpointY = midpointY;
    this.midpointZ = midpointZ;
    this.width     = width;
    this.height    = height;
    this.depth     = depth;
  };
  
  BoundingBox.prototype.setToCoordinatesAndDimensions = function
  (
    centerX,
    centerY,
    centerZ,
    width,
    height,
    depth
  )
  {
    var minimumX    = centerX - (width  / 2.0);
    var maximumX    = centerX + (width  / 2.0);
    var minimumY    = centerY - (height / 2.0);
    var maximumY    = centerY + (height / 2.0);
    var minimumZ    = centerZ - (depth  / 2.0);
    var maximumZ    = centerZ + (depth  / 2.0);
    var midpointX   = centerX;
    var midpointY   = centerY;
    var midpointZ   = centerZ;
    
    this.minimumX  = minimumX;
    this.maximumX  = maximumX;
    this.minimumY  = minimumY;
    this.maximumY  = maximumY;
    this.minimumZ  = minimumZ;
    this.maximumZ  = maximumZ;
    this.midpointX = midpointX;
    this.midpointY = midpointY;
    this.midpointZ = midpointZ;
    this.width     = width;
    this.height    = height;
    this.depth     = depth;
  };
  
  BoundingBox.prototype.toString = function ()
  {
    var asString = null;
    
    asString = "BoundingBox(" +
               "minPoint=("   + this.minimumX + ", "  +
                                this.minimumY + ", "  +
                                this.minimumZ + "), " +
               "maxPoint=("   + this.maximumX + ", "  +
                                this.maximumY + ", "  +
                                this.maximumZ + "), " +
               "dimensions=(" + this.width    + ", "  +
                                this.height   + ", "  +
                                this.depth    + ")";
    
    return asString;
  };
  