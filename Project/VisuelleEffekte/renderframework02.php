<?php
  
  /*
  $fogStructureModuleFile       = "shaders/fogStructureModule.glsl";
  $lightStructureModuleFile     = "shaders/lightStructureModule.glsl";
  $texturingStructureModuleFile = "shaders/texturingStructureModule.glsl";
  $gammaStructureModuleFile     = "shaders/gammaCorrectionStructureModule.glsl";
  $fresnelStructureModuleFile   = "shaders/fresnelStructureModule.glsl";
  
  $globalVariablesFile          = "shaders/globalVariablesModule.glsl";
  */
  
  function createSpecularMaterialBlock ()
  {
    return sprintf
    (
      '
       <h2>Specular component parameters</h2>
       <div>
         %s
       </div>
       <div>
         %s
       </div>
       <div>
         %s
       </div>
       <div style="display : none;">
         %s
       </div>
       <div>
         %s
       </div>
       <div>
         %s
       </div>
      ',
      createSpecularMaterialsCheckboxes (),
      createNumberField ("specularComponentShininess",
                         "specularComponentShininess",
                         64.000,
                          0.010,
                         "materialElement smallNumberField specularConfigurationElement",
                         "Shininess:",
                         "leftColumnLabel"),
      createColorChooser ("specularComponentAmbientColor",
                          "Ambient color:",
                          "materialElement specularConfigurationElement",
                          "leftColumnLabel"),
      createColorChooser ("specularComponentDiffuseColor",
                          "Diffuse color:",
                          "materialElement specularConfigurationElement",
                          "leftColumnLabel"),
      createColorChooser ("specularComponentEmissiveColor",
                          "Emissive color:",
                          "materialElement specularConfigurationElement",
                          "leftColumnLabel"),
      createColorChooser ("specularComponentSpecularColor",
                          "Specular color:",
                          "materialElement specularConfigurationElement",
                          "leftColumnLabel")
    );
  }
  
  function createFresnelBlock ()
  {
    return sprintf
    (
      '
       <h2>Fresnel parameters</h2>
       <div>
         <input type="checkbox"
                id="fresnelEnabled" name="fresnelEnabled"
                class="materialElement"
                value="1" />
         <label for="fresnelEnabled" class="leftColumnLabel">Fresnel effect</label>
       </div>
       <div>
         %s
       </div>
       <div>
         %s
       </div>
       <div>
         %s
       </div>
       <div>
         %s
       </div>
      ',
      createNumberField ("fresnelBias",
                         "fresnelBias",
                         0.000,
                         0.010,
                         "materialElement smallNumberField fresnelConfigurationElement",
                         "Bias:",
                         "leftColumnLabel"),
      createNumberField ("fresnelScale",
                         "fresnelScale",
                         1.000,
                         0.010,
                         "materialElement smallNumberField fresnelConfigurationElement",
                         "Scale:",
                         "leftColumnLabel"),
      createNumberField ("fresnelPower",
                         "fresnelPower",
                         1.000,
                         0.010,
                         "materialElement smallNumberField fresnelConfigurationElement",
                         "Power:",
                         "leftColumnLabel"),
      createColorChooser ("fresnelColor",
                          "Color:",
                          "materialElement fresnelConfigurationElement",
                          "leftColumnLabel")
    );
  }
  
  function createNumberField
  (
    $id,
    $name,
    $initialValue,
    $stepSize,
    $classString,
    $labelText,
    $labelCSSClassString = ""
  )
  {
    $htmlString = null;
    
    $htmlString = sprintf
    (
      '
      <label for="%s" class="%s">%s</label>
      <input type="number"
             id="%s"
             name="%s"
             value="%s"
             step="%s"
             class="%s" />
      ',
      $id, $labelCSSClassString, $labelText,
      $id, $name,
      $initialValue,
      $stepSize,
      $classString
    );
    
    return $htmlString;
  }
  
  function createColorChooser
  (
    $id,
    $labelText,
    $cssClassString      = "",
    $labelCSSClassString = ""
  )
  {
    $htmlString = null;
    
    $htmlString = sprintf
    (
      '
        <label for="%s" class="%s">%s</label>
        <input type="text" id="%s" class="color %s" />
      ',
      $id, $labelCSSClassString, $labelText,
      $id, $cssClassString
    );
    
    return $htmlString;
  }
  
  // dataTable: array of arrays, each inner array with [id, value, label]
  function createRadiobuttons
  (
    $dataTable,
    $inputName,
    $inputClassString,
    $layoutInRows = false
  )
  {
    $htmlString = '';
    
    foreach ($dataTable as $dataEntry)
    {
      $entryAsString = sprintf ('
        <input type="radio"
               id="%s"
               name="%s"
               value="%s"
               class="%s"
        />
        <label for="%s">%s</label>
        ',
        $dataEntry["id"],
        $inputName,
        $dataEntry["value"],
        $inputClassString,
        $dataEntry["id"],
        $dataEntry["label"]
      );
      
      if ($layoutInRows)
      {
        $entryAsString = '<div>' . $entryAsString . '</div>';
      }
      
      $htmlString = $htmlString . $entryAsString;
    }
    
    return $htmlString;
  }
  
  function createGoochColorBlendingEquationRadiobuttons ()
  {
    $htmlString = null;
    $dataTable  = null;
    
    $dataTable  = array
    (
      array
      (
        "id"    => "goochColorBlendingEquationGooch",
        "value" => "0",
        "label" => "Gooch"
      ),
      array
      (
        "id"    => "goochColorBlendingEquationMix",
        "value" => "1",
        "label" => "Mix"
      )
    );
    $htmlString = createRadiobuttons
    (
      $dataTable,
      "goochColorBlendingEquation",
      "materialElement goochElement"
    );
    
    return $htmlString;
  }
  
  function createGoochAmbientTermFormulaRadiobuttons ()
  {
    $htmlString = null;
    $dataTable  = null;
    
    $dataTable  = array
    (
      array
      (
        "id"    => "goochAmbientTermFormulaSpecular",
        "value" => "0",
        "label" => "From specular component"
      ),
      array
      (
        "id"    => "goochAmbientTermFormulaCoolAndWarmColor",
        "value" => "1",
        "label" => "From raw cool and warm colors"
      ),
      array
      (
        "id"    => "goochAmbientTermFormulaCoolAndWarmMixedComponent",
        "value" => "2",
        "label" => "From mixed cool and warm color components"
      )
    );
    $htmlString = createRadiobuttons
    (
      $dataTable,
      "goochAmbientTermFormula",
      "materialElement goochElement",
      true
    );
    
    return $htmlString;
  }
  
  function createSpecularMaterialsCheckboxes ()
  {
    $htmlString        = null;
    $specularMaterials = null;
    
    $htmlString        = '';
    $specularMaterials = array
    (
      array
      (
        "id"    => "specularMaterialTypeNone",
        "value" => -1,
        "label" => "None"
      ),
      array
      (
        "id"    => "specularMaterialTypePhong",
        "value" => 0,
        "label" => "Phong"
      ),
      array
      (
        "id"    => "specularMaterialTypeBlinnPhong",
        "value" => 1,
        "label" => "Blinn-Phong"
      ),
      array
      (
        "id"    => "specularMaterialTypeSchlick",
        "value" => 2,
        "label" => "Schlick"
      ),
      array
      (
        "id"    => "specularMaterialTypeGauss",
        "value" => 3,
        "label" => "Gauss"
      )
    );
    
    foreach ($specularMaterials as $specularMaterial)
    {
      $htmlString = $htmlString . sprintf ('
        <input type="radio"
               id="%s"
               name="specularMaterialType"
               value="%s"
               class="materialElement specularMaterialType"
        />
        <label for="%s">%s</label>
        ',
        $specularMaterial["id"],
        $specularMaterial["value"],
        $specularMaterial["id"],
        $specularMaterial["label"]
      );
    }
    
    return $htmlString;
  }
  
  function createGammaCorrectionCheckbox ()
  {
    $htmlString = null;
    
    $htmlString = '
      <h2>Gamma correction</h2>
      <input type="checkbox"
             id="gammaCorrection"
             name="gammaCorrection"
             value="1"
             class="materialElement"
      />
      <label for="gammaCorrection">Gamma correction</label>
    ';
    
    return $htmlString;
  }
  
  function createTexturingBlock ()
  {
    $htmlString = null;
    
    $htmlString = '
      <h2>Texturing</h2>
      <div>
        <input type="file"
               id="textureFileInput"
               name="textureFileInput"
               class="materialElement"
               />
      </div>
      <div>
        <input type="checkbox"
               id="textureEnabled"
               name="textureEnabled"
               value="1"
               class="materialElement"
               />
        <label for="textureEnabled"
               class="materialElement">Enable texturing</label>
      </div>
      <div>
        <h3>Mode</h3>
        <input type="radio"
               id="textureModeReplace"
               name="textureMode"
               value="replace"
               class="materialElement" />
        <label for="textureModeReplace"
               class="materialElement">Replace</label>
        
        <input type="radio"
               id="textureModeBlend"
               name="textureMode"
               value="blend"
               class="materialElement" />
        <label for="textureModeBlend"
               class="materialElement">Blend</label>
        
        <input type="radio"
               id="textureModeAdd"
               name="textureMode"
               value="blend"
               class="materialElement" />
        <label for="textureModeAdd"
               class="materialElement">Add</label>
      </div>
    ';
    
    return $htmlString;
  }
  
  function createTransparencyBlock ()
  {
    $htmlString = null;
    
    $htmlString = '
      <h2>Transparency</h2>
      <span>0.0</span>
      <input type="range" id="transparencySlider"
                 min="0.0" max="1.0" step="0.01"
                 class="materialElement" />
      <span>1.0</span>
    ';
    
    return $htmlString;
  }
  
  function createCookTorranceDistributionFunctionsBlock ()
  {
    $htmlString        = null;
    $distribFunctions = null;
    
    $htmlString        = '';
    $distribFunctions = array
    (
      array
      (
        "id"    => "cookTorranceDistributionFunctionBeckmannOriginal",
        "value" => 0,
        "label" => "Beckmann (original)"
      ),
      array
      (
        "id"    => "cookTorranceDistributionFunctionBeckmannVector",
        "value" => 1,
        "label" => "Beckmann (vector form)"
      ),
      array
      (
        "id"    => "cookTorranceDistributionFunctionBlinn",
        "value" => 2,
        "label" => "Blinn (Gaussian)"
      ),
      array
      (
        "id"    => "cookTorranceDistributionFunctionTorranceSparrow",
        "value" => 3,
        "label" => "Torrance-Sparrow"
      ),
      array
      (
        "id"    => "cookTorranceDistributionFunctionTrowbridgeReitz",
        "value" => 4,
        "label" => "Trowbridge-Reitz"
      )
    );
    
    foreach ($distribFunctions as $distribFunction)
    {
      $htmlString = $htmlString . sprintf ('
        <input type="radio"
               id="%s"
               name="cookTorranceDistributionFunction"
               value="%s"
               class="materialElement cookTorranceElement"
        />
        <label for="%s">%s</label>
        <br />
        ',
        $distribFunction["id"],
        $distribFunction["value"],
        $distribFunction["id"],
        $distribFunction["label"]
      );
    }
    
    return $htmlString;
  }
  
  function createCookTorranceFresnelFunctionsBlock ()
  {
    $htmlString        = null;
    $distribFunctions = null;
    
    $htmlString        = '';
    $distribFunctions = array
    (
      array
      (
        "id"    => "cookTorranceFresnelFunctionNormalLight",
        "value" => 0,
        "label" => "Normal &sdot; Light"
      ),
      array
      (
        "id"    => "cookTorranceFresnelFunctionNormalView",
        "value" => 1,
        "label" => "Normal &sdot; View"
      ),
      array
      (
        "id"    => "cookTorranceFresnelFunctionHalfvectorLight",
        "value" => 2,
        "label" => "HalfVector &sdot; Light"
      ),
      array
      (
        "id"    => "cookTorranceFresnelFunctionHalfvectorView",
        "value" => 3,
        "label" => "HalfVector &sdot; View"
      )
    );
    
    foreach ($distribFunctions as $distribFunction)
    {
      $htmlString = $htmlString . sprintf ('
        <input type="radio"
               id="%s"
               name="cookTorranceFresnelFunction"
               value="%s"
               class="materialElement cookTorranceElement"
        />
        <label for="%s">%s</label>
        <br />
        ',
        $distribFunction["id"],
        $distribFunction["value"],
        $distribFunction["id"],
        $distribFunction["label"]
      );
    }
    
    return $htmlString;
  }
  
  
  
  $vertexShaderFileName     = null;
  $fragmentShaderFileName   = null;
  $vertexShaderSourceCode   = null;
  $fragmentShaderSourceCode = null;
  // Query string parameter containing the desired fragment shader name.
  $requestedFragmentShader  = null;
  // Maps query string identifier to fragment shader file name.
  $fragmentShaderNameMap    = null;
  
  $fragmentShaderNameMap = array
  (
    "strauss"          => "strauss001.frag",
    "wardAnisotropic"  => "wardAnisotropic001.frag",
    "ashikhminShirley" => "ash001.frag",
    "lommelSeeliger"   => "lommelSeeliger001.frag",
    "orenNayar"        => "orenNayar001.frag",
    "minnaert"         => "minnaert001.frag",
    "lambert"          => "lambert001.frag",
    "cookTorrance"     => "cookTorrance001.frag",
    "gooch"            => "gooch001.frag"
  );
  
  ksort ($fragmentShaderNameMap);
  
  if (isset ($_GET["fragmentshader"]))
  {
    $requestedFragmentShader = $_GET["fragmentshader"];
  }
  
  if ($requestedFragmentShader != null)
  {
    $fragmentShaderFileName = $fragmentShaderNameMap[$requestedFragmentShader];
  }
  
  if ($fragmentShaderFileName == null)
  {
    $fragmentShaderFileName = $fragmentShaderNameMap["blinnphong"];
  }
  
  $blinnPhongMultilightTextureVertFile   = "blinn-phong-multilight-texture-vertex.vert";
  $vertexShaderFileName    = $blinnPhongMultilightTextureVertFile;
  $vertexShaderSourceCode   = file_get_contents ("shaders/" . $vertexShaderFileName);
  $fragmentShaderSourceCode = file_get_contents ("shaders/" . $fragmentShaderFileName);
  
  
  $widgetMap = array
  (
    "ashikhminShirley" => sprintf ('
        <div id="ashikhminShirleyConfigBlock">
          <div class="shaderConfigPanelSection ashikhminShirleyElement">
            <h2>Ashikhmin-Shirley parameters</h2>
            <h3>Exponential factors</h3>
            <label for="ashikhminShirleyExponentialFactorX">X:</label>
            <input type="number"
                   id="ashikhminShirleyExponentialFactorX"
                   name="ashikhminShirleyExponentialFactorX"
                   value="0"
                   step="0.01"
                   class="materialElement ashikhminShirleyElement smallNumberField" />
            <label for="ashikhminShirleyExponentialFactorY">Y:</label>
            <input type="number"
                   id="ashikhminShirleyExponentialFactorY"
                   name="ashikhminShirleyExponentialFactorY"
                   value="0"
                   step="0.01"
                   class="materialElement ashikhminShirleyElement smallNumberField" />
            
            <h3>Reference axis</h3>
            <label for="ashikhminShirleyReferenceAxisX">X:</label>
            <input type="number"
                   id="ashikhminShirleyReferenceAxisX"
                   name="ashikhminShirleyReferenceAxisX"
                   value="50"
                   step="0.01"
                   class="materialElement ashikhminShirleyElement smallNumberField" />
            <label for="ashikhminShirleyReferenceAxisY">Y:</label>
            <input type="number"
                   id="ashikhminShirleyReferenceAxisY"
                   name="ashikhminShirleyReferenceAxisY"
                   value="20"
                   step="0.01"
                   class="materialElement ashikhminShirleyElement smallNumberField" />
            <label for="ashikhminShirleyReferenceAxisZ">Z:</label>
            <input type="number"
                   id="ashikhminShirleyReferenceAxisZ"
                   name="ashikhminShirleyReferenceAxisZ"
                   value="100"
                   step="0.01"
                   class="materialElement ashikhminShirleyElement smallNumberField" />
          
            <h3>Coloring</h3>
             <div>
               %s
             </div>
             <div>
               %s
             </div>
          </div>
          
          <div class="shaderConfigPanelSection">
            %s
          </div>
          <div class="shaderConfigPanelSection">
            %s
          </div>
          <div class="shaderConfigPanelSection">
            %s
          </div>
        </div>
      ',
      createColorChooser ("ashikhminShirleyDiffuseColor",
                          "Diffuse color:",
                          "materialElement",
                          "leftColumnLabel"),
      createColorChooser ("ashikhminShirleySpecularColor",
                          "Specular color:",
                          "materialElement",
                          "leftColumnLabel"),
      createTexturingBlock    (),
      createTransparencyBlock (),
      createFresnelBlock      ()
    ),
    
    "wardAnisotropic" => sprintf ('
        <div id="wardAnisotropicConfigBlock">
          <div class="shaderConfigPanelSection wardAnisotropicElement">
            <h2>Ward parameters</h2>
            <h3>Roughness factors</h3>
            <div>%s</div>
            <div>%s</div>
            
            <h3>Direction</h3>
            <label for="wardDirectionWrapper"
                   class="leftColumnLabel wideLabel">X, Y, Z:</label>
            <span id="wardDirectionWrapper">
              <input type="number"
                     id="wardDirectionX"
                     name="wardDirectionX"
                     value="50"
                     step="0.01"
                     class="materialElement wardAnisotropicElement smallNumberField" />
              <input type="number"
                     id="wardDirectionY"
                     name="wardDirectionY"
                     value="50"
                     step="0.01"
                     class="materialElement wardAnisotropicElement smallNumberField" />
              <input type="number"
                     id="wardDirectionZ"
                     name="wardDirectionZ"
                     value="50"
                     step="0.01"
                     class="materialElement wardAnisotropicElement smallNumberField" />
            </span>
            
            <h3>Coloring</h3>
             <div>
               %s
             </div>
             <div>
               %s
             </div>
             <div>
               %s
             </div>
             <div>
               %s
             </div>
          </div>
          
          <div class="shaderConfigPanelSection">
            %s
          </div>
          <div class="shaderConfigPanelSection">
            %s
          </div>
          <div class="shaderConfigPanelSection">
            %s
          </div>
        </div>
      ',
      createNumberField ("wardRoughnessX",
                         "wardRoughnessX",
                         0.000,
                         0.001,
                         "materialElement wardAnisotropicElement smallNumberField",
                         "Roughness X:",
                         "leftColumnLabel wideLabel"),
      createNumberField ("wardRoughnessY",
                         "wardRoughnessY",
                         0.000,
                         0.001,
                         "materialElement wardAnisotropicElement smallNumberField",
                         "Roughness Y:",
                         "leftColumnLabel wideLabel"),
      createColorChooser ("wardAmbientColor",
                          "Ambient color:",
                          "materialElement",
                          "leftColumnLabel wideLabel"),
      createColorChooser ("wardDiffuseColor",
                          "Diffuse color:",
                          "materialElement",
                          "leftColumnLabel wideLabel"),
      createColorChooser ("wardEmissiveColor",
                          "Emissive color:",
                          "materialElement",
                          "leftColumnLabel wideLabel"),
      createColorChooser ("wardSpecularColor",
                          "Specular color:",
                          "materialElement",
                          "leftColumnLabel wideLabel"),
      createTexturingBlock    (),
      createTransparencyBlock (),
      createFresnelBlock      ()
    ),
    
    /*
    "wardAnisotropic" => '
      <div id="wardAnisotropicConfigBlock">
        <!-- Direction vector configuration.                     -->
        <div style="border-bottom : 1px solid black;">
          <p>Ward Anisotropic Direction</p>
          <label for="wardAnisotropicDirectionX">X:</label>
          <input type="number"
                 id="wardAnisotropicDirectionX"
                 name="wardAnisotropicDirectionX"
                 value="0"
                 step="0.01"
                 class="materialElement wardAnisotropicElement smallNumberField" />
          <label for="wardAnisotropicDirectionY">Y:</label>
          <input type="number"
                 id="wardAnisotropicDirectionY"
                 name="wardAnisotropicDirectionY"
                 value="0"
                 step="0.01"
                 class="materialElement wardAnisotropicElement smallNumberField" />
          <label for="wardAnisotropicDirectionZ">Z:</label>
          <input type="number"
                 id="wardAnisotropicDirectionZ"
                 name="wardAnisotropicDirectionZ"
                 value="0"
                 step="0.01"
                 class="materialElement wardAnisotropicElement smallNumberField" />
        </div>
        
        <!-- Roughness parameters configuration.                 -->
        <div style="border-bottom : 1px solid black;">
          <p>Ward Anisotropic Roughnesses</p>
          <label for="wardAnisotropicRoughnessX">X:</label>
          <input type="number"
                 id="wardAnisotropicRoughnessX"
                 name="wardAnisotropicRoughnessX"
                 value="0"
                 step="0.01"
                 class="materialElement wardAnisotropicElement smallNumberField" />
          <label for="wardAnisotropicRoughnessY">Y:</label>
          <input type="number"
                 id="wardAnisotropicRoughnessY"
                 name="wardAnisotropicRoughnessY"
                 value="0"
                 step="0.01"
                 class="materialElement wardAnisotropicElement smallNumberField" />
        </div>
      </div>
    ',
    */
    
    "lommelSeeliger" => sprintf ('
                <div id="lommelSeeligerConfigBlock" class="shaderConfigPanelSection">
                  <h2>Lommel-Seeliger parameters</h2>
                   %s<br />
                   %s<br />
                   %s<br />
                   %s
                </div>
                <div class="shaderConfigPanelSection">
                  %s
                </div>
                <div class="shaderConfigPanelSection">
                  %s
                </div>
                <div class="shaderConfigPanelSection">
                  %s
                </div>
                <div class="shaderConfigPanelSection">
                  %s
                </div>
                </div>
                ',
                createNumberField ("lommelSeeligerBias",
                                   "lommelSeeligerBias",
                                   0.000,
                                   0.001,
                                   "materialElement lommelSeeligerElement smallNumberField",
                                   "Bias:",
                                   "leftColumnLabel"),
                createNumberField ("lommelSeeligerScale",
                                   "lommelSeeligerScale",
                                   1.000,
                                   0.001,
                                   "materialElement lommelSeeligerElement smallNumberField",
                                   "Scale:",
                                   "leftColumnLabel"),
                createNumberField ("lommelSeeligerExponent",
                                   "lommelSeeligerExponent",
                                   1.000,
                                   0.010,
                                   "materialElement lommelSeeligerElement smallNumberField",
                                   "Exponent:",
                                   "leftColumnLabel"),
                createColorChooser ("lommelSeeligerDiffuseColor",
                                    "Diffuse color:",
                                    "materialElement",
                                    "leftColumnLabel"),
                createTexturingBlock        (),
                createSpecularMaterialBlock (),
                createTransparencyBlock     (),
                createFresnelBlock          ()
            ),
    "orenNayar" => sprintf ('
                <div id="orenNayarConfigBlock" class="shaderConfigPanelSection">
                  <div>
                    <h2>Oren-Nayar parameters</h2>
                     %s
                     <br />
                     %s
                  </div>
                </div>
                </div>
                </div>
                <div class="shaderConfigPanelSection">
                  %s
                </div>
                <div class="shaderConfigPanelSection">
                  %s
                </div>
                <div class="shaderConfigPanelSection">
                  %s
                </div>
                <div class="shaderConfigPanelSection">
                  %s
                </div>
                ',
                createNumberField ("orenNayarRoughness",
                                   "orenNayarRoughness",
                                   0.000,
                                   0.001,
                                   "materialElement orenNayarElement smallNumberField",
                                   "Roughness:",
                                   "leftColumnLabel"),
                createColorChooser ("orenNayarDiffuseColor",
                                    "Diffuse color:",
                                    "materialElement",
                                    "leftColumnLabel"),
                createTexturingBlock        (),
                createSpecularMaterialBlock (),
                createTransparencyBlock     (),
                createFresnelBlock          ()
              ),
    "minnaert" => sprintf ('
                <div id="minnaertConfigBlock" class="shaderConfigPanelSection">
                  <h2>Minnaert parameters</h2>
                   %s
                   <br />
                   %s
                </div>
                <div class="shaderConfigPanelSection">
                  %s
                </div>
                <div class="shaderConfigPanelSection">
                  %s
                </div>
                <div class="shaderConfigPanelSection">
                  %s
                </div>
                <div class="shaderConfigPanelSection">
                  %s
                </div>
                ',
                createNumberField ("minnaertRoughness",
                                   "minnaertRoughness",
                                   0.000,
                                   0.001,
                                   "materialElement minnaertElement smallNumberField",
                                   "Roughness:",
                                   "leftColumnLabel"),
                createColorChooser ("minnaertDiffuseColor",
                                    "Diffuse color:",
                                    "materialElement",
                                    "leftColumnLabel"),
                createTexturingBlock        (),
                createSpecularMaterialBlock (),
                createTransparencyBlock     (),
                createFresnelBlock          ()
              ),
    "lambert" => sprintf ('
                <div id="lambertConfigBlock" class="shaderConfigPanelSection">
                  <h2>Lambert parameters</h2>
                   %s
                </div>
                <div class="shaderConfigPanelSection">
                  %s
                </div>
                <div class="shaderConfigPanelSection">
                  %s
                </div>
                <div class="shaderConfigPanelSection">
                  %s
                </div>
                <div class="shaderConfigPanelSection">
                  %s
                </div>
                ',
                createColorChooser ("lambertDiffuseColor",
                                    "Diffuse color:",
                                    "materialElement",
                                    "leftColumnLabel"),
                createTexturingBlock        (),
                createSpecularMaterialBlock (),
                createTransparencyBlock     (),
                createFresnelBlock          ()
            ),
    
    "cookTorrance" => sprintf ('
                <div id="cookTorranceConfigBlock" class="shaderConfigPanelSection">
                  <h2>Cook-Torrance parameters</h2>
                   <h3>Roughness and function parameters</h3>
                   <div>%s</div>
                   <div>%s</div>
                   <div>%s</div>
                   <div>%s</div>
                   <h3>Distribution function</h3>
                   <div>%s</div>
                   <h3>Fresnel function</h3>
                   <div>%s</div>
                   <h3>Colors</h3>
                   <div>%s</div>
                   <div>%s</div>
                   <div>%s</div>
                </div>
                <div class="shaderConfigPanelSection">
                  %s
                </div>
                <div class="shaderConfigPanelSection">
                  %s
                </div>
                <div class="shaderConfigPanelSection">
                  %s
                </div>
                ',
                createNumberField ("cookTorranceRoughness",
                                   "cookTorranceRoughness",
                                   0.000,
                                   0.001,
                                   "materialElement cookTorranceElement smallNumberField",
                                   "Roughness:",
                                   "leftColumnLabel wideLabel"),
                createNumberField ("cookTorranceDistributionParameter",
                                   "cookTorranceDistributionParameter",
                                   1.000,
                                   0.001,
                                   "materialElement cookTorranceElement smallNumberField",
                                   "Distribution param.:",
                                   "leftColumnLabel wideLabel"),
                createNumberField ("cookTorranceReflectionCoefficient",
                                   "cookTorranceReflectionCoefficient",
                                   1.000,
                                   0.010,
                                   "materialElement cookTorranceElement smallNumberField",
                                   "Fresnel coefficient:",
                                   "leftColumnLabel wideLabel"),
                createNumberField ("cookTorranceSpecularTermScale",
                                   "cookTorranceSpecularTermScale",
                                   1.000,
                                   0.010,
                                   "materialElement cookTorranceElement smallNumberField",
                                   "Specular scale:",
                                   "leftColumnLabel wideLabel"),
                createCookTorranceDistributionFunctionsBlock (),
                createCookTorranceFresnelFunctionsBlock      (),
                createColorChooser ("cookTorranceDiffuseColor",
                                    "Diffuse color:",
                                    "materialElement",
                                    "leftColumnLabel"),
                createColorChooser ("cookTorranceEmissiveColor",
                                    "Emissive color:",
                                    "materialElement",
                                    "leftColumnLabel"),
                createColorChooser ("cookTorranceSpecularColor",
                                    "Specular color:",
                                    "materialElement",
                                    "leftColumnLabel"),
                createTexturingBlock        (),
                createTransparencyBlock     (),
                createFresnelBlock          ()
            ),
    
    "gooch" => sprintf ('
                <div id="goochConfigBlock" class="shaderConfigPanelSection">
                  <h2>Gooch parameters</h2>
                   <h3>Colors</h3>
                   <div>%s</div>
                   <div>%s</div>
                   <div>%s</div>
                   <h3>Mixing</h3>
                   <div>%s</div>
                   <div>%s</div>
                   <h3>Color blending equation</h3>
                   <div>%s</div>
                   <h3>Ambient term formula</h3>
                   <div>%s</div>
                </div>
                <div class="shaderConfigPanelSection">
                  %s
                </div>
                <div class="shaderConfigPanelSection">
                  %s
                </div>
                <div class="shaderConfigPanelSection">
                  %s
                </div>
                <div class="shaderConfigPanelSection">
                  %s
                </div>
                ',
                createColorChooser ("goochSurfaceColor",
                                    "Surface color:",
                                    "materialElement",
                                    "leftColumnLabel"),
                createColorChooser ("goochCoolColor",
                                    "Cool color:",
                                    "materialElement",
                                    "leftColumnLabel"),
                createColorChooser ("goochWarmColor",
                                    "Warm color:",
                                    "materialElement",
                                    "leftColumnLabel"),
                createNumberField ("goochCoolMixValue",
                                   "goochCoolMixValue",
                                   1.000,
                                   0.001,
                                   "materialElement goochElement smallNumberField",
                                   "Cool mix value:",
                                   "leftColumnLabel"),
                createNumberField ("goochWarmMixValue",
                                   "goochWarmMixValue",
                                   1.000,
                                   0.001,
                                   "materialElement goochElement smallNumberField",
                                   "Warm mix value:",
                                   "leftColumnLabel"),
                createGoochColorBlendingEquationRadiobuttons (),
                createGoochAmbientTermFormulaRadiobuttons    (),
                createTexturingBlock        (),
                createSpecularMaterialBlock (),
                createTransparencyBlock     (),
                createFresnelBlock          ()
            ),
    
    "strauss" => sprintf ('
                <div id="straussConfigBlock" class="shaderConfigPanelSection">
                  <h2>Strauss parameters</h2>
                   <h3>Default parameters</h3>
                   <div>%s</div>
                   <div>%s</div>
                   <div>%s</div>
                   <div>%s</div>
                   <h3>Extended parameters</h3>
                   <div>%s</div>
                   <div>%s</div>
                   <div>%s</div>
                   <div>%s</div>
                </div>
                <div class="shaderConfigPanelSection">
                  %s
                </div>
                <div class="shaderConfigPanelSection">
                  %s
                </div>
                <div class="shaderConfigPanelSection">
                  %s
                </div>
                ',
                createColorChooser ("straussSurfaceColor",
                                    "Surface color:",
                                    "materialElement straussElement",
                                    "leftColumnLabel wideLabel"),
                createNumberField ("straussMetalness",
                                   "straussMetalness",
                                   0.000,
                                   0.001,
                                   "materialElement straussElement smallNumberField",
                                   "Metalness:",
                                   "leftColumnLabel wideLabel"),
                createNumberField ("straussSmoothness",
                                   "straussSmoothness",
                                   0.000,
                                   0.001,
                                   "materialElement straussElement smallNumberField",
                                   "Smoothness:",
                                   "leftColumnLabel wideLabel"),
                createNumberField ("straussTransparency",
                                   "straussTransparency",
                                   0.000,
                                   0.001,
                                   "materialElement straussElement smallNumberField",
                                   "Transparency:",
                                   "leftColumnLabel wideLabel"),
                createColorChooser ("straussHighlightBaseColor",
                                    "Highlight base color:",
                                    "materialElement straussElement",
                                    "leftColumnLabel wideLabel"),
                createNumberField ("straussFresnelConstant",
                                   "straussFresnelConstant",
                                   0.000,
                                   0.001,
                                   "materialElement straussElement smallNumberField",
                                   "Fresnel constant:",
                                   "leftColumnLabel wideLabel"),
                createNumberField ("straussShadowConstant",
                                   "straussShadowConstant",
                                   0.000,
                                   0.001,
                                   "materialElement straussElement smallNumberField",
                                   "Shadow constant:",
                                   "leftColumnLabel wideLabel"),
                createNumberField ("straussOffSpecularPeak",
                                   "straussOffSpecularPeak",
                                   0.000,
                                   0.001,
                                   "materialElement straussElement smallNumberField",
                                   "Off-specular peak:",
                                   "leftColumnLabel wideLabel"),
                createTexturingBlock        (),
                createTransparencyBlock     (),
                createFresnelBlock          ()
              )
  );
  
  
?>


<!DOCTYPE html>

<html>
  <head>
    <meta charset="UTF-8">
    
    <title>WebGL Renderer Framework - <?php print ($fragmentShaderFileName); ?></title>
    
    <script type="application/javascript"
            src="fields.js">
    </script>
    <script type="application/javascript"
            src="OBJLoader.js">
    </script>
    <script type="text/javascript"
            src="jscolor/jscolor.js">
    </script>
    <script type="application/javascript"
            src="point3d.js">
    </script>
    <script type="application/javascript"
            src="bounds.js">
    </script>
    <script type="application/javascript"
            src="geometry.js">
    </script>
    <script type="application/javascript"
            src="attributevariable.js">
    </script>
    <script type="application/javascript"
            src="shader.js">
    </script>
    <script type="application/javascript"
            src="appearance.js">
    </script>
    <script type="application/javascript"
            src="shape3d.js">
    </script>
    <script type="application/javascript"
            src="uniformvariable.js">
    </script>
    <script type="application/javascript"
            src="behavior.js">
    </script>
    <script type="application/javascript"
            src="pointcreator.js">
    </script>
    <script type="application/javascript"
            src="sphere.js">
    </script>
    <script type="application/javascript"
            src="clockmodel.js">
    </script>
    <script type="application/javascript"
            src="modelloader.js">
    </script>
    <script type="application/javascript"
            src="modelloaddialog.js">
    </script>
    <script type="application/javascript"
            src="abstractnode.js">
    </script>
    <script type="application/javascript"
            src="light.js">
    </script>
    <script type="application/javascript"
            src="fog.js">
    </script>
    <script type="application/javascript"
            src="mainlogic.js">
    </script>
    <script type="application/javascript"
            src="interactor.js">
    </script>
    
    <link rel="stylesheet"
          type="text/css"
          href="resources/defaultstylesheet.css"
    />
    
    
    <script id="vertex-shader"
            type="x-shader/x-vertex"
            name="<?php printf ("%s", $vertexShaderFileName); ?>">
      <?php
        printf ("%s", $vertexShaderSourceCode);
      ?>
    </script>
    
    <script id="fragment-shader"
            type="x-shader/x-fragment"
            name="<?php printf ("%s", $fragmentShaderFileName); ?>">
      <?php
        printf ("%s", $fragmentShaderSourceCode);
      ?>
    </script>
    
  </head>
  
  <body>
    <!-- Light properties. ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ -->
    <div class="toolbar">
      
      
      <div class="toolbarSection">
        <button id="loadModelButton"
                class="toolbarButton"
                title="Load an OBJ file."></button>
      </div>
      
      <div class="toolbarSection">
        <button id="addSphereButton"
                class="toolbarButton"
                title="Add a sphere."></button>
        <button id="addCuboidButton"
                class="toolbarButton"
                title="Add a cuboid."></button>
      </div>
      
      <div class="toolbarSection">
        <a href="shaderchooser.php">To Shader Chooser</a>
      </div>
    </div>
    
    <!-- Material properties. ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ -->
    <div class="toolbar" style="display : none;">
      <div class="toolbarSection">
        <label for="ambientMaterialColorChooser">Ambient material color</label>
        <input type="text"  id="ambientMaterialColorChooser" class="color materialElement" />
      </div>
      <div class="toolbarSection">
        <label for="diffuseMaterialColorChooser">Diffuse material color</label>
        <input type="text"  id="diffuseMaterialColorChooser" class="color materialElement" />
      </div>
      <div class="toolbarSection">
        <label for="emissiveMaterialColorChooser">Emissive material color</label>
        <input type="text"  id="emissiveMaterialColorChooser" class="color materialElement" />
      </div>
      <div class="toolbarSection">
        <label for="specularMaterialColorChooser">Specular material color</label>
        <input type="text"  id="specularMaterialColorChooser" class="color materialElement" />
      </div>
      <div class="toolbarSection">
        <label for="materialShininessSlider">Material shininess [0..128]</label>
        <input type="range" id="materialShininessSlider"
               min="0.0" max="128.0" step="1.0"
               class="materialElement" />
      </div>
      
      <div class="toolbarSection" style="display : none;">
        <label for="materialRoughnessSpinner">Roughness (&ge; 0.0)</label>
        <input type="number" id="materialRoughnessSpinner" step="0.01"
               class="materialElement" />
      </div>
      
      
      <div class="toolbarSection">
        <label for="straussMetalness">Metalness [0..1])</label>
        <input type="number" id="straussMetalnessSpinner" step="0.01"
               class="materialElement straussParameter" />
      </div>
      
      <div class="toolbarSection">
        <label for="straussSmoothness">Smoothness [0..1]</label>
        <input type="number" id="straussSmoothnessSpinner" step="0.01"
               class="materialElement straussParameter" />
      </div>
      
      <div class="toolbarSection">
        <label for="showUniformVariablesButton">Uniform vars</label>
        <button id="showUniformVariablesButton">Save</button>
      </div>
    </div>
    
    <canvas id="glcanvas" width="650" height="650">
      Your browser doesn't appear to support the canvas element.
    </canvas>
    
    <div class="rightColumn">
      <div id="sceneGraphListWrapper" class="shaderConfigPanelSection">
        <!-- List box with multiple selection:
         |   "http://stackoverflow.com/questions/9619776/how-to-create-a-listbox-in-html-without-allowing-multiple-selection"
         -->
        <h2>Scene Content</h2>
        <div class="sceneContentPanel">
          <div class="leftPanelPart">
            <select id="sceneGraphSelectMenu" name="sceneGraphSelectMenu" size="5" multiple="multiple">
              <option value="">-</option>
              <option value="*">all</option>
            </select>
          </div>
          
          <div class="rightPanelPart">
            <button id="removeShape">Remove selected</button>
          </div>
        </div>
      </div>
      
      <div class="shaderConfigPanelSection">
        <h2>Model Transformation</h2>
        <h3>Translation</h3>
        <?php
          print (createNumberField ("modelTranslationX", "modelTranslationX", 0.0, 0.1, "materialElement smallNumberField", "X:"));
          print (createNumberField ("modelTranslationY", "modelTranslationY", 0.0, 0.1, "materialElement smallNumberField", "Y:"));
          print (createNumberField ("modelTranslationZ", "modelTranslationZ", 0.0, 0.1, "materialElement smallNumberField", "Z:"));
        ?>
        
        <h3>Scaling</h3>
        <?php
          print (createNumberField ("modelScalingX", "modelScalingX", 0.0, 0.1, "materialElement smallNumberField", "X:"));
          print (createNumberField ("modelScalingY", "modelScalingY", 0.0, 0.1, "materialElement smallNumberField", "Y:"));
          print (createNumberField ("modelScalingZ", "modelScalingZ", 0.0, 0.1, "materialElement smallNumberField", "Z:"));
        ?>
      </div>
      
      <div id="shaderConfigPanelWrapper">
        <div id="shaderConfigPanelContent">
          
          <?php
            print ($widgetMap[$_GET["fragmentshader"]]);
            print ('<div class="shaderConfigPanelSection">');
            print (createGammaCorrectionCheckbox ());
            print ('</div>');
          ?>
          
        </div>
      </div>
    </div>
    
    <div class="rightColumn">
      <div class="shaderConfigPanelSection">
        <h2>Light parameters</h2>
        <div>
          <label for="lightIndexSelectMenu" class="leftColumnLabel wideLabel">
            Light to modify
          </label>
          <select id="lightIndexSelectMenu" name="lightIndexSelectMenu">
            <option value="0">Light #0 (point light)</option>
            <option value="1">Light #1 (directional)</option>
            <option value="2">Light #2 (point light)</option>
          </select>
        </div>
        <div>
          <label for="lightEnabledCheckbox" class="leftColumnLabel wideLabel">Enable</label>
          <input type="checkbox"  id="lightEnabledCheckbox" />
        </div>
        <div>
          <label for="lightPositionInputWrapper"
                 class="leftColumnLabel wideLabel">Position</label>
          <span id="lightPositionInputWrapper">
            <input type="number" id="lightPositionXInput" value="0.0"
                   step="0.01"
                   class="smallNumberField" />
            <input type="number" id="lightPositionYInput" value="0.0"
                   step="0.01"
                   class="smallNumberField" />
            <input type="number" id="lightPositionZInput" value="0.0"
                   step="0.01"
                   class="smallNumberField" />
          </span>
        </div>
        
        <div>
          <label for="lightAttenuationInputWrapper"
                 class="leftColumnLabel wideLabel">Attenuation</label>
          <span id="lightAttenuationInputWrapper">
            <input type="number"
                   id="lightAttenuationConstant"
                   value="0.0"
                   step="0.01"
                   class="smallNumberField" />
            <input type="number"
                   id="lightAttenuationLinear"
                   value="0.0"
                   step="0.01"
                   class="smallNumberField" />
            <input type="number"
                   id="lightAttenuationQuadratic"
                   value="0.0"
                   step="0.01"
                   class="smallNumberField" />
          </span>
        </div>
        
        <div>
          <label for="ambientLightColorChooser" class="leftColumnLabel wideLabel">Ambient light color</label>
          <input type="text"  id="ambientLightColorChooser" class="color" />
        </div>
        <div>
          <label for="diffuseLightColorChooser" class="leftColumnLabel wideLabel">Diffuse light color</label>
          <input type="text"  id="diffuseLightColorChooser" class="color" />
        </div>
        <div>
          <label for="specularLightColorChooser" class="leftColumnLabel wideLabel">Specular light color</label>
          <input type="text"  id="specularLightColorChooser"   class="color" />
        </div>
      </div>
      
      
      <div class="shaderConfigPanelSection">
        <h2>Fog parameters</h2>
        <div>
          <label for="fogEnabledCheckbox"
                 class="leftColumnLabel wideLabel">Enable</label>
          <input type="checkbox" id="fogEnabledCheckbox" value="1" />
        </div>
        <div>
          <label for="fogTypeSelectMenu"
                 class="leftColumnLabel wideLabel">Type of fog</label>
          <select id="fogTypeSelectMenu" name="fogTypeSelectMenu">
            <option value="0">Linear</option>
            <option value="1">Exponential</option>
            <option value="2">Squared Exp.</option>
          </select>
        </div>
        <div>
          <label for="fogMinimumDistance"
                 class="leftColumnLabel wideLabel">Min. fog distance</label>
          <input type="number" id="fogMinimumDistance" step="0.1" />
        </div>
        <div>
          <label for="fogMaximumDistance"
                 class="leftColumnLabel wideLabel">Max. fog distance</label>
          <input type="number" id="fogMaximumDistance" step="0.1" />
        </div>
        <div>
          <label for="fogColorChooser"
                 class="leftColumnLabel wideLabel">Fog color</label>
          <input type="text" id="fogColorChooser" class="color" />
        </div>
        <div>
          <label for="fogDensityInput"
                 class="leftColumnLabel wideLabel">Fog density</label>
          <input type="number" id="fogDensityInput"
                 min="0.0" step="0.001" />
        </div>
      </div>
    </div>
    
    
    <div id="modelLoadDialog">
      <div>
        <p style="text-align : left;">
          <label for="modelLoadDialogFileSelect"
                 style="display : inline-block; width : 110px;"
                 >Model file:</label>
          <input type="file" id="modelLoadDialogFileSelect" />
          <br /><br />
          <label for="modelLoadDialogScaleSpinner"
                 style="display : inline-block; width : 110px;"
                 >Scale factor:</label>
          <?php print (createNumberField ("modelLoadDialogScaleSpinner",
                                          "modelLoadDialogScaleSpinner",
                                          1.0, 0.001,
                                          "smallNumberField",
                                          "")); ?>
          <br /><br />
          <label for="modelLoadDialogNormalizeCheckbox"
                 style="display : inline-block; width : 110px;"
                 >Normalize:</label>
          <input type="checkbox"
                 id="modelLoadDialogNormalizeCheckbox"
                 checked="checked" />
          <br /><br />
          <label for="modelLoadDialogReverseCheckbox"
                  style="display : inline-block; width : 110px;"
                  >Rerverse normals:</label>
          <input type="checkbox"
                 id="modelLoadDialogReverseCheckbox"
                 checked="checked" />
        </p>
        <p style="margin-top : 30px;">
          <button id="modelLoadDialogOKButton">OK</button>
          <button id="modelLoadDialogCancelButton">Cancel</button>
        </p>
      </div>
    </div>
    
  </body>
  
  <!--
  <script type="application/javascript" src="vsi_006_gui.js">
  </script>
  -->
</html>
