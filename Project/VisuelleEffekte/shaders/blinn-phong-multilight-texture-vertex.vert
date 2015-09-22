attribute vec3      vertex;
attribute vec3      color;
attribute vec3      normal;
attribute vec2      texCoords;
attribute vec3      tangent;

uniform   mat4      projectionMatrix;
//uniform   mat4      modelMatrix;
//uniform   mat4      viewMatrix;
uniform   mat4      modelViewMatrix;
uniform   mat4      normalMatrix;
uniform   sampler2D texture;

varying   vec3      varyingColor;
varying   vec2      varyingTexCoords;
varying   vec3      fragmentPosition;
varying   vec3      fragmentNormal;
varying   float     fragmentToEyeDistance;

void main (void);

void main (void)
{
  // -> "https://www.siggraph.org/education/materials/HyperGraph/modeling/mod_tran/3drota.htm"
  varyingColor     = color;
  varyingTexCoords = texCoords;
  
  //fragmentPosition = vec3 (viewMatrix * modelMatrix * vec4 (vertex, 1.0));
  fragmentPosition      = vec3      (modelViewMatrix * vec4 (vertex, 1.0));
  fragmentNormal        = normalize ((normalMatrix * vec4 (normal, 0.0)).xyz);
  fragmentToEyeDistance = length    (fragmentPosition);
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4 (vertex, 1.0);
  
  
  
  vec3 unusedTangent;
  unusedTangent = tangent;
}
