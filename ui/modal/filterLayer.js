/* globals $, FulcrumStyler, NPMap */

FulcrumStyler.ui = FulcrumStyler.ui || {};
FulcrumStyler.ui.modal = FulcrumStyler.ui.modal || {};
FulcrumStyler.ui.modal.filterLayer = (function() {
  function setHeight() {
    $('#modal-filterLayer .modal-body').css({
      height: $(document).height() - 200
    });
  }

  $('#modal-filterLayer').modal({
    backdrop: 'static'
  });
  FulcrumStyler.buildTooltips();
  setHeight();
  $(window).resize(setHeight);

  return {};
})();
var set = function () {
  var options = {
    'color': $('#color')[0][$('#color')[0].selectedIndex].value,
    'name': $('#icon')[0][$('#icon')[0].selectedIndex].value
  },
  regex = new RegExp('url\\((.+?)\\)'),
  layer = $('#modal-filterLayer').data('layer');

  document.getElementById('map').contentWindow.L.npmap.icon.maki(options).createIcon().style.cssText.replace(regex, function(_,url) {
    $('#DemoIcon').html('<img src="' + url + '">');
  });

  if (layer) {
    layer.icon = options;
  }
};
