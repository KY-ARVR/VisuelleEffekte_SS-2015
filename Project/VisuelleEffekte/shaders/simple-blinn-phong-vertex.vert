attribute vec3 vertex;
attribute vec3 color;
attribute vec3 normal;
//attribute vec2 texCoords;

uniform   mat4 viewMatrix;
uniform   mat4 projectionMatrix;
uniform   mat4 modelMatrix;
uniform   mat4 normalMatrix;
//uniform   sampler2D texture;

varying   vec3 varyingColor;
//varying   vec2 texCoords;
varying   vec3 fragmentPosition;
varying   vec3 fragmentNormal;

void main (void)
{
  // -> "https://www.siggraph.org/education/materials/HyperGraph/modeling/mod_tran/3drota.htm"
  //mat4 modelMatrix;
  /*
  // z-rotation:
  modelMatrix = mat4
  (
     cos (1.5), sin (1.5), 0.0, 0.0,
    -sin (1.5), cos (1.5), 0.0, 0.0,
     0.0,       0.0,       1.0, 0.0,
     0.0,       0.0,       0.0, 1.0
  );
  */
  // x-rotation:
  /*
  modelMatrix = mat4
  (
     1.0, 0.0,        0.0,       0.0,
     0.0, cos (1.5), -sin (1.5), 0.0,
     0.0, sin (1.5),  cos (1.5), 0.0,
     0.0, 0.0,        0.0,       1.0
  );
  */
  varyingColor = color;
  
  fragmentPosition = vec3 (viewMatrix * modelMatrix * vec4 (vertex, 1.0));
  fragmentNormal   = normalize (vec3 (normalMatrix * vec4 (normal, 1.0)));
  
  gl_Position  = projectionMatrix * viewMatrix * modelMatrix * vec4 (vertex, 1.0);
}