/* globals $, FulcrumStyler, NPMap */

$('head').append($('<link rel="stylesheet">').attr('href', 'ui/modal/createDataset.css'));

FulcrumStyler.ui = FulcrumStyler.ui || {};
FulcrumStyler.ui.modal = FulcrumStyler.ui.modal || {};
FulcrumStyler.ui.modal.createDataset = (function() {
  var $description = $('#create-dataset-description'),
    $file = $('#create-dataset-file'),
    $name = $('#create-dataset-name');

  function setHeight() {
    var height = $(document).height() - 200;

    $('#modal-createDataset .modal-body').css({
      height: height
    });
  }

  $('#modal-createDataset').modal({
    backdrop: 'static'
  })
    .on('shown.bs.modal', function() {
      $name.focus();
    });
  $('#create-dataset-file').filestyle({
    classButton: 'btn btn-default',
    classInput: 'form-control',
    icon: false
  });
  FulcrumStyler.buildTooltips();
  setHeight();
  $(window).resize(setHeight);
  $name.focus();

  return {};
})();
