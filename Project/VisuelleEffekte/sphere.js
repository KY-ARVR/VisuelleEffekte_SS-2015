  /**
   * Creates and returns a sphere's principal data: array of points,
   * number of points, center, radius, theta step count and
   * phi step count.
   * 
   * @param  {Point3D} deltaX          The sphere center position.
   * @param  {number}  radius          The sphere radius.
   * @param  {number}  thetaStepCount  The number of theta divisions.
   * @param  {number}  phiStepCount    The number of phi   divisions.
   * @return {Object}  A new object with following members:
   *                     center:         The passed center as Point3D.
   *                     radius:         The passed radius.
   *                     thetaStepCount: The number of theta steps.
   *                     columnCount:    The number of phi steps.
   *                     points:         An array of Point3D
   *                                       sphere points.
   *                     pointCount:     The number of sphere points.
   */
  function getSphereData (center, radius, thetaStepCount, phiStepCount)
  {
    var pointData     = new Object ();
    var points        = [];
    var thetaStepSize = 0.0;
    var phiStepSize   = 0.0;
    var theta         = 0.0;
    var phi           = 0.0;
    
    var thetaValues   = [];
    var phiValues     = [];
    
    thetaStepSize = (Math.PI         / (thetaStepCount - 1.0));
    phiStepSize   = ((2.0 * Math.PI) / (phiStepCount   - 1.0));
    
    for (var thetaIndex = 0; thetaIndex < thetaStepCount; thetaIndex++)
    {
      thetaValues.push (theta);
      
      for (var phiIndex = 0; phiIndex < phiStepCount; phiIndex++)
      {
        var point3D  = null;
        var cosTheta = Math.cos (theta);
        var sinTheta = Math.sin (theta);
        var cosPhi   = Math.cos (phi);
        var sinPhi   = Math.sin (phi);
        var x        = radius * cosPhi * sinTheta;
        var y        = radius *          cosTheta;
        var z        = radius * sinPhi * sinTheta;
        
        if (center != null)
        {
          x = center.getX () + x;
          y = center.getY () + y;
          z = center.getZ () + z;
        }
        
        point3D = new Point3D (x, y, z);
        points.push (point3D);
        
        phiValues.push (phi);
        
        phi = phi + phiStepSize;
      }
      
      theta = theta + thetaStepSize;
    }
    
    pointData.center         = center;
    pointData.radius         = radius;
    pointData.points         = points;
    pointData.pointCount     = points.length;
    pointData.thetaStepCount = thetaStepCount;   // "Number of rows".
    pointData.phiStepCount   = phiStepCount;     // "Number of columns".
    pointData.thetaStart     = 0.0;
    pointData.thetaEnd       = Math.PI;
    pointData.thetaRange     = pointData.thetaEnd - pointData.thetaStart;
    pointData.thetaStepSize  = thetaStepSize;
    pointData.thetaValues    = thetaValues;
    pointData.phiStart       = 0.0;
    pointData.phiEnd         = 2.0 * Math.PI;
    pointData.phiRange       = pointData.phiEnd - pointData.phiStart;
    pointData.phiStepSize    = phiStepSize;
    pointData.phiValues      = phiValues;
    
    return pointData;
  };
  
  function getSpherePointIndices (sphereData)
  {
    var indices    = [];
    var pointCount = 0;
    
    pointCount = sphereData.pointCount;
    
    for (var pointIndex = 0; pointIndex < pointCount; pointIndex++)
    {
      var leftUpperPatchIndex  = 0;
      var rightUpperPatchIndex = 0;
      var leftLowerPatchIndex  = 0;
      var rightLowerPatchIndex = 0;
      
      leftUpperPatchIndex  = (pointIndex) % pointCount;
      rightUpperPatchIndex = (pointIndex + 1) % pointCount;
      leftLowerPatchIndex  = (pointIndex + sphereData.phiStepCount) % pointCount;
      rightLowerPatchIndex = (pointIndex + sphereData.phiStepCount + 1) % pointCount;
      
      // First triangle (left-upper patch).
      indices.push (leftUpperPatchIndex);
      indices.push (rightUpperPatchIndex);
      indices.push (leftLowerPatchIndex);
      // Second triangle (right-lower patch).
      indices.push (rightLowerPatchIndex);
      indices.push (leftLowerPatchIndex);
      indices.push (rightUpperPatchIndex);
    }
    
    return indices;
  };
  
  function getSphereNormals (sphereData)
  {
    var sphereNormals = [];
    
    for (var pointIndex = 0; pointIndex < sphereData.pointCount; pointIndex++)
    {
      var normal         = null;
      var pointOnSurface = sphereData.points[pointIndex];
      
      //normal = sphereData.center.getVectorFromMeToOtherAsSFVec3f (pointOnSurface);
      normal = sphereData.center.getVectorFromMeToOtherAsSFVec3f (pointOnSurface);
      normal = normal.normalize ();
      
      sphereNormals.push (normal);
    }
    
    return sphereNormals;
  };
  
  function getSphereTextureCoordinates (sphereData)
  {
    var sphereTexCoords = [];
    
    for (var phiIndex = 0; phiIndex < sphereData.phiValues.length; phiIndex++)
    {
      //var s = phiIndex / (sphereData.phiValues.length - 1);
      var s = sphereData.phiValues[phiIndex] / sphereData.phiRange;
      
      for (var thetaIndex = 0; thetaIndex < sphereData.thetaValues.length; thetaIndex++)
      {
        var t = sphereData.thetaValues[thetaIndex] / sphereData.thetaRange;
        //var t = thetaIndex / (sphereData.thetaValues.length - 1);
        
        sphereTexCoords.push (new VecMath.SFVec2f (s, t));
      }
    }
    
    return sphereTexCoords;
  };