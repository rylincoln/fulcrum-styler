/* globals $, FulcrumStyler, NPMap */

$('head').append($('<link rel="stylesheet" type="text/css">').attr('href', 'ui/modal/viewConfig.css'));

FulcrumStyler.ui = FulcrumStyler.ui || {};
FulcrumStyler.ui.modal = FulcrumStyler.ui.modal || {};
FulcrumStyler.ui.modal.viewConfig = (function() {
  var $code = $('#modal-viewConfig-code'),
    $htmlDiv = $('#modal-viewConfig-html'),
    $htmlInput = $('#modal-viewConfig-html input');

  function setConfig() {
    var formatted = 'var NPMap = ',
      html = $htmlInput.prop('checked'),
      npmapSorted = {},
      sorted = [],
      space = html ? '      ' : '',
      json, prop;

    for (prop in NPMap) {
      sorted.push(prop);
    }

    sorted.sort();

    for (var i = 0; i < sorted.length; i++) {
      prop = sorted[i];
      npmapSorted[prop] = NPMap[prop];
    }

    json = JSON.stringify(npmapSorted, null, 2).split('\n');

    $.each(json, function(i, v) {
      if (v !== null) {
        if (i !== 0 && i !== json.length - 1) {
          formatted += v + '\n' + space;
        } else {
          if (i === json.length - 1) {
            formatted +=  v;
          } else {
            formatted += v + '\n' + space;
          }
        }
      }
    });

    formatted += ';\n\n' + space + 'var s = document.createElement(\'script\');\n' + space + 's.src = \'http://www.nps.gov/lib/npmap.js/2.0.0/npmap-bootstrap.min.js\';\n' + space + 'document.body.appendChild(s);';

    if (html) {
      formatted = '<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="utf-8">\n  </head>\n  <body>\n    <div id="map" style="height:500px;width:500px;">\n    </div>\n    <script>\n      ' + formatted + '\n    </script>\n  </body>\n</html>';
    }

    $code.val(formatted);
    $('#modal-viewConfig-code').on('click', function() {
      $(this).select();
    }).select();
  }
  function setHeight() {
    var height = $(document).height() - 195;

    $('#modal-viewConfig .modal-body').css({
      height: height
    });
    $code.css({
      height: height - $htmlDiv.outerHeight() - 80
    });
  }

  $htmlInput.on('change', setConfig);
  $('#modal-viewConfig').modal().on('show.bs.modal shown.bs.modal', setConfig);
  FulcrumStyler.buildTooltips();
  setConfig();
  setHeight();
  $(window).resize(setHeight);

  return {};
})();
