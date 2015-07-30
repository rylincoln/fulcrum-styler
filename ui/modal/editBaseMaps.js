/* globals $, FulcrumStyler, NPMap */

$('head').append($('<link rel="stylesheet">').attr('href', 'ui/modal/editBaseMaps.css'));

FulcrumStyler.ui = FulcrumStyler.ui || {};
FulcrumStyler.ui.modal = FulcrumStyler.ui.modal || {};
FulcrumStyler.ui.modal.editBaseMaps = (function() {
  var $checkbox = $('#modal-editBaseMaps input'),
    $modal = $('#modal-editBaseMaps'),
    presets = document.getElementById('iframe-map').contentWindow.L.npmap.preset,
    baseLayers = presets.baselayers,
    html = [],
    overlays = presets.overlays,
    providers = {
      bing: 'Bing',
      cartodb: 'CartoDB',
      esri: 'Esri',
      mapbox: 'Mapbox',
      nps: 'National Park Service',
      stamen: 'Stamen'
    },
    activeLink;

  function createThumbnail(map, provider, providerPretty, cartodb) {
    var id = provider + '-' + map,
      pretty = maps[map].name.replace(provider.toUpperCase() + ' ', '').replace(providerPretty + ' ', '');

    if (id === 'nps-parkTiles' || id === 'nps-parkTilesImagery' || id === 'nps-darkStreets' || id === 'nps-parkTilesSlate' ){
      return '';
    } else {
      return '' +
        '<div id="' + id + '" class="basemap col-xs-4 col-sm-4 col-md-4 col-lg-4">' +
          '<div class="thumbnail">' +
            '<p>' + pretty + '</p>' +
            '<img alt="Screenshot of ' + pretty + ' basemap." src="assets/img/base-maps/' + id + '.png" style="height:152px;width:152px;">' +
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
    }
  }
  function setHeight() {
    $('#modal-editBaseMaps .modal-body').css({
      height: $(document).height() - 180
    });
  }
  function submit() {
    var layers = [];

    if (!$checkbox.is(':checked')) {
      $.each($('#modal-editBaseMaps div.basemap'), function(i, div) {
        var id = div.id,
          inputs = $(div).find('input');

        if ($(inputs[0]).prop('checked')) {
          var link = $(div).find('a');

          if (link.length) {
            var $link = $(link[0]);

            if ($link.html().indexOf('No') === -1) {
              var clone = $.extend({}, baseLayers.nps[id.replace('nps-', '')]);

              clone.id += ',' + $link.attr('id').replace('cartodb-overlays-link-', '');
              clone.popup = {
                title: '{{name}}'
              };
              debugger;

              if ($(inputs[1]).prop('checked')) {
                layers.unshift(clone);
              } else {
                layers.push(clone);
              }
            } else {
              if ($(inputs[1]).prop('checked')) {
                layers.unshift(id);
              } else {
                layers.push(id);
              }
            }
          } else {
            if ($(inputs[1]).prop('checked')) {
              layers.unshift(id);
            } else {
              layers.push(id);
            }
          }
        }
      });
    }

    NPMap.baseLayers = layers;
    FulcrumStyler.updateMap();
    $modal.modal('hide');
  }
  function update() {
    $.each($('#modal-editBaseMaps div.basemap'), function(i, div) {
      var checked = false,
        id = div.id;
        link = $(div).find('.cartodb-overlays-link');
      debugger;

      // TODO: Maybe you should store the overlays in the baselayers preset in NPMap.js?

      // Rather than iterating through divs, should you iterate through NPMap.baseLayers?
      if (typeof id === 'string') {
        if ($.inArray(id, NPMap.baseLayers) !== -1) {
          checked = true;
        }
      }

      $($(div).find('input')[0]).prop('checked', checked);

      if (link.length) {
        var $link = $(link[0]);

        if (checked) {
          $link.css('display', 'block');
        } else {
          $link.css('display', 'none');
        }
      }
    });

    // if (!NPMap.baseLayers || NPMap.baseLayers.length === 0) {
    //   $checkbox
    //     .prop('checked', true)
    //     .trigger('change');
    // } else {
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
  // }

  for (var provider in baseLayers) {
    if (provider !== 'openstreetmap') {
      var content = '',
        maps = baseLayers[provider],
        providerPretty = providers[provider] || provider,
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

  $('#modal-editBaseMaps .btn-primary').on('click', submit);
  $('#modal-editBaseMaps .modal-body').append(html.join(''));
  $('#modal-editBaseMaps .checkbox-inline input').change(function() {
    var link = $(this).parent().parent().parent().parent().find('.cartodb-overlays-link');

    if (link) {
      if ($(this).is(':checked')) {
        $(link[0]).show();
      } else {
        $(link[0]).hide();
      }
    }
  });
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
      debugger;
    }
  });
  $modal
    .modal({
      backdrop: 'static',
      keyboard: false
    })
    .on('hide.bs.modal', function() {
      $('#modal-editBaseMaps .modal-body').scrollTop(0);
    });
  FulcrumStyler.buildTooltips();
  setHeight();
  update();
  $(window).resize(setHeight);

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
