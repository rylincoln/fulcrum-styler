/* globals $, FulcrumStyler, NPMap, urlParams.id */

$('head').append($('<link rel="stylesheet">').attr('href', 'ui/modal/export.css'));

FulcrumStyler.ui = FulcrumStyler.ui || {};
FulcrumStyler.ui.modal = FulcrumStyler.ui.modal || {};
FulcrumStyler.ui.modal.export = (function() {
  // var $cmsId = $('#cms-id'),
  var $iframeCode = $('#iframe-code');

  function setHeight() {
    $('#modal-export .tab-content').css({
      height: $(document).height() - 310
    });
  }

  // $cmsId.on('click', function() {
  //   $(this).select();
  // });
  $iframeCode.on('click', function() {
    $(this).select();
  });
  FulcrumStyler.buildTooltips();
  $cmsId.val(urlParams.id);
  $iframeCode.val('<iframe height="500px" frameBorder="0" width="100%" src="https://web.fulcrumapp.com/shares/' + urlParams.id + '"></iframe>');
  $('#modal-export-template img.template').click(function() {
    window.open('https://web.fulcrumapp.com/shares/' + this.id.replace('template-', '') + '.html?urlParams.id=' + urlParams.id, '_blank');
  });
  setHeight();
  $(window).resize(setHeight);
  $('#modal-export').modal();

  return {};
})();
