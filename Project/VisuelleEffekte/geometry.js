// -> "3_GLSL_Texturen_Mathe.pdf", S. 5
  
  
  var Triangle = function (vertex1, vertex2, vertex3)
  {
    this.vertex1 = vertex1;
    this.vertex2 = vertex2;
    this.vertex3 = vertex3;
  };
  
  
  //////////////////////////////////////////////////////////////////////
  // -- Implementation of the type "Vertex3D".                     -- //
  //////////////////////////////////////////////////////////////////////
  
  var Vertex3D = function ()
  {
    this.position      = [0.0, 0.0, 0.0];
    this.normal        = [0.0, 0.0, 0.0];
    this.textureCoords = [0.0, 0.0];
    this.color         = [1.0, 1.0, 1.0];
  };
  
  Vertex3D.prototype.getPositionAsPoint3D = function ()
  {
    return new Point3D (this.position[0], this.position[1], this.position[2]);
  };
  
  Vertex3D.prototype.getPositionAsFloatArray = function ()
  {
    return this.position;
  };
  
  Vertex3D.prototype.setPositionFromXYZ = function (x, y, z)
  {
    this.position = [x, y, z];
  };
  
  Vertex3D.prototype.setPositionFromPoint3D = function (point3D)
  {
    if (point3D != null)
    {
      this.position = point3D.getCoordinates ();
    }
  };
  
  Vertex3D.prototype.getNormalAsFloatArray = function ()
  {
    return this.normal;
  };
  
  Vertex3D.prototype.setNormalFromXYZ = function (normalX, normalY, normalZ)
  {
    this.normal = [normalX, normalY, normalZ];
  };
  
  Vertex3D.prototype.getColorAsFloatArray = function ()
  {
    return this.color;
  };
  
  Vertex3D.prototype.setColorFromRGB = function (red, green, blue)
  {
    this.color = [red, green, blue];
  };
  
  Vertex3D.prototype.getTextureCoordinatesAsFloatArray = function ()
  {
    return this.textureCoords;
  };
  
  Vertex3D.prototype.setTextureCoordinatesFromST = function (s, t)
  {
    this.textureCoords = [s, t];
  };
  
  
  //////////////////////////////////////////////////////////////////////
  // -- Implementation of the type "CapabilitySet".                -- //
  //////////////////////////////////////////////////////////////////////
  
  var CAPABILITY_USE_POSITIONS = "usePosition";
  var CAPABILITY_USE_NORMALS   = "useNormals";
  var CAPABILITY_USE_COLORS    = "useColor";
  var CAPABILITY_USE_TEXTURES  = "useTextures";
  
  var CapabilitySet = function ()
  {
    /*
    this.capabilities =
    {
      CAPABILITY_USE_POSITIONS : true,
      CAPABILITY_USE_NORMALS   : true,
      CAPABILITY_USE_COLORS    : true,
      CAPABILITY_USE_TEXTURES  : true
    };
    */
    this.capabilities = new Object ();
    this.capabilities[CAPABILITY_USE_POSITIONS] = true;
    this.capabilities[CAPABILITY_USE_NORMALS  ] = true;
    this.capabilities[CAPABILITY_USE_COLORS   ] = true;
    this.capabilities[CAPABILITY_USE_TEXTURES ] = true;
  };
  
  CapabilitySet.prototype.getCapabilities = function ()
  {
    return this.capabilities;
  };
  
  CapabilitySet.prototype.getCapability = function (key)
  {
    return this.capabilities[key];
  };
  
  CapabilitySet.prototype.isCapabilityActive = function (key)
  {
    var isActive = false;
    var value    = this.getCapability (key);
    
    if ((value != undefined) && (value != null))
    {
      isActive = (value == true);
    }
    else
    {
      isActive = false;
    }
    
    return isActive;
  };
  
  // Copy arbitrary object key-value pairs.
  CapabilitySet.prototype.setCapabilitiesFromObject = function (object)
  {
    for (var key in object)
    {
      this.capabilities[key] = object[key];
    }
  };
  
  CapabilitySet.prototype.setCapability = function (key, value)
  {
    this.capabilities[key] = value;
  };
  
  
  //////////////////////////////////////////////////////////////////////
  // -- Implementation of the type "AbstractGeometry".             -- //
  //////////////////////////////////////////////////////////////////////
  
  var AbstractGeometry = function (point3DArray)
  {
    this.vertices       = [];      // Array of Vertex3D instances.
    this.positionBuffer = null;    // WebGLBufferObject instance.
    this.normalBuffer   = null;    // WebGLBufferObject instance.
    this.texCoordBuffer = null;
    this.colorBuffer    = null;
    this.textureBuffer  = null;
    this.tangentBuffer  = null;
    this.capabilities   = new CapabilitySet ();
    
    if (point3DArray != null)
    {
      for (var pointIndex = 0; pointIndex < point3DArray.length; pointIndex++)
      {
        var point3D   = point3DArray[pointIndex];
        var newVertex = new Vertex3D ();
        
        newVertex.setPositionFromPoint3D (point3D);
        
        this.vertices.push (newVertex);
      }
    }
  };
  
  AbstractGeometry.prototype.getVertices = function ()
  {
    return this.vertices;
  };
  
  AbstractGeometry.prototype.getVertexAtIndex = function (vertexIndex)
  {
    return this.vertices[vertexIndex];
  };
  
  AbstractGeometry.prototype.getVertexCount = function ()
  {
    return this.vertices.length;
  };
  
  AbstractGeometry.prototype.getPositionAtIndexAsFloatArray = function (vertexIndex)
  {
    return this.getVertexAtIndex (vertexIndex).getPositionAsFloatArray ();
  };
  
  AbstractGeometry.prototype.getPositionsAsFloatArray = function ()
  {
    var positionArray = [];
    
    for (var vertexIndex = 0; vertexIndex < this.vertices.length; vertexIndex++)
    {
      var vertexPosition = this.getPositionAtIndexAsFloatArray (vertexIndex);
      
      positionArray.push (vertexPosition[0]);
      positionArray.push (vertexPosition[1]);
      positionArray.push (vertexPosition[2]);
    }
    
    return positionArray;
  };
  
  AbstractGeometry.prototype.getNormalAtIndexAsFloatArray = function (vertexIndex)
  {
    return this.getVertexAtIndex (vertexIndex).getNormalAsFloatArray ();
  };
  
  // [normalx1, normaly1, normalz1, normalx2, ...]
  AbstractGeometry.prototype.getNormalsAsFloatArray = function ()
  {
    var normalsArray = [];
    
    for (var vertexIndex = 0; vertexIndex < this.vertices.length; vertexIndex++)
    {
      var vertexNormal = this.getNormalAtIndexAsFloatArray (vertexIndex);
      
      normalsArray.push (vertexNormal[0]);
      normalsArray.push (vertexNormal[1]);
      normalsArray.push (vertexNormal[2]);
    }
    
    return normalsArray;
  };
  
  AbstractGeometry.prototype.setNormalAtIndexFromXYZ = function (index, x, y, z)
  {
    this.getVertexAtIndex (index).setNormalFromXYZ (x, y, z);
  };
  
  AbstractGeometry.prototype.setNormalsFromFloatArray = function (normalsArray)
  {
    var normalCoordsCount = (normalsArray.length);
    /* <!> VERY IMPORTANT <!>
     *     The formula must be
     *       var normalCoordsCount = (normalsArray.length);
     *       var vertexCoordsCount = this.vertices.length * 3;
     *                                                   ^^^^
     *     NOT
     *       var normalCoordsCount = (normalsArray.length / 3);
     *                                                   ^^^^
     *       var vertexCoordsCount = this.vertices.length;
     */
    // Total number of normals coordinates in the geometry (3 normal
    // coordinates per vertex. => vertex_count * 3.
    var vertexCoordsCount = this.vertices.length * 3;
    var maximumIndex      = Math.min (normalCoordsCount, vertexCoordsCount) - 1;
    var vertexIndex       = 0;
    var normalIndex       = 0;
    
    for (var normalIndex = 0; normalIndex <= maximumIndex;
             normalIndex = normalIndex + 3)
    {
      this.getVertexAtIndex (vertexIndex).setNormalFromXYZ
      (
        normalsArray[normalIndex + 0],
        normalsArray[normalIndex + 1],
        normalsArray[normalIndex + 2]
      );
      
      
      //console.log ("Writing " + (normalIndex + 0) + "/" + normalsArray.length);
      //console.log ("Writing " + (normalIndex + 1) + "/" + normalsArray.length);
      //console.log ("Writing " + (normalIndex + 2) + "/" + normalsArray.length);
      
      
      vertexIndex = vertexIndex + 1;
    }
  };
  
  AbstractGeometry.prototype.getColorAtIndexAsFloatArray = function (vertexIndex)
  {
    return this.getVertexAtIndex (vertexIndex).getColorAsFloatArray ();
  };
  
  AbstractGeometry.prototype.setColorAtIndexFromRGB = function (index, red, green, blue)
  {
    this.getVertexAtIndex (index).setColorFromRGB (red, green, blue);
  };
  
  // [colorR1, colorG1, colorB1, colorR2, ...]
  AbstractGeometry.prototype.getColorsAsFloatArray = function ()
  {
    var colorsArray = [];
    
    for (var vertexIndex = 0; vertexIndex < this.vertices.length; vertexIndex++)
    {
      var vertexColor = this.getColorAtIndexAsFloatArray (vertexIndex);
      
      colorsArray.push (vertexColor[0]);
      colorsArray.push (vertexColor[1]);
      colorsArray.push (vertexColor[2]);
    }
    
    return colorsArray;
  };
  
  AbstractGeometry.prototype.setColorsRGBFromFloatArray = function (colorsArray)
  {
    var colorCount   = colorsArray.length;
    var maximumIndex = Math.min (colorCount, this.vertices.length * 3) - 1;
    var vertexIndex  = 0;
    
    for (var colorIndex = 0; colorIndex <= maximumIndex;
             colorIndex = colorIndex + 3)
    {
      this.setColorAtIndexFromRGB
      (
        vertexIndex,
        colorsArray[colorIndex + 0],
        colorsArray[colorIndex + 1],
        colorsArray[colorIndex + 2]
      );
      vertexIndex = vertexIndex + 1;
    }
  };
  
  AbstractGeometry.prototype.getTextureCoordinatesAtIndexAsFloatArray = function (vertexIndex)
  {
    return this.getVertexAtIndex (vertexIndex).getTextureCoordinatesAsFloatArray ();
  };
  
  AbstractGeometry.prototype.setTextureCoordinatesAtIndexFromST = function (vertexIndex, s, t)
  {
    this.getVertexAtIndex (vertexIndex).setTextureCoordinatesFromST (s, t);
  };
  
  AbstractGeometry.prototype.setTextureCoordinatesFromFloatArray = function (texCoordsArray)
  {
    var texCoordCount = texCoordsArray.length;
    var maximumIndex  = Math.min (texCoordCount, this.vertices.length * 2) - 1;
    var vertexIndex   = 0;
    
    for (var texCoordIndex = 0; texCoordIndex <= maximumIndex;
             texCoordIndex = texCoordIndex + 2)
    {
      this.setTextureCoordinatesAtIndexFromST
      (
        vertexIndex,
        texCoordsArray[texCoordIndex + 0],
        texCoordsArray[texCoordIndex + 1]
      );
      vertexIndex = vertexIndex + 1;
    }
  };
  
  // [colorR1, colorG1, colorB1, colorR2, ...]
  AbstractGeometry.prototype.getTextureCoordinatesAsFloatArray = function ()
  {
    var textureCoordsArray = [];
    
    for (var vertexIndex = 0; vertexIndex < this.vertices.length; vertexIndex++)
    {
      var vertexTexCoords = this.getTextureCoordinatesAtIndexAsFloatArray (vertexIndex);
      
      textureCoordsArray.push (vertexTexCoords[0]);
      textureCoordsArray.push (vertexTexCoords[1]);
    }
    
    return textureCoordsArray;
  };
  
  
  AbstractGeometry.prototype.getCapabilitySet = function ()
  {
    return this.capabilities;
  };
  
  AbstractGeometry.prototype.setCapabilitySet = function (capabilitySet)
  {
    this.capabilities = capabilitySet;
  };
  
  
  AbstractGeometry.prototype.initialize = function (renderingContext)
  {
    var gl                    = renderingContext.getGL ();
    var positionsAsFloatArray = null;
    var positionsAsBufferData = null;
    var normalsAsFloatArray   = null;
    var normalsAsBufferData   = null;
    var colorsAsFloatArray    = null;
    var colorsAsBufferData    = null;
    var texCoordsAsFloatArray = null;
    var texCoordsAsBufferData = null;
    
    positionsAsFloatArray = this.getPositionsAsFloatArray ();
    positionsAsBufferData = new Float32Array (positionsAsFloatArray);
    normalsAsFloatArray   = this.getNormalsAsFloatArray ();
    normalsAsBufferData   = new Float32Array (normalsAsFloatArray);
    colorsAsFloatArray    = this.getColorsAsFloatArray ();
    colorsAsBufferData    = new Float32Array (colorsAsFloatArray);
    
    // Bind vertices.
    this.positionBuffer = gl.createBuffer  ();
    gl.bindBuffer (gl.ARRAY_BUFFER, this.positionBuffer);
    // DO THIS JUST ONCE, CALL ONLY "drawArrays(...)" on each call.
    gl.bufferData (gl.ARRAY_BUFFER, positionsAsBufferData, gl.STATIC_DRAW);
    
    // Bind normals.
    this.normalBuffer = gl.createBuffer  ();
    gl.bindBuffer (gl.ARRAY_BUFFER, this.normalBuffer);
    gl.bufferData (gl.ARRAY_BUFFER, normalsAsBufferData, gl.STATIC_DRAW);
    
    this.colorBuffer = gl.createBuffer ();
    gl.bindBuffer (gl.ARRAY_BUFFER, this.colorBuffer);
    gl.bufferData (gl.ARRAY_BUFFER, colorsAsBufferData, gl.STATIC_DRAW);
    
    /*
    this.tangentBuffer = gl.createBuffer ();
    gl.bindBuffer (gl.ARRAY_BUFFER, this.tangentBuffer);
    gl.bufferData (gl.ARRAY_BUFFER, ???, gl.STATIC_DRAW);
    */
  };
  
  /**
   * Draws the geometry to the given WebGL context.
   * 
   * @param {WebGLRenderingContext} gl  The context to draw to.
   */
  AbstractGeometry.prototype.draw = function (gl, attributeLocationMap)
  {
    alert ("AbstractGeometry.draw(): ABSTRACT METHOD INVOCATION.");
  };
  
  
  
  
  //////////////////////////////////////////////////////////////////////
  // -- Implementation of the type "IndexedTriangleGeometry".      -- //
  //////////////////////////////////////////////////////////////////////
  
  var IndexedTriangleGeometry = function (point3DArray, indices)
  {
    AbstractGeometry.call (this, point3DArray);
    
    this.indices = indices;
  };
  
  IndexedTriangleGeometry.prototype             = new AbstractGeometry ();
  IndexedTriangleGeometry.prototype.constructor = IndexedTriangleGeometry;
  
  IndexedTriangleGeometry.prototype.getIndices = function ()
  {
    return this.indices;
  };
  
  IndexedTriangleGeometry.prototype.setIndices = function (indices)
  {
    this.indices = indices;
  };
  
  // Point3Ds after indexing.
  IndexedTriangleGeometry.prototype.getCompletePoint3DArray = function ()
  {
    var completePoint3DArray = [];
    var indexCount          = this.indices.length;
    var vertices            = this.getVertices ();
    
    for (var indexPosition = 0; indexPosition < indexCount; indexPosition++)
    {
      var index       = this.indices[indexPosition];
      var vertex      = vertices[index];
      var point       = vertex.getPositionAsPoint3D ();
      var copyOfPoint = new Point3D (point.getX (), point.getY (), point.getZ ());
      
      //completePoint3DArray.push (point);
      completePoint3DArray.push (copyOfPoint);
    }
    
    return completePoint3DArray;
  };
  
  // Vertex3Ds after indexing.
  IndexedTriangleGeometry.prototype.getCompleteVertexArray = function ()
  {
    var completeVertexArray = [];
    var indexCount          = this.indices.length;
    var vertices            = this.getVertices ();
    
    for (var indexPosition = 0;
             indexPosition < indexCount; indexPosition++)
    {
      var index  = this.indices[indexPosition];
      var vertex = vertices[index];
      
      completeVertexArray.push (vertex);
    }
    
    return completeVertexArray;
  };
  
  IndexedTriangleGeometry.prototype.getTriangles = function ()
  {
    var triangleArray       = [];
    var completeVertexArray = this.getCompleteVertexArray ();
    var triangleIndex       = 0;
    
    for (var vertexIndex = 0;
             vertexIndex < completeVertexArray.length;
             vertexIndex = vertexIndex + 3)
    {
      var vertex1 = completeVertexArray[vertexIndex    ];
      var vertex2 = completeVertexArray[vertexIndex + 1];
      var vertex3 = completeVertexArray[vertexIndex + 2];
      
      triangleArray.push (new Triangle (vertex1, vertex2, vertex3));
    }
    
    return triangleArray;
  };
  
  IndexedTriangleGeometry.prototype.getTangentForTriangle = function (triangle)
  {
    var tangent       = [];
    var v0            = null;
    var v1            = null;
    var v2            = null;
    var edge1         = null;
    var edge2         = null;
    var v0TexCoords   = null;
    var v1TexCoords   = null;
    var v2TexCoords   = null;
    var deltaU1       = 0.0;
    var deltaV1       = 0.0;
    var deltaU2       = 0.0;
    var deltaV2       = 0.0;
    var f             = 0.0;
    
    v0          = triangle.vertex1.getPositionAsPoint3D ();
    v1          = triangle.vertex2.getPositionAsPoint3D ();
    v2          = triangle.vertex3.getPositionAsPoint3D ();
    edge1       = v1.getVectorFromOtherToMeAsSFVec3f (v0);
    edge2       = v2.getVectorFromOtherToMeAsSFVec3f (v0);
    v0TexCoords = triangle.vertex1.getTextureCoordinatesAsFloatArray ();
    v1TexCoords = triangle.vertex2.getTextureCoordinatesAsFloatArray ();
    v2TexCoords = triangle.vertex3.getTextureCoordinatesAsFloatArray ();
    deltaU1     = v1TexCoords[0] - v0TexCoords[0];
    deltaV1     = v1TexCoords[1] - v0TexCoords[1];
    deltaU2     = v2TexCoords[0] - v0TexCoords[0];
    deltaV2     = v2TexCoords[1] - v0TexCoords[1];
    f           = 1.0 / ((deltaU1 * deltaV2) - (deltaU2 * deltaV1));
    tangent[0]  = (f * ((deltaV2 * edge1.x)) - (deltaV1 * edge2.x));
    tangent[1]  = (f * ((deltaV2 * edge1.y)) - (deltaV1 * edge2.y));
    tangent[2]  = (f * ((deltaV2 * edge1.z)) - (deltaV1 * edge2.y));
    
    return tangent;
  };
  
  IndexedTriangleGeometry.prototype.getTangentsAsFloatArray = function ()
  {
    var tangentArray  = [];
    var triangleArray = this.getTriangles ();
    
    for (var triangleIndex = 0;
             triangleIndex < triangleArray.length; triangleIndex++)
    {
      var triangle = triangleArray[triangleIndex];
      var tangent  = this.getTangentForTriangle (triangle);
      
      tangentArray.push (tangent[0], tangent[1], tangent[2]);
      tangentArray.push (tangent[0], tangent[1], tangent[2]);
      tangentArray.push (tangent[0], tangent[1], tangent[2]);
    }
    
    return tangentArray;
  };
  
  IndexedTriangleGeometry.prototype.initialize = function (renderingContext)
  {
    var gl                    = renderingContext.getGL ();
    var verticesAsBufferData  = null;
    var indicesAsBufferData   = null;
    var normalsAsBufferData   = null;
    var colorsAsBufferData    = null;
    var texCoordsAsBufferData = null;
    var tangentAsBufferData   = null;
    
    this.positionBuffer   = gl.createBuffer  ();
    this.indexBuffer      = gl.createBuffer  ();
    this.normalBuffer     = gl.createBuffer  ();
    this.colorBuffer      = gl.createBuffer  ();
    this.textureBuffer    = gl.createBuffer  ();
    this.tangentBuffer    = gl.createBuffer  ();
    verticesAsBufferData  = new Float32Array (this.getPositionsAsFloatArray ());
    indicesAsBufferData   = new Uint32Array  (this.getIndices ());
    normalsAsBufferData   = new Float32Array (this.getNormalsAsFloatArray ());
    colorsAsBufferData    = new Float32Array (this.getColorsAsFloatArray ())
    texCoordsAsBufferData = new Float32Array (this.getTextureCoordinatesAsFloatArray ());
    tangentAsBufferData   = new Float32Array (this.getTangentsAsFloatArray ());
    
    console.log ("IndexedTriangleGeometry.initialize(): " + this.getTangentsAsFloatArray ().length + " | " + this.getNormalsAsFloatArray ().length);
    
    // Bind positions.
    gl.bindBuffer (gl.ARRAY_BUFFER, this.positionBuffer);
    // DO THIS JUST ONCE, CALL ONLY "drawArrays(...)" on each call.
    gl.bufferData (gl.ARRAY_BUFFER, verticesAsBufferData, gl.STATIC_DRAW);
    
    // Bind indices.
    gl.bindBuffer (gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData (gl.ELEMENT_ARRAY_BUFFER, indicesAsBufferData, gl.STATIC_DRAW);
    
    // Bind normals.
    gl.bindBuffer (gl.ARRAY_BUFFER, this.normalBuffer);
    gl.bufferData (gl.ARRAY_BUFFER, normalsAsBufferData, gl.STATIC_DRAW);
    
    // Bind colors.
    gl.bindBuffer (gl.ARRAY_BUFFER, this.colorBuffer);
    gl.bufferData (gl.ARRAY_BUFFER, colorsAsBufferData, gl.STATIC_DRAW);
    
    // Bind texture coordinates.
    gl.bindBuffer (gl.ARRAY_BUFFER, this.textureBuffer);
    gl.bufferData (gl.ARRAY_BUFFER, texCoordsAsBufferData, gl.STATIC_DRAW);
    
    // Bind tangent coordinates.
    gl.bindBuffer (gl.ARRAY_BUFFER, this.tangentBuffer);
    gl.bufferData (gl.ARRAY_BUFFER, tangentAsBufferData, gl.STATIC_DRAW);
  };
  
  IndexedTriangleGeometry.prototype.draw = function (gl, attributeLocationMap)
  {
    var elementCount       = 0;
    var positionAttribute  = null;
    var normalAttribute    = null;
    var colorAttribute     = null;
    var texCoordsAttribute = null;
    var tangentAttribute   = null;
    var useTexture         = false;
    
    elementCount       = this.getIndices ().length;
    positionAttribute  = attributeLocationMap.positionAttrib;
    normalAttribute    = attributeLocationMap.normalAttrib;
    colorAttribute     = attributeLocationMap.colorAttrib;
    texCoordsAttribute = attributeLocationMap.texCoordsAttrib;
    tangentAttribute   = attributeLocationMap.tangentAttrib;
    
    gl.bindBuffer (gl.ARRAY_BUFFER, this.positionBuffer);
    positionAttribute.enable (gl);
    
    gl.bindBuffer (gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    
    gl.bindBuffer (gl.ARRAY_BUFFER, this.normalBuffer);
    normalAttribute.enable (gl);
    
    gl.bindBuffer (gl.ARRAY_BUFFER, this.colorBuffer);
    colorAttribute.enable (gl);
    
    useTexture = this.getCapabilitySet ().isCapabilityActive (CAPABILITY_USE_TEXTURES);
    if (useTexture)
    {
      gl.bindBuffer (gl.ARRAY_BUFFER, this.textureBuffer);
      texCoordsAttribute.enable (gl);
      /*
      gl.bindTexture   (gl.TEXTURE_2D,   this.textureObject);
      // Flip image's Y axis to match WebGL's texture coordinate space.
      gl.pixelStorei   (gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texImage2D    (gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.textureImage);
      */
    }
    
    
    gl.bindBuffer           (gl.ARRAY_BUFFER, this.tangentBuffer);
    tangentAttribute.enable (gl);
    
    
    gl.drawElements (gl.TRIANGLES, elementCount, gl.UNSIGNED_INT, 0);
    
    for (var attributeName in attributeLocationMap)
    {
      attributeLocationMap[attributeName].disable (gl);
    }
  };
  
  IndexedTriangleGeometry.prototype.toString = function ()
  {
    var asString         = null;
    var verticesAsString = null;
    var indicesAsString  = null;
    
    verticesAsString = "[" + this.vertices.toString () + "]";
    indicesAsString  = "[" + this.indices.toString  () + "]";
    
    asString = "IndexedTriangleGeometry" +
               "(vertices=" + verticesAsString + ", " +
               "indices="   + indicesAsString  + ")";
    
    return asString;
  };
  