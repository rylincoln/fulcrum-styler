/* globals $, FulcrumStyler, NPMap */

$('head').append($('<link rel="stylesheet">').attr('href', 'ui/modal/addLayer.css'));

FulcrumStyler.ui = FulcrumStyler.ui || {};
FulcrumStyler.ui.modal = FulcrumStyler.ui.modal || {};
FulcrumStyler.ui.modal.addLayer = (function() {
  var $attribution = $('#layerAttribution'),
    $name = $('#layerName'),
    $type = $('#layerType'),
    types = {
      arcgisserver: {
        _tiled: false,
        _url: null,
        fields: {
          $clickable: $('#arcgisserver-clickable'),
          $layers: $('#arcgisserver-layers'),
          $opacity: $('#arcgisserver-opacity'),
          $url: $('#arcgisserver-url').bind('change paste keyup', function() {
            var value = $(this).val(),
              lower = value.toLowerCase();

            if (lower.indexOf('mapserver') === (value.length - 9) || lower.indexOf('mapserver/') === (value.length - 10)) {
              $.ajax({
                dataType: 'json',
                success: function(response) {
                  if (value !== types.arcgisserver._url) {
                    types.arcgisserver.fields.$layers.find('option').remove();
                    $.each(response.layers, function(i, layer) {
                      types.arcgisserver.fields.$layers.append($('<option>', {
                        value: layer.id
                      }).text(layer.id + ': ' + layer.name));
                    });
                    types.arcgisserver.fields.$layers.prop('disabled', false);
                    types.arcgisserver.fields.$layers.selectpicker('refresh');
                    types.arcgisserver._tiled = response.singleFusedMapCache || false;
                    types.arcgisserver._url = value;
                  }
                },
                url: value + '?f=json&callback=?'
              });
            } else {
              types.arcgisserver.fields.$layers.find('option').remove();
              types.arcgisserver.fields.$layers.prop('disabled', true);
              types.arcgisserver.fields.$layers.selectpicker('refresh');
              types.arcgisserver._url = null;
            }
          })
        },
        reset: function() {
          types.arcgisserver.fields.$clickable.prop('checked', 'checked');
          types.arcgisserver.fields.$layers.find('option').remove();
          types.arcgisserver.fields.$layers.prop('disabled', true);
          types.arcgisserver.fields.$layers.selectpicker('refresh');
          types.arcgisserver.fields.$opacity.slider('setValue', 100);
          types.arcgisserver.fields.$url.val('');
          types.arcgisserver._tiled = false;
          types.arcgisserver._url = null;
        }
      },
      cartodb: {
        fields: {
          $clickable: $('#cartodb-clickable'),
          $detectRetina: $('#cartodb-retina'),
          $opacity: $('#cartodb-opacity'),
          $table: $('#cartodb-table'),
          $user: $('#cartodb-user')
        },
        reset: function() {
          types.cartodb.fields.$clickable.prop('checked', 'checked');
          types.cartodb.fields.$detectRetina.prop('checked', false);
          types.cartodb.fields.$opacity.slider('setValue', 100);
          types.cartodb.fields.$table.val('');
          types.cartodb.fields.$user.val('');
        }
      },
      csv: {
        fields: {
          $clickable: $('#csv-clickable'),
          $cluster: $('#csv-cluster'),
          $url: $('#csv-url')
        },
        reset: function() {
          types.csv.fields.$clickable.prop('checked', 'checked');
          types.csv.fields.$cluster.prop(false);
          types.csv.fields.$url.val('');
        }
      },
      geojson: {
        fields: {
          $clickable: $('#geojson-clickable'),
          $cluster: $('#geojson-cluster'),
          $url: $('#geojson-url')
        },
        reset: function() {
          types.geojson.fields.$clickable.prop('checked', 'checked');
          types.geojson.fields.$cluster.prop(false);
          types.geojson.fields.$url.val('');
        }
      },
      kml: {
        fields: {
          $clickable: $('#kml-clickable'),
          $cluster: $('#kml-cluster'),
          $url: $('#kml-url')
        },
        reset: function() {
          types.kml.fields.$clickable.prop('checked', 'checked');
          types.kml.fields.$cluster.prop(false);
          types.kml.fields.$url.val('');
        }
      },
      mapbox: {
        fields: {
          $clickable: $('#mapbox-clickable'),
          $detectRetina: $('#mapbox-retina'),
          $id: $('#mapbox-id'),
          $opacity: $('#mapbox-opacity')
        },
        reset: function() {
          types.mapbox.fields.$clickable.prop('checked', 'checked');
          types.mapbox.fields.$detectRetina.prop('checked', false);
          types.mapbox.fields.$id.val('');
          types.mapbox.fields.$opacity.slider('setValue', 100);
        }
      },
      spot: {
        fields: {
          $clickable: $('#spot-clickable'),
          $cluster: $('#spot-cluster'),
          $id: $('#spot-id')
        },
        reset: function() {
          types.spot.fields.$clickable.prop('checked', 'checked');
          types.spot.fields.$cluster.prop(false);
          types.spot.fields.$id.val('');
        }
      },
      tiled: {
        fields: {
          $opacity: $('#tiled-opacity'),
          $url: $('#tiled-url')
        },
        reset: function() {
          types.tiled.fields.$opacity.slider('setValue', 100);
          types.tiled.fields.$url.val('');
        }
      }
      /*,
      wms: {
        fields: {
          $format: $('#wms-format'),
          $layers: $('#wms-layers'),
          $opacity: $('#wms-opacity'),
          $transparent: $('#wms-transparent'),
          $url: $('#wms-url')
        },
        reset: function() {
          types.wms.fields.$format.find('option').remove();
          types.wms.fields.$format.prop('disabled', true);
          types.wms.fields.$layers.find('option').remove();
          types.wms.fields.$layers.prop('disabled', true);
          types.wms.fields.$layers.selectpicker('refresh');
          types.wms.fields.$opacity.slider('setValue', 100);
          types.wms.fields.$transparent.prop(false);
          types.wms.fields.$url.val('');
        }
      }
      */
    },
    styles;

  function resetFields() {
    $attribution.val(null);
    $name.val(null);
    $.each(types, function(type) {
      types[type].reset();
    });
  }
  function setHeight() {
    $('#modal-addLayer .modal-body').css({
      height: $(document).height() - 180
    });
  }

  setHeight();

  if (typeof FulcrumStyler._pendingLayerEditIndex !== 'undefined') {
    var overlay = NPMap.overlays[FulcrumStyler._pendingLayerEditIndex],
      type = overlay.type;

    delete FulcrumStyler._pendingLayerEditIndex;

    $('#layerType').val(type);
    $.each(types, function(prop) {
      var $el = $('#' + type);

      if (prop === type) {
        $el.show();
      } else {
        $el.hide();
      }
    });
  }

  $('#modal-addLayer').modal({
    backdrop: 'static'
  })
    .on('hide.bs.modal', function() {
      styles = null;
      resetFields();
      $type.val('arcgisserver').trigger('change');
      $('#modal-addLayer .tab-content').css({
        top: 0
      });
      $.each($('#modal-addLayer .form-group'), function(index, formGroup) {
        var $formGroup = $(formGroup);

        if ($formGroup.hasClass('has-error')) {
          $formGroup.removeClass('has-error');
        }
      });
      FulcrumStyler.ui.modal.addLayer._editingIndex = -1;
      $('#layerType').removeAttr('disabled');
      /*
      $('#modal-addLayer-description').html('You can add an overlay to your map either by typing in information about the overlay or searching the NPMap Catalog for datasets to add <em>(coming soon)</em>. Hover over the help icon above for more information.');
      $('#modal-addLayer-title').html('Add Overlay&nbsp;<img src="img/help@2x.png" style="height:18px;" rel="tooltip" title="You can add ArcGIS Server, CartoDB, GeoJSON, KML, and MapBox Hosting overlays to your map. The NPMap Catalog includes results from the National Park Service ArcGIS Server (from both ArcGIS Online and public-facing ArcGIS Server instances), CartoDB, GitHub, and MapBox Hosting accounts." data-placement="bottom">');
      */
      $('#modal-addLayer .btn-primary').text('Add to Map');
      FulcrumStyler.buildTooltips();
    })
    .on('shown.bs.modal', function() {
      $type.focus();
    });
  $('#modal-addLayer .btn-primary').click(function() {
    FulcrumStyler.ui.modal.addLayer._click();
  });
  FulcrumStyler.buildTooltips();
  //resetFields(); // This introduced an issue with the sliders, forcing them to be initialized with default values.
  $type.focus();
  $(window).resize(setHeight);
  $(types.arcgisserver.fields.$layers).selectpicker({
    size: 5
  });
  $(types.arcgisserver.fields.$opacity)
    .add($(types.cartodb.fields.$opacity))
    .add($(types.mapbox.fields.$opacity))
    .add($(types.tiled.fields.$opacity))
    .slider({
      max: 100,
      min: 0,
      value: 100
    });

  return {
    _editingIndex: -1,
    _click: function() {
      var errors = [],
        config;

      if (typeof NPMap.overlays === 'undefined') {
        NPMap.overlays = [];
      }

      var attribution = $attribution.val() || null,
        fields = [$attribution, $name],
        name = $name.val() || null;

      if (!name) {
        errors.push($name);
      }

      if ($('#arcgisserver').is(':visible')) {
        (function() {
          var clickable = types.arcgisserver.fields.$clickable.prop('checked'),
            layers = types.arcgisserver.fields.$layers.val(),
            url = types.arcgisserver.fields.$url.val();

          $.each(types.arcgisserver.fields, function(field) {
            fields.push(field);
          });

          if (!layers) {
            errors.push(types.arcgisserver.fields.$layers);
          } else {
            layers = layers.join(',');
          }

          if (!url) {
            errors.push(types.arcgisserver.fields.$url);
          }

          config = {
            layers: layers,
            opacity: parseInt(types.arcgisserver.fields.$opacity.val(), 10) / 100,
            tiled: types.arcgisserver._tiled,
            type: 'arcgisserver',
            url: url
          };

          if (clickable === false) {
            config.clickable = false;
          }
        })();
      } else if ($('#cartodb').is(':visible')) {
        (function() {
          var clickable = types.cartodb.fields.$clickable.prop('checked'),
            detectRetina = types.cartodb.fields.$detectRetina.prop('checked'),
            table = types.cartodb.fields.$table.val(),
            user = types.cartodb.fields.$user.val();

          $.each(types.cartodb.fields, function(field) {
            fields.push(field);
          });

          if (table) {
            table = table.toLowerCase();
          } else {
            errors.push(types.cartodb.fields.$table.val());
          }

          if (user) {
            user = user.toLowerCase();
          } else {
            errors.push(types.cartodb.fields.$user.val());
          }

          config = {
            opacity: parseInt(types.cartodb.fields.$opacity.val(), 10) / 100,
            table: table,
            type: 'cartodb',
            user: user
          };

          if (clickable === false) {
            config.clickable = false;
          }

          if (detectRetina === true) {
            config.detectRetina = true;
          }
        })();
      } else if ($('#csv').is(':visible')) {
        (function() {
          var clickable = types.csv.fields.$clickable.prop('checked'),
            cluster = types.csv.fields.$cluster.prop('checked'),
            url = types.csv.fields.$url.val();

          $.each(types.csv.fields, function(field) {
            fields.push(field);
          });

          if (!url) {
            errors.push(types.csv.fields.$url);
          }

          config = {
            type: 'csv',
            url: url
          };

          if (clickable === false) {
            config.clickable = false;
          }

          if (cluster) {
            config.cluster = true;
          }
        })();
      } else if ($('#geojson').is(':visible')) {
        (function() {
          var clickable = types.geojson.fields.$clickable.prop('checked'),
            cluster = types.geojson.fields.$cluster.prop('checked'),
            url = types.geojson.fields.$url.val();

          $.each(types.geojson.fields, function(field) {
            fields.push(field);
          });

          if (!url) {
            errors.push(types.geojson.fields.$url);
          }

          config = {
            type: 'geojson',
            url: url
          };

          if (clickable === false) {
            config.clickable = false;
          }

          if (cluster) {
            config.cluster = true;
          }
        })();
      } else if ($('#kml').is(':visible')) {
        (function() {
          var clickable = types.kml.fields.$clickable.prop('checked'),
            cluster = types.kml.fields.$cluster.prop('checked'),
            url = types.kml.fields.$url.val();

          $.each(types.kml.fields, function(field) {
            fields.push(field);
          });

          if (!url) {
            errors.push(types.kml.fields.$url);
          }

          config = {
            type: 'kml',
            url: url
          };

          if (clickable === false) {
            config.clickable = false;
          }

          if (cluster) {
            config.cluster = true;
          }
        })();
      } else if ($('#mapbox').is(':visible')) {
        (function() {
          var clickable = types.mapbox.fields.$clickable.prop('checked'),
            detectRetina = types.mapbox.fields.$detectRetina.prop('checked'),
            id = types.mapbox.fields.$id.val();

          $.each(types.mapbox.fields, function(field) {
            fields.push(field);
          });

          if (!id) {
            errors.push(types.mapbox.fields.$id.val());
          }

          config = {
            id: id,
            opacity: parseInt(types.mapbox.fields.$opacity.val(), 10) / 100,
            type: 'mapbox'
          };

          if (clickable === false) {
            config.clickable = false;
          }

          if (detectRetina === true) {
            config.detectRetina = true;
          }
        })();
      } else if ($('#spot').is(':visible')) {
        (function() {
          var clickable = types.spot.fields.$clickable.prop('checked'),
            cluster = types.spot.fields.$cluster.prop('checked'),
            id = types.spot.fields.$id.val();

          $.each(types.spot.fields, function(field) {
            fields.push(field);
          });

          if (!id) {
            errors.push(types.kml.fields.$id);
          }

          config = {
            id: id,
            type: 'spot'
          };

          if (clickable === false) {
            config.clickable = false;
          }

          if (cluster) {
            config.cluster = true;
          }
        })();
      } else if ($('#tiled').is(':visible')) {
        (function() {
          var url = types.tiled.fields.$url.val();

          $.each(types.tiled.fields, function(field) {
            fields.push(field);
          });

          if (!url) {
            errors.push(types.tiled.fields.$url.val());
          }

          config = {
            opacity: parseInt(types.tiled.fields.$opacity.val(), 10) / 100,
            type: 'tiled',
            url: url
          };
        })();
      } else if ($('#wms').is(':visible')) {
        /*
          http://nowcoast.noaa.gov/wms/com.esri.wms.Esrimap/obs?request=GetCapabilities&service=WMS
          
          attribution: 'NOAA',
          crs: null, (not implemented)
          format: 'image/png',
          layers: 'RAS_RIDGE_NEXRAD',
          opacity: 0.5,
          styles: '', (not implemented)
          transparent: true,
          type: 'wms',
          url: 'http://nowcoast.noaa.gov/wms/com.esri.wms.Esrimap/obs',
          version: '1.1.1' (autopopulate, no input)
        */
      }

      if (!errors.length) {
        var $layers = $('#layers'),
          type = config.type;

        if (attribution) {
          config.attribution = attribution;
        }

        config.name = name;

        if (styles) {
          config.styles = styles;
        } else if (type === 'csv' || type === 'geojson' || type === 'kml' || type === 'spot') {
          config.styles = $.extend({}, FulcrumStyler._defaultStyles);
        } else if (type === 'cartodb') {
          config.styles = $.extend({}, FulcrumStyler._defaultStylesCollapsed);
        }

        // TODO: Loop through all properties and "sanitize" them.

        if (FulcrumStyler.ui.modal.addLayer._editingIndex === -1) {
          FulcrumStyler.addOverlay(config);
        } else {
          var $li = $($layers.children()[FulcrumStyler.ui.modal.addLayer._editingIndex]),
            $interactivity = $($li.find('.interactivity')[0]);

          NPMap.overlays[FulcrumStyler.ui.modal.addLayer._editingIndex] = config;
          $($li.find('.name')[0]).text(config.name);

          if (typeof config.clickable === 'undefined' || config.clickable === true) {
            $interactivity.show();
          } else {
            $interactivity.hide();
            delete config.popup;
            delete config.tooltip;
          }
        }
      }
      console.log(errors.length);
      if (errors.length) {
        $.each(errors, function(i, $el) {
          console.log($el);
          $el.parent().addClass('has-error');
        });
      }

      FulcrumStyler.updateMap();
      $('#modal-addLayer').modal('hide');
    },
    _layerTypeOnChange: function(value) {
      $.each($('#hosted div'), function(i, div) {
        var $div = $(div);

        if ($div.attr('id')) {
          if ($div.attr('id') === value) {
            $div.show();
          } else {
            $div.hide();
          }
        }
      });
    },
    _load: function(layer) {
      var type = layer.type;

      styles = layer.styles || null;
      $type.val(type).trigger('change');

      for (var prop in layer) {
        var value = layer[prop];
        console.log(value);
        if (prop === 'attribution' || prop === 'name') {
          $('#layer' + (prop.charAt(0).toUpperCase() + prop.slice(1))).val(value);
        } else {
          if (prop === 'clickable' || prop === 'cluster' || prop === 'detectRetina') {
            $('#' + type + '-' + prop).prop('checked', value);
          } else if (prop === 'opacity') {
            $('#' + type + '-opacity').slider('setValue', value * 100);
          } else if (prop !== 'type') {
            $('#' + type + '-' + prop).val(value);
          }
        }
      }

      $('#layerType').attr('disabled', 'disabled');
      $('#modal-addLayer-title').text('Update Overlay');
      $('#modal-addLayer .btn-primary').text('Save Overlay');

      switch (type) {
      case 'arcgisserver':
        var interval;

        types.arcgisserver.fields.$url.trigger('change');
        interval = setInterval(function() {
          if ($('#arcgisserver-layers option').length) {
            clearInterval(interval);
            types.arcgisserver.fields.$layers.selectpicker('val', layer.layers.split(','));
          }
        }, 100);
        break;
      }
    },
    _clearAllArcGisServerLayers: function() {
      types.arcgisserver.fields.$layers.val([]);
    },
    _selectAllArcGisServerLayers: function() {
      $('#arcgisserver-layers option').prop('selected', 'selected');
    }
  };
})();