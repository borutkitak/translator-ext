chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if(request.translated){
    const translation = request.translated;
    if (translation.change) {
      try {
        const inputField = document.getElementsByClassName('gLFyf gsfi')[0];
        const replaceText = inputField.value.replace(translation.original, translation.translated);
        inputField.value = replaceText;
      } catch (error) {
        console.log(error);
      }
    }
  }
});


document.body.addEventListener('dblclick', function (e) {
  const selectionText = getSelectionText();
  chrome.runtime.sendMessage({translate: selectionText});
  document.execCommand("copy");
});

function getSelectionText() {
  var text = "";
  if (window.getSelection) {
      text = window.getSelection().toString();
  } else if (document.selection && document.selection.type != "Control") {
      text = document.selection.createRange().text;
  }
  return text;
}