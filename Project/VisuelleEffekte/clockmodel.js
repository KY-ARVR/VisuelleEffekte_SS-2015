var ClockModel = function ()
{
  this.FULL_CIRCLE_IN_RADIANS = (2.0 * Math.PI);
  this.SECONDS_STEP_COUNT     = 60.0;
  this.MINUTES_STEP_COUNT     = 60.0;
  this.HOURS_STEP_COUNT       = 12.0;
  
  this.currentSecondsToAngle = function ()
  {
    var angle       = 0.0;
    var currentDate = new Date               ();
    var seconds     = currentDate.getSeconds ();
    var angleStep   = (this.FULL_CIRCLE_IN_RADIANS /
                       this.SECONDS_STEP_COUNT);
    
    angle = -(seconds * angleStep);
    
    return angle;
  };
  
  this.currentMinutesToAngle = function (moveContinuous)
  {
    var angle       = 0.0;
    var currentDate = new Date               ();
    var minutes     = currentDate.getMinutes ();
    var angleStep   = (this.FULL_CIRCLE_IN_RADIANS /
                       this.MINUTES_STEP_COUNT);
    
    if (moveContinuous)
    {
      var seconds         = 0.0;
      // Extra angle for seconds (interpolation of seconds).
      var secondsRotation = 0.0;
      
      seconds         = currentDate.getSeconds ();
      secondsRotation = (angleStep * (seconds / this.SECONDS_STEP_COUNT));
      
      angle = -((minutes * angleStep) + secondsRotation);
    }
    else
    {
      angle = -(minutes * angleStep);
    }
    
    return angle;
  };
  
  this.currentHoursToAngle = function (moveContinuous)
  {
    var angle       = 0.0;
    var currentDate = new Date             ();
    var hours       = currentDate.getHours ();
    var angleStep   = (this.FULL_CIRCLE_IN_RADIANS /
                       this.HOURS_STEP_COUNT);
    
    if (moveContinuous)
    {
      var minutes         = 0.0;
      // Extra angle for minutes.
      var minutesRotation = 0.0;
      
      minutes         =  currentDate.getMinutes ();
      minutesRotation =  (angleStep * (minutes / 60.0));
      angle           = -((hours * angleStep) + minutesRotation);
    }
    else
    {
      angle = -(hours * angleStep);
    }
    
    return angle;
  };
};