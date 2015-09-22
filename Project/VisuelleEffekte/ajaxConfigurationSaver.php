<?php
  
  // 14.06.2015
  // -> "http://stackoverflow.com/questions/12096941/how-to-send-arrays-using-xmlhttprequest-to-server"
  // Accessing (invalid) object properties: -> "http://php.net/manual/en/function.json-decode.php" (see under "Example #2 Accessing invalid object properties")
  
  
  $jsonObject        = null;
  $uniformVariables  = null;
  $xmlDocument       = null;
  $xmlRootElement    = null;
  $writtenBytesCount = 0;
  
  $jsonObject         = file_get_contents ("php://input");
  $receivedData       = json_decode ($jsonObject);
  $fileName           = $receivedData->{'fileName'};
  $metadata           = $receivedData->{'metadata'};
  $uniformVariables   = $receivedData->{'uniformData'};
  $xmlDocument        = new DOMDocument ("1.0", "UTF-8");
  $xmlRootElement     = $xmlDocument->createElement ("ShaderConfig");
  $xmlMetadataElement = $xmlDocument->createElement ("Metadata");
  $xmlUniformElement  = $xmlDocument->createElement ("UniformVariables");
  
  $xmlDocument->formatOutput = true;
  $xmlDocument->appendChild ($xmlRootElement);
  
  // Use print_r for printing out arrays.
  //print_r ($uniformVariables->{'material.diffuseColor'});
  
  //var_dump ($uniformVariables);
  
  $xmlVertexShaderElement   = $xmlDocument->createElement ("VertexShader",   $metadata->{'vertexShaderName'});
  $xmlFragmentShaderElement = $xmlDocument->createElement ("FragmentShader", $metadata->{'fragmentShaderName'});
  
  $xmlMetadataElement->appendChild ($xmlVertexShaderElement);
  $xmlMetadataElement->appendChild ($xmlFragmentShaderElement);
  
  foreach ($uniformVariables as $variableName => $variableInfo)
  {
    //$variableValue = $variableInfo->{'value'};
    $variableValue   = $variableInfo->{'value'};
    $variableType    = $variableInfo->{'type'};
    $xmlEntryElement = $xmlDocument->createElement   ("UniformVariable");
    $xmlNameElement  = $xmlDocument->createElement   ("Name",  $variableName);
    $xmlValueElement = $xmlDocument->createElement   ("Value", variableToString ($variableValue));
    $xmlTypeElement  = $xmlDocument->createElement   ("Type",  $variableType);
    $xmlIDAttribute  = $xmlDocument->createAttribute ("id");
    
    $xmlIDAttribute->value = $variableName;
    $xmlEntryElement->appendChild ($xmlIDAttribute);
    
    $xmlEntryElement->appendChild ($xmlNameElement);
    $xmlEntryElement->appendChild ($xmlValueElement);
    $xmlEntryElement->appendChild ($xmlTypeElement);
    $xmlUniformElement->appendChild  ($xmlEntryElement);
  }
  
  $xmlRootElement->appendChild ($xmlMetadataElement);
  $xmlRootElement->appendChild ($xmlUniformElement);
  
  $writtenBytesCount = $xmlDocument->save ($fileName);
  
  if ($writtenBytesCount > 0)
  {
    print ("Shader configuration file has been saved.");
  }
  else
  {
    print ("Shader configuration file could not be saved.");
  }
  
  
  // Convert array or arbitrary value to string.
  function variableToString ($variable)
  {
    if (is_array ($variable))
    {
      return implode (",", $variable);
    }
    else
    {
      return $variable;
    }
  }
  
?>
