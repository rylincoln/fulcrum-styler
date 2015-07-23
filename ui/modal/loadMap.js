/* globals $, FulcrumStyler */
/* global NPMap:true */

$('head').append($('<link rel="stylesheet" type="text/css">').attr('href', 'ui/modal/loadMap.css'));

var colors = {
  'valid': '#CCFFCC',
  'error': '#FFCCCC'
},
validateJson =  function(json) {
  var newJson;
  if (json){
    try{
      newJson=JSON.parse(json);
      if (newJson && !newJson.div) {
        newJson = undefined;
      }
    }catch(e){
      newJson = undefined;
    }
  }
  return newJson;
},
setMap = function(json) {
  var validJson = validateJson(json);
  if (validJson) {
    NPMap = validJson;
    FulcrumStyler.updateMap();
  }
},
updateModal = function() {
  var validJson = validateJson($('#modal-loadMap-code').val());
  $('#modal-loadMap-code').css('background-color', validJson ? colors.valid : colors.error);
  $('#modal-loadMap-set-button').prop('disabled', !validJson);
};

FulcrumStyler.ui = FulcrumStyler.ui || {};
FulcrumStyler.ui.modal = FulcrumStyler.ui.modal || {};
FulcrumStyler.ui.modal.loadMap = (function() {

  function setHeight() {
    $('#modal-loadMap .modal-body').css({
      height: $(document).height() - 200
    });
  }

  FulcrumStyler.buildTooltips();
  setHeight();
  $(window).resize(setHeight);
  $('#modal-loadMap-code').val(JSON.stringify(NPMap,null,2));
  updateModal();

  return {};
})();


$('#modal-loadMap-code').bind('keyup paste cut','textarea',function(){
  updateModal();
});
$('#modal-loadMap-set-button').click(function() {
  setMap($('#modal-loadMap-code').val());
});

