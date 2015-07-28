/* globals $, FulcrumStyler, NPMap */

$('head').append($('<link rel="stylesheet">').attr('href', 'ui/modal/editBaseMaps.css'));

FulcrumStyler.ui = FulcrumStyler.ui || {};
FulcrumStyler.ui.modal = FulcrumStyler.ui.modal || {};
FulcrumStyler.ui.modal.editBaseMaps = (function() {
  var $checkbox = $('#modal-editBaseMaps input'),
    baseMaps = document.getElementById('iframe-map').contentWindow.L.npmap.preset.baselayers,
    html = [];
debugger;
  function createThumbnail(map, provider, providerPretty) {
    var id = provider + '-' + map,
      thumbnail = '' +
        '<div id="' + id + '" class="basemap col-xs-4 col-sm-4 col-md-4 col-lg-4">' +
          '<div class="thumbnail">' +
            '<p>' + maps[map].name.replace(provider.toUpperCase() + ' ', '').replace(providerPretty + ' ', '') + '</p>' +
            '<img src="assets/img/base-maps/' + id + '.png" alt="..." style="height:152px;width:152px;">' +
            '<div class="caption">' +
              '<div class="checkbox-inline">' +
                '<label style="font-weight:normal;margin-bottom:0;">' +
                  '<input type="checkbox">' +
                  ' Add to map?' +
                '</label>' +
              '</div>' +
              '<div class="radio-inline">' +
                '<label style="font-weight:normal;margin-bottom:0;">' +
                  '<input type="radio" name="default-basemap" onclick="FulcrumStyler.ui.modal.editBaseMaps.handleRadio(this);">' +
                    ' Make default?' +
                '</label>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '';

    if (map === 'parkTiles' || map === 'parkTilesImagery' || map === 'darkStreets' || map === 'parkTilesSlate' ){
      return '';
    } else {
      return thumbnail;
    } 
  }
  function getProvider(provider) {
    switch (provider) {
    case 'bing':
      return 'Bing';
    case 'cartodb':
      return 'CartoDB';
    case 'esri':
      return 'Esri';
    case 'mapbox':
      return 'Mapbox';
    case 'nps':
      return 'National Park Service';
    case 'stamen':
      return 'Stamen';
    default:
      return provider;
    }
  }
  function setBaseMapsAndHide() {
    var baseLayers = [];

    if (!$checkbox.is(':checked')) {
      $.each($('#modal-editBaseMaps div.basemap'), function(i, div) {
        var id = div.id,
          inputs = $(div).find('input');

        if ($(inputs[0]).prop('checked')) {
          if ($(inputs[1]).prop('checked')) {
            baseLayers.unshift(id);
          } else {
            baseLayers.push(id);
          }
        }
      });
    }

    NPMap.baseLayers = baseLayers;
    FulcrumStyler.updateMap();
    $('#modal-editBaseMaps').modal('hide');
  }
  function setHeight() {
    $('#modal-editBaseMaps .modal-body').css({
      height: $(document).height() - 180
    });
  }
  function update() {
    $.each($('#modal-editBaseMaps div.basemap'), function(i, div) {
      var checked = false,
        id = div.id;

      if ($.inArray(id, NPMap.baseLayers) !== -1) {
        checked = true;
      }

      $($(div).find('input')[0]).prop('checked', checked);
    });

    if (!NPMap.baseLayers || NPMap.baseLayers.length === 0) {
      $checkbox
        .prop('checked', true)
        .trigger('change');
    } else {
      var active;

      for (var i = 0; i < NPMap.baseLayers.length; i++) {
        var baseLayer = NPMap.baseLayers[i];

        if (typeof baseLayer.visible === 'undefined' || baseLayer.visible === true) {
          active = baseLayer;
          break;
        }
      }

      $($('#' + active).find('input')[0]).prop('disabled', true);
      $($('#' + active).find('input')[1]).prop('checked', true);
    }
  }

  for (var provider in baseMaps) {
    if (provider !== 'openstreetmap') {
      var content = '',
        maps = baseMaps[provider],
        providerPretty = getProvider(provider),
        map;

      content += '<div class="well"><h5>' + providerPretty + '</h5><div class="row">';

        for (map in maps) {
          content += createThumbnail(map, provider, providerPretty);
        }

      content += '</div></div>';

      if (provider === 'cartodb') {
        html.unshift(content);
      } else {
        html.push(content);
      }
    }
  }

  $('#modal-editBaseMaps .btn-primary').on('click', setBaseMapsAndHide);
  $checkbox.change(function() {
    var checked = $(this).is(':checked');

    $('#modal-editBaseMaps .well').each(function() {
      var $this = $(this);

      if (checked) {
        $this.hide();
      } else {
        $this.show();
      }
    });

    if (!checked) {
      NPMap.baseLayers = [
        'cartodb-positron'
      ];
      update();
    }
  });
  $('#modal-editBaseMaps .modal-body').append(html.join(''));
  $('#modal-editBaseMaps').modal({
    backdrop: 'static'
  });
  FulcrumStyler.buildTooltips();
  setHeight();
  $(window).resize(setHeight);
  update();

  return {
    handleRadio: function(el) {
      var $checkbox = $($(el).parent().parent().prev().children().children()[0]);
      
      $.each($('#modal-editBaseMaps :checkbox'), function(i, checkbox) {
        $(checkbox).prop('disabled', false);
      });

      $checkbox.prop('checked', true).prop('disabled', true);
    }
  };
})();
