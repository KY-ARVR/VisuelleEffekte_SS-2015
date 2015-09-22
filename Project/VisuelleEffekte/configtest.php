<?php
  
  // 30.08.2015
  
  class ConfigurationBlockBuilder
  {
    private $configurationBlock;
    
    public function __construct ()
    {
      $this->configurationBlock = array ();
    }
  }
  
  
  
  
  interface ConfigurationBlock
  {
    public function asHTMLString ();
  }
  
  
  class      AbstractConfigurationBlock
  implements ConfigurationBlock
  {
    public function __construct ()
    {
    }
  }
  
  
  class   SpinnerConfigurationBlock
  extends AbstractConfigurationBlock
  {
    private $id;
    private $name;
    private $classString;
    private $initialValue;
    private $stepSize;
    private $labelText;
    private $hasLabel;
    
    
    public function __construct ()
    {
    }
    
    
    public function asHTMLString ()
    {
      $htmlString = null;
      
      $htmlString = sprintf
      (
        '
        <label for="%s">%s</label>
        <input type="number"
               id="%s"
               name="%s"
               value="%s"
               step="%s"
               class="%s" />
        ',
        $this->id, $this->labelText,
        $this->id, $this->name,
        $this->initialValue,
        $this->stepSize,
        $this->classString
      );
      
      return $htmlString;
    }
  }
  
?>
