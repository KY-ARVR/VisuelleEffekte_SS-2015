  //////////////////////////////////////////////////////////////////////
  // -- Implementation of the type "CirclePointCreator".           -- //
  //////////////////////////////////////////////////////////////////////
  
  var CirclePointCreator = function (center, radius, divisionCount)
  {
    this.center        = center;
    this.radius        = radius;
    this.divisionCount = divisionCount;
    this.startAngle    = 0.0;
    this.endAngle      = (2.0 * Math.PI);
  };
  
  CirclePointCreator.prototype.getPoints = function ()
  {
    var points    = [];
    var angleStep = 0.0;
    
    angleStep = (2.0 * Math.PI) / this.divisionCount;
    
    for (var angle  = this.startAngle;
             angle <= this.endAngle; angle = angle + angleStep)
    {
      var currentPoint = new Point3D
      (
        Math.cos (angle) * this.radius + this.center.getX (),
        Math.sin (angle) * this.radius + this.center.getY (),
        this.center.getZ ()
      );
      points.push (currentPoint);
    }
    
    return points;
  };