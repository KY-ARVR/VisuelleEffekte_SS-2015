// 14.09.2015
// -> "http://blog.raventools.com/create-a-modal-dialog-using-css-and-javascript/"

var ModelLoadDialog = function (document)
{
  this.htmlElement     = document.getElementById ("modelLoadDialog");
  this.okButton        = document.getElementById ("modelLoadDialogOKButton");
  this.cancelButton    = document.getElementById ("modelLoadDialogCancelButton");
  this.fileSelectInput = document.getElementById ("modelLoadDialogFileSelect");
  this.scaleSpinner    = document.getElementById ("modelLoadDialogScaleSpinner");
  this.reverseCheckbox = document.getElementById ("modelLoadDialogReverseCheckbox");
  this.normalizeCheckbox = document.getElementById ("modelLoadDialogNormalizeCheckbox");
  
  this.selectedFile    = null;
  this.loaderOptions   = null;
  this.dialogListeners = [];
  
  var thisObject = this;
  
  this.okButton.addEventListener
  (
    "click",
    function ()
    {
      thisObject.setVisible (false);
      thisObject.loaderOptions =
      {
        "scaleFactor"    : thisObject.scaleSpinner.value,
        "reverseNormals" : thisObject.reverseCheckbox.checked,
        "normalize"      : thisObject.normalizeCheckbox.checked
      };
      thisObject.fireAcceptedEvent ();
    },
    false
  );
  this.cancelButton.addEventListener
  (
    "click",
    function ()
    {
      thisObject.setVisible (false);
      thisObject.selectedFile  = null;
      thisObject.loaderOptions = null;
      thisObject.fireCancelledEvent ();
    },
    false
  );
  this.fileSelectInput.addEventListener
  (
    "change",
    function ()
    {
      thisObject.selectedFile = this.value;
    },
    false
  );
};

ModelLoadDialog.prototype.setVisible = function (isVisible)
{
  if (isVisible)
  {
    this.htmlElement.style.visibility = "visible";
  }
  else
  {
    this.htmlElement.style.visibility = "hidden";
  }
};

ModelLoadDialog.prototype.addDialogListener = function (listener)
{
  if (listener != null)
  {
    this.dialogListeners.push (listener);
  }
};

ModelLoadDialog.prototype.getSelectedFile = function ()
{
  return this.selectedFile;
};

ModelLoadDialog.prototype.getLoaderOptions = function ()
{
  return this.loaderOptions;
};

ModelLoadDialog.prototype.fireAcceptedEvent = function ()
{
  var firingDialog = this;
  
  for (var listenerIndex = 0;
           listenerIndex < this.dialogListeners.length;
           listenerIndex++)
  {
    var listener = this.dialogListeners[listenerIndex];
    
    if ((listener != null) && (listener["modelLoadDialogAccepted"] != null))
    {
      listener.modelLoadDialogAccepted (firingDialog);
    }
  }
};

ModelLoadDialog.prototype.fireCancelledEvent = function ()
{
  var firingDialog = this;
  
  for (var listenerIndex = 0;
           listenerIndex < this.dialogListeners.length;
           listenerIndex++)
  {
    var listener = this.dialogListeners[listenerIndex];
    
    if ((listener != null) && (listener["modelLoadDialogCancelled"] != null))
    {
      listener.modelLoadDialogCancelled (firingDialog);
    }
  }
};
