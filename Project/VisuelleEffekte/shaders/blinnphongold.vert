    precision highp float;
    
    struct LightSource
    {
      vec4 position;
      //vec3 position;
      //vec3 direction;
      vec4 ambientColor;
      vec4 diffuseColor;
      vec4 specularColor;
      int  isEnabled;       // Do not forget to copy!
    };
    
    struct Material
    {
      vec4  ambientColor;
      vec4  diffuseColor;
      vec4  emissiveColor;
      vec4  specularColor;
      float shininess;
    };
    
    const     int         NUMBER_OF_LIGHTS = 3;
    
    uniform   vec3        eyePosition;
    uniform   LightSource lights[NUMBER_OF_LIGHTS];
    uniform   Material    material;
    uniform   float       transparency;
    uniform   sampler2D   texture;
    
    varying   vec3 varyingColor;
    varying   vec2 varyingTexCoords;
    varying   vec3 fragmentPosition;
    varying   vec3 fragmentNormal;
    
    void main (void)
    {
      vec3  surfaceNormal;
      vec4  fragmentColor;
      
      surfaceNormal = normalize (fragmentNormal);
      fragmentColor = vec4      (0.0, 0.0, 0.0, 1.0);
      //fragmentColor = texture2D (texture, varyingTexCoords);
      
      for (int lightIndex = 0; lightIndex < NUMBER_OF_LIGHTS; lightIndex++)
      {
        LightSource light;
        vec3        surfaceToLightVector;
        vec3        surfaceToEyeVector;
        float       diffuseTerm;
        vec3        halfVector;
        float       specularTerm;
        
        light = lights[lightIndex];
        
        if (light.isEnabled != 1)
        {
          continue;
        }
        
        // Directional light? => Is already a vector.
        if (light.position.w == 0.0)
        {
          surfaceToLightVector = normalize (vec3 (light.position));
        }
        // Positional light? => Convert to a vector.
        else
        {
          surfaceToLightVector = normalize (vec3 (light.position.xyz - fragmentPosition));
        }
        
        surfaceToEyeVector = normalize (vec3 (eyePosition - fragmentPosition));
        diffuseTerm        = max (dot (surfaceNormal, surfaceToLightVector), 0.0);
        
        halfVector   = normalize (surfaceToLightVector + surfaceToEyeVector);
        specularTerm = pow (max (dot (surfaceNormal, halfVector), 0.0), material.shininess);
        
        /*
        fragmentColor =  fragmentColor
                       + light.diffuseColor  * material.diffuseColor  * diffuseTerm
                       + light.specularColor * material.specularColor * specularTerm
                       + light.ambientColor  * material.ambientColor;
        */
        fragmentColor = texture2D (texture, varyingTexCoords);
      }
      
      fragmentColor = material.emissiveColor + fragmentColor + texture2D (texture, varyingTexCoords);
      
      gl_FragColor  = vec4 (fragmentColor.rgb, 1.0 - transparency);
    }