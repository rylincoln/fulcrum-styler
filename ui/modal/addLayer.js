/* globals $, FulcrumStyler, NPMap */

$('head').append($('<link rel="stylesheet">').attr('href', 'ui/modal/addLayer.css'));

FulcrumStyler.ui = FulcrumStyler.ui || {};
FulcrumStyler.ui.modal = FulcrumStyler.ui.modal || {};
FulcrumStyler.ui.modal.addLayer = (function() {
  var $attribution = $('#layerAttribution'),
    $description = $('#layerDescription'),
    $name = $('#layerName'),
    $type = $('#layerType'),
    hasNameError = false,
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
          $sql: $('#cartodb-sql'),
          $table: $('#cartodb-table'),
          $user: $('#cartodb-user')
        },
        reset: function() {
          types.cartodb.fields.$clickable.prop('checked', 'checked');
          types.cartodb.fields.$detectRetina.prop('checked', false);
          types.cartodb.fields.$opacity.slider('setValue', 100);
          types.cartodb.fields.$sql.val('');
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
          $id: $('#mapbox-id'),
          $opacity: $('#mapbox-opacity')
        },
        reset: function() {
          types.mapbox.fields.$clickable.prop('checked', 'checked');
          types.mapbox.fields.$id.val('');
          types.mapbox.fields.$opacity.slider('setValue', 100);
        }
      },
      spot: {
        fields: {
          $clickable: $('#spot-clickable'),
          $cluster: $('#spot-cluster'),
          $id: $('#spot-id'),
          $zoomToBounds: $('#spot-zoomToBounds')
        },
        reset: function() {
          types.spot.fields.$clickable.prop('checked', 'checked');
          types.spot.fields.$cluster.prop(false);
          types.spot.fields.$id.val('');
          types.spot.fields.$zoomToBounds.prop(false);
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
    popup, styles, tooltip;

  function resetFields() {
    $attribution.val(null);
    $description.val(null);
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
  function validate(config, callback) {
    var done = false,
      error = null,
      interval;

    window.layerValidate = (function() {
      var contentWindow = document.getElementById('map').contentWindow;

      if (config.type === 'arcgisserver') {
        if (config.tiled) {
          return contentWindow.L.npmap.layer.arcgisserver.tiled(config);
        } else {
          return contentWindow.L.npmap.layer.arcgisserver.dynamic(config);
        }
      }

      return contentWindow.L.npmap.layer[config.type](config);
    })();

    if (window.layerValidate.readyFired) {
      done = true;
    } else {
      window.layerValidate.on('ready', function() {
        done = true;
      });
    }

    if (window.layerValidate.errorFired) {
      error = {
        message: 'Unspecified error.'
      };
      done = true;
    } else {
      window.layerValidate.on('error', function(e) {
        error = e;
        done = true;
      });
    }

    interval = setInterval(function() {
      if (done === true) {
        clearInterval(interval);
        callback(window.layerValidate, error);
        delete window.layerValidate;
      }
    }, 100);
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

  $name.bind('change click input keyup paste propertychange', function() {
    var $this = $(this),
      $parent = $this.parent(),
      value = $this.val();

    hasNameError = false;

    if (value.indexOf(':') !== -1) {
      hasNameError = true;
    } else {
      if (NPMap.overlays && NPMap.overlays.length) {
        for (var i = 0; i < NPMap.overlays.length; i++) {
          if (i !== FulcrumStyler.ui.modal.addLayer._editingIndex) {
            var overlay = NPMap.overlays[i];

            if (value === overlay.name) {
              hasNameError = true;
              break;
            }
          }
        }
      }
    }

    if (hasNameError) {
      $parent.addClass('has-error');
    } else {
      $parent.removeClass('has-error');
    }
  });
  $('#modal-addLayer').modal({
    backdrop: 'static'
  })
    .on('hide.bs.modal', function() {
      hasNameError = false;
      popup = styles = tooltip = null;
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
      $('#modal-addLayer-description').html('Type in information about a hosted dataset to overlay it on your map.');
      $('#modal-addLayer-title').html('Add an Existing Overlay&nbsp;<img data-container="#modal-addLayer" data-original-title="You can add ArcGIS Online/ArcGIS Server, CartoDB, CSV, GeoJSON, KML, MapBox, SPOT, or Tiled overlays to your map." data-placement="bottom" rel="tooltip" src="assets/img/help@2x.png" style="height:18px;" title="">');
      FulcrumStyler.buildTooltips();
      $('#addLayer-add, #addLayer-cancel').each(function(i, button) {
        $(button).prop('disabled', false);
      });
    })
    .on('shown.bs.modal', function() {
      $type.focus();
    });
  $('#modal-addLayer .btn-primary').click(function() {
    FulcrumStyler.ui.modal.addLayer._click();
  });
  FulcrumStyler.buildTooltips();
  //resetFields(); // This introduced an issue with the sliders, forcing them to be initialized with default values.
  setTimeout(function() {
    $type.focus();
  }, 100);
  $(window).resize(setHeight);
  $(types.cartodb.fields.$layers).selectpicker({
    size: 5
  });
  $(types.cartodb.fields.$opacity)
    // .add($(types.cartodb.fields.$opacity))
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

      if ($('#catalog').is(':visible')) {
        if ($('#overlays').val().length) {
          switch ($('#catalog-source').val()) {
          case 'places':
            config = document.getElementById('map').contentWindow.L.npmap.preset.overlays.places['points-of-interest'];
            break;
          }

          FulcrumStyler.addOverlay(config);
        } else {
          errors.push($('#catalog-source'));
        }
      } else {
        var attribution = $attribution.val() || null,
          description = $description.val() || null,
          fields = [$attribution, $description, $name],
          name = $name.val() || null;

        if (!name || hasNameError) {
          errors.push($name);
        }

        // if ($('#arcgisserver').is(':visible')) {
        //   (function() {
        //     var clickable = types.arcgisserver.fields.$clickable.prop('checked'),
        //       layers = types.arcgisserver.fields.$layers.val(),
        //       url = types.arcgisserver.fields.$url.val();

        //     $.each(types.arcgisserver.fields, function(field) {
        //       fields.push(field);
        //     });

        //     if (!layers) {
        //       errors.push(types.arcgisserver.fields.$layers);
        //     } else {
        //       layers = layers.join(',');
        //     }

        //     if (!url) {
        //       errors.push(types.arcgisserver.fields.$url);
        //     }

        //     config = {
        //       layers: layers,
        //       opacity: parseInt(types.arcgisserver.fields.$opacity.val(), 10) / 100,
        //       tiled: types.arcgisserver._tiled,
        //       type: 'arcgisserver',
        //       url: url
        //     };

        //     if (clickable === false) {
        //       config.clickable = false;
        //     }
        //   })();
        // } else 
        if ($('#cartodb').is(':visible')) {
          (function() {
            var clickable = types.cartodb.fields.$clickable.prop('checked'),
              detectRetina = types.cartodb.fields.$detectRetina.prop('checked'),
              sql = types.cartodb.fields.$sql.val(),
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

            if (sql && sql.length) {
              config.sql = sql;
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
          })();
        } else if ($('#spot').is(':visible')) {
          (function() {
            var clickable = types.spot.fields.$clickable.prop('checked'),
              cluster = types.spot.fields.$cluster.prop('checked'),
              id = types.spot.fields.$id.val(),
              zoomToBounds = types.spot.fields.$zoomToBounds.prop('checked');

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

            if (zoomToBounds) {
              config.zoomToBounds = true;
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

          $('#addLayer-add, #addLayer-cancel').each(function(i, button) {
            $(button).prop('disabled', true);
          });

          if (attribution) {
            config.attribution = attribution;
          }

          if (description) {
            config.description = description;
          }

          config.name = name;

          if (popup) {
            config.popup = popup;
          }

          if (styles) {
            config.styles = styles;
          } else if (type === 'csv' || type === 'geojson' || type === 'kml' || type === 'spot') {
            config.styles = $.extend(true, {}, FulcrumStyler._defaultStyles);
          } else if (type === 'cartodb') {
            config.styles = $.extend(true, {}, FulcrumStyler._defaultStylesCollapsed);
          }

          if (tooltip) {
            config.tooltip = tooltip;
          }

          // TODO: Loop through all properties and "sanitize" them.
          // TODO: Better loading indicator?
          validate($.extend({}, config), function(validated, error) {
            if (error) {
              if (!error.message) {
                error.message = 'An unhandled error occured.';
              }

              $('#addLayer-add, #addLayer-cancel').each(function(i, button) {
                $(button).prop('disabled', false);
              });
              window.alert('The overlay could not be added to the map. The full error message is:\n\n' + error.message);
            } else {
              if (FulcrumStyler.ui.modal.addLayer._editingIndex === -1) {
                if (config.styles) {
                  var geometryTypes = validated._geometryTypes;

                  if (config.type === 'cartodb') {
                    var geometryType = geometryTypes[0];

                    switch (geometryType) {
                    case 'line':
                      delete config.styles.fill;
                      delete config.styles['fill-opacity'];
                      delete config.styles['marker-color'];
                      delete config.styles['marker-size'];
                      break;
                    case 'point':
                      delete config.styles.fill;
                      delete config.styles['fill-opacity'];
                      delete config.styles.stroke;
                      delete config.styles['stroke-opacity'];
                      delete config.styles['stroke-width'];
                      break;
                    case 'polygon':
                      delete config.styles['marker-color'];
                      delete config.styles['marker-size'];
                      break;
                    }
                  } else {
                    if (geometryTypes.indexOf('line') === -1) {
                      delete config.styles.line;
                    }

                    if (geometryTypes.indexOf('point') === -1) {
                      delete config.styles.point;
                    }

                    if (geometryTypes.indexOf('polygon') === -1) {
                      delete config.styles.polygon;
                    }
                  }
                }

                FulcrumStyler.addOverlay(config);
              } else {
                var $li = $($layers.children()[FulcrumStyler.ui.modal.addLayer._editingIndex]),
                  $interactivity = $($li.find('.interactivity')[0]);

                NPMap.overlays[FulcrumStyler.ui.modal.addLayer._editingIndex] = config;
                $($li.find('.name')[0]).text(config.name);

                if (config.description) {
                  $($li.find('.description')[0]).text(config.description);
                }

                if (typeof config.clickable === 'undefined' || config.clickable === true) {
                  $interactivity.show();
                } else {
                  $interactivity.hide();
                  delete config.popup;
                  delete config.tooltip;
                }
              }

              FulcrumStyler.updateMap();
              $('#modal-addLayer').modal('hide');
            }
          });
        } else {
          $.each(errors, function(i, $el) {
            $el.parent().addClass('has-error');
          });
        }
      }
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

      popup = layer.popup || null;
      styles = layer.styles || null;
      tooltip = layer.tooltip || null;
      $type.val(type).trigger('change');

      for (var prop in layer) {
        var value = layer[prop];

        if (prop === 'attribution' || prop === 'description' || prop === 'name') {
          $('#layer' + (prop.charAt(0).toUpperCase() + prop.slice(1))).val(value);
        } else {
          if (prop === 'clickable' || prop === 'cluster' || prop === 'detectRetina' || prop === 'zoomToBounds') {
            $('#' + type + '-' + prop).prop('checked', value);
          } else if (prop === 'opacity') {
            $('#' + type + '-opacity').slider('setValue', value * 100);
          } else if (prop !== 'type') {
            $('#' + type + '-' + prop).val(value);
          }
        }
      }

      $('#layerType').attr('disabled', 'disabled');
      $('#modal-addLayer-description').html('Use the form below to update your overlay.');
      $('#modal-addLayer-title').text('Update Overlay');
      $('#modal-addLayer .btn-primary').text('Save Overlay');

      switch (type) {
        debugger;
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
