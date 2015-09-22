<?php
  
  // 09.07.2015
  
  $shaderMap = null;
  
  $shaderMap = array
  (
    "strauss" => array
    (
      "name"        => "Strauss",
      "description" => "<p>"                                          .
                       "A model which emphasises easy to understand " .
                       "parameters, while being able to simulate "    .
                       "a wide range of materials."                   .
                       "</p>"                                         .
                       "<p>"                                          .
                       "Especially well-suited for metallic "         .
                       "surfaces."                                    .
                       "</p>",
      "icon"        => "resources/Icon_ShaderPreview_Strauss.png"
    ),
    "wardAnisotropic" => array
    (
      "name"        => "Anisotropic Ward",
      "description" => "An anisotropic model based on empirical "     .
                       "approximation."                               .
                       "Very good at simulating brushed metals.",
      "icon"        => "resources/Icon_ShaderPreview_Ward.png"
    ),
    "ashikhminShirley" => array
    (
      "name"        => "Ashikhmin-Shirley",
      "description" => "A anisotropic lighting model utilizing two "  .
                       "exponential factors, which enable to create " .
                       "characteristic specular areas.",
      "icon"        => "resources/Icon_ShaderPreview_AshikhminShirley.png"
    ),
    "lommelSeeliger" => array
    (
      "name"        => "Lommel-Seeliger",
      "description" => "<p>"                                          .
                       "A shader to simulate dusty surfaces."         .
                       "</p>"                                         .
                       "<p>"                                          .
                       "This implementation extends the basic model " .
                       "to allow a certain degree of control over "   .
                       "the result."                                  .
                       "</p>",
      "icon"        => "resources/Icon_ShaderPreview_LommelSeeliger.png"
    ),
    "orenNayar" => array
    (
      "name"        => "Oren-Nayar",
      "description" => "<p>"                                        .
                       "A rather expensive shader which extends "   .
                       "the Lambertian model by a roughness term."  .
                       "</p>"                                       .
                       "<p>"                                        .
                       "Allows a realistic modelling of rough "     .
                       "surfaces, like dirt or the moon."           .
                       "</p>",
      "icon"        => "resources/Icon_ShaderPreview_OrenNayar.png"
    ),
    "minnaert" => array
    (
      "name"        => "Minnaert",
      "description" => "<p>"                                          .
                       "A rough shader with characteristic dark "     .
                       "areas."                                       .
                       "</p>"                                         .
                       "<p>"                                          .
                       "Often used for velvet simulation."            .
                       "</p>",
      "icon"        => "resources/Icon_ShaderPreview_Minnaert.png"
    ),
    "lambert" => array
    (
      "name"        => "Lambert",
      "description" => "<p>"                                          .
                       "A classical and efficient, but not very "     .
                       "realistic, model."                            .
                       "</p>"                                         .
                       "<p>"                                          .
                       "Good for plastic surfaces."                   .
                       "</p>",
      "icon"        => "resources/Icon_ShaderPreview_Lambert.png"
    ),
    "cookTorrance" => array
    (
      "name"        => "Cook-Torrance",
      "description" => "A physically plausible model suitable for a " .
                       "wide range of materials, especially shiny "   .
                       "metals.",
      "icon"        => "resources/Icon_ShaderPreview_CookTorrance.png"
    ),
    "gooch" => array
    (
      "name"        => "Gooch",
      "description" => "<p>"                                        .
                       "A non-photorealistic shading model, which " .
                       "uses false coloring to improve the "        .
                       "visibility of contours."                    .
                       "</p>"                                       .
                       "<p>"                                        .
                       "Useful for technical drawings."             .
                       "</p>"                                       .
                       "<p>"                                        .
                       "<strong>Do not forget to use at most ONE "  .
                       "light source.</strong>"                     .
                       "</p>",
      "icon"        => "resources/Icon_ShaderPreview_Gooch.png"
    )
  );
  
?>


<!DOCTYPE html>

<html>
  <head>
    <meta charset="UTF-8">
    <title>Shader Chooser</title>
    
    <style>
      #formContent
      {
        width  : 500px;
      }
      
      button
      {
        width  : 150px;
        height : 150px;
        margin : 2px;
      }
      
      #descriptionField
      {
        margin-top    : 20px;
        width         : 420px;
        min-height    : 180px;
        border        : 4px ridge orange;
        border-radius : 20px;
        padding       : 20px;
        background    : rgb(255, 255, 150);
      }
    </style>
  </head>
  
  <body>
    <form action="renderframework02.php" method="GET">
      <div id="formContent">
        <?php
          ksort ($shaderMap);
          
          $javaScriptCode = '';
          
          foreach ($shaderMap as $shaderIdentifier => $shaderData)
          {
            $shaderName        = $shaderData["name"];
            $shaderDescription = $shaderData["description"];
            $shaderIcon        = $shaderData["icon"];
            
            printf
            (
              '<button id="buttonFor%s"
                       name="fragmentshader"
                       value="%s">
                 <img src="%s" />
                 %s
               </button>
              ',
              $shaderIdentifier,
              $shaderIdentifier,
              $shaderIcon,
              $shaderName
            );
            
            $javaScriptCode = $javaScriptCode . sprintf
            (
              'document.getElementById ("buttonFor%s").addEventListener
              (
                "mouseover",
                function (event)
                {
                  descriptionField.innerHTML = "%s";
                },
                false
              );
              
              document.getElementById ("buttonFor%s").addEventListener
              (
                "mouseout",
                function (event)
                {
                  descriptionField.innerHTML = "";
                },
                false
              );
              
              ',
              $shaderIdentifier,
              $shaderDescription,
              $shaderIdentifier
            );
          }
        ?>
      </div>
      
      <div id="descriptionField">
      </div>
      
      <script>
        var descriptionField = document.getElementById ("descriptionField");
        <?php print ($javaScriptCode); ?>
      </script>
    </form>
  </body>
</html>

