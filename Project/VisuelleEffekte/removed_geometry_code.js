
  
  //////////////////////////////////////////////////////////////////////
  // -- Implementation of the type "TrianglesGeometry".            -- //
  //////////////////////////////////////////////////////////////////////
  
  /**
   * Creates a geometry based on the WebGL geometry type
   * "gl.TRIANGLES".
   * 
   * Each triple of vertices defines an independent triangle.
   * 
   * @param  {Point3D[]}  An array of vertices as "Point3D" objects.
   * @return {TrianglesGeometry}  A new TrianglesGeometry. 
   */
  var TrianglesGeometry = function (vertices)
  {
    AbstractGeometry.call (this, vertices);
  };
  
  TrianglesGeometry.prototype             = new AbstractGeometry ();
  TrianglesGeometry.prototype.constructor = TrianglesGeometry;
  
  TrianglesGeometry.prototype.draw = function (gl)
  {
    gl.drawArrays (gl.TRIANGLES, 0, this.vertices.length);
  };
  
  TrianglesGeometry.prototype.toString = function ()
  {
    var asString         = null;
    var verticesAsString = null;
    
    verticesAsString = "[" + this.vertices.toString () + "]";
    
    asString = "TrianglesGeometry(vertices=" + verticesAsString + ")";
    
    return asString;
  };
  
  
  //////////////////////////////////////////////////////////////////////
  // -- Implementation of the type "TriangleStripGeometry".        -- //
  //////////////////////////////////////////////////////////////////////
  
  /**
   * Creates a geometry based on the WebGL geometry type
   * "gl.TRIANGLE_STRIP".
   * 
   * The first three points define a triangle, with each additional
   * point adding another one by connecting to the last two points.
   * 
   * @param  {Point3D[]}  An array of vertices as "Point3D" objects.
   * @return {TriangleStripGeometry}  A new TriangleStripGeometry. 
   */
  var TriangleStripGeometry = function (vertices)
  {
    AbstractGeometry.call (this, vertices);
  };
  
  TriangleStripGeometry.prototype             = new AbstractGeometry ();
  TriangleStripGeometry.prototype.constructor = TriangleStripGeometry;
  
  TriangleStripGeometry.prototype.draw = function (gl, position)
  {
    var vertexCount = 0;
    
    vertexCount = this.vertices.length;
    
    gl.bindBuffer               (gl.ARRAY_BUFFER, this.positionBuffer);
    gl.vertexAttribPointer      (position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray  (position);
    gl.drawArrays               (gl.TRIANGLE_STRIP, 0, vertexCount);
    gl.disableVertexAttribArray (position);
  };
  
  TriangleStripGeometry.prototype.toString = function ()
  {
    var asString         = null;
    var verticesAsString = null;
    
    verticesAsString = "[" + this.vertices.toString () + "]";
    
    asString = "TriangleStripGeometry(vertices=" + verticesAsString + ")";
    
    return asString;
  };
  
  
  //////////////////////////////////////////////////////////////////////
  // -- Implementation of the type "TriangleFanGeometry".          -- //
  //////////////////////////////////////////////////////////////////////
  
  /**
   * Creates a geometry based on the WebGL geometry type
   * "gl.TRIANGLE_FAN".
   * 
   * The first three points define a triangle, with each additional
   * point adding another one by connecting itself to the last
   * triangle's last vertex and the first triangle's first vertex.
   * 
   * @param  {Point3D[]}  An array of vertices as "Point3D" objects.
   * @return {TriangleFanGeometry}  A new TriangleFanGeometry. 
   */
  var TriangleFanGeometry = function (vertices)
  {
    AbstractGeometry.call (this, vertices);
  };
  
  TriangleFanGeometry.prototype             = new AbstractGeometry ();
  TriangleFanGeometry.prototype.constructor = TriangleFanGeometry;
  
  TriangleFanGeometry.prototype.draw = function (gl)
  {
    gl.drawArrays (gl.TRIANGLE_FAN, 0, this.vertices.length);
  };
  
  TriangleFanGeometry.prototype.toString = function ()
  {
    var asString         = null;
    var verticesAsString = null;
    
    verticesAsString = "[" + this.vertices.toString () + "]";
    
    asString = "TriangleFanGeometry(vertices=" + verticesAsString + ")";
    
    return asString;
  };
  
  
  //////////////////////////////////////////////////////////////////////
  // -- Implementation of the type "LineStripGeometry".            -- //
  //////////////////////////////////////////////////////////////////////
  
  /**
   * Creates a geometry based on the WebGL geometry type
   * "gl.LINE_STRIP".
   * 
   * The first two points create line, with each additional point
   * generating another line from the last line's second end point to
   * the new point.
   * 
   * @param  {Point3D[]}  An array of vertices as "Point3D" objects.
   * @return {LineStripGeometry}  A new LineStripGeometry. 
   */
  var LineStripGeometry = function (vertices)
  {
    AbstractGeometry.call (this, vertices);
  };
  
  LineStripGeometry.prototype             = new AbstractGeometry ();
  LineStripGeometry.prototype.constructor = LineStripGeometry;
  
  LineStripGeometry.prototype.draw = function (gl, position)
  {
    var vertexCount = 0;
    
    vertexCount = this.vertices.length;
    
    gl.bindBuffer               (gl.ARRAY_BUFFER, this.positionBuffer);
    gl.vertexAttribPointer      (position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray  (position);
    gl.drawArrays               (gl.LINE_STRIP, 0, vertexCount);
    gl.disableVertexAttribArray (position);
  };
  
  LineStripGeometry.prototype.toString = function ()
  {
    var asString         = null;
    var verticesAsString = null;
    
    verticesAsString = "[" + this.vertices.toString () + "]";
    
    asString = "LineStripGeometry(vertices=" + verticesAsString + ")";
    
    return asString;
  };
  
  
  //////////////////////////////////////////////////////////////////////
  // -- Implementation of the type "LineLoopGeometry".             -- //
  //////////////////////////////////////////////////////////////////////
  
  /**
   * Creates a geometry based on the WebGL geometry type
   * "gl.LINE_LOOP".
   * 
   * ...
   * 
   * @param  {Point3D[]}  An array of vertices as "Point3D" objects.
   * @return {LineLoopGeometry}  A new LineLoopGeometry. 
   */
  var LineLoopGeometry = function (vertices)
  {
    AbstractGeometry.call (this, vertices);
  };
  
  LineLoopGeometry.prototype             = new AbstractGeometry ();
  LineLoopGeometry.prototype.constructor = LineLoopGeometry;
  
  LineLoopGeometry.prototype.draw = function (gl)
  {
    gl.drawArrays (gl.LINE_LOOP, 0, this.vertices.length);
  };
  
  LineLoopGeometry.prototype.toString = function ()
  {
    var asString         = null;
    var verticesAsString = null;
    
    verticesAsString = "[" + this.vertices.toString () + "]";
    
    asString = "LineLoopGeometry(vertices=" + verticesAsString + ")";
    
    return asString;
  };
  