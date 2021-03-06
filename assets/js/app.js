/* globals tinycolor */

var alertify, FulcrumStyler, mapId, moment, NPMap;

function ready() {
  FulcrumStyler = (function() {
    var $activeChangeStyleButton = null,
      $activeConfigureInteractivityButton = $('#popup'),
      $buttonAddAnotherLayer = $('#addAnotherLayer'),
      $buttonEditBaseMapsAgain = $('#editBaseMapsAgain'),
      $buttonExport = $('#embed'),
      // $mapSize = $('.change-size'),
      $buttonSave = $('#button-save'),
      $buttonRefresh = $('#button-refresh'),
      $iframe = $('#iframe-map'),
      $lat = $('.lat'),
      $lng = $('.lng'),
      $layers = $('#layers'), //same thing
      $ul = $('#layers'),
      $zoom = $('.zoom'),
      abcs = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'],
      colors = [],
      description = null,
      descriptionSet = false,
      descriptionZ = null,
      firstLoad = false,
      optionsLettersAll = [],
      optionsLettersFiltered = [],
      optionsMaki = [],
      optionsNpmakiAll = [],
      optionsNpmakiFiltered = [],
      optionsNumbersAll = [],
      optionsNumbersFiltered = [],
      settingsSet = false,
      settingsZ = null,
      titleSet = false,
      titleZ = null,
      saveMapInterval = 0,
      $modalAddLayer, $modalEditBaseMaps;

    function disableSave() {
      //work on this... 
      $buttonSave.css('color','#808080');
      $buttonSave.prop('disabled', true);
    }
    function enableSave() {
      var iframe = document.getElementById('iframe-map'),
        bottom = iframe.contentDocument.getElementsByClassName('leaflet-control-attribution')[0], 
        disclaimer = bottom.getElementsByTagName('a')[0];
        disclaimer.innerHTML = '';

      $buttonSave.prop('disabled', false);
    }
    function escapeHtml(unsafe) {
      return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }
    function generateLayerChangeStyle(name, overlay) {
      var activePanelSet = false,
        activeTabSet = false,
        geometryTypes = overlay.L._geometryTypes || overlay.L.L._geometryTypes,
        sortable;

      function getName(fieldName, geometryType) {
        if (overlay.type === 'cartodb') {
          return name + '_' + fieldName;
        } else {
          return name + '_' + geometryType + '_' + fieldName;
        }
      }
      function createPanel(id) {
        var empty = geometryTypes.indexOf(id) === -1;

        if (empty) {
          return '';
        } else {
          var panel = '<div class="tab-pane';

          if (!empty && !activePanelSet) {
            panel += ' active in';
            activePanelSet = true;
          }

          panel += '"';

          if (!empty) {
            panel += ' id="' + id + '"';
          }

          panel += '>';

          switch (id) {
          case 'line':
            panel += '' +
              '<fieldset>' +
                '<div class="form-group">' +
                  '<label class="col-sm-6 control-label" for="' + getName('stroke', 'line') + '">Color</label>' +
                  '<div class="col-sm-6">' +
                    '<input class="form-control colorpicker" id="' + getName('stroke', 'line') + '"></input>' +
                  '</div>' +
                '</div>' +
                '<div class="form-group">' +
                  '<label class="col-sm-6 control-label" for="' + getName('stroke-width', 'line') + '">Width</label>' +
                  '<div class="col-sm-6">' +
                    '<select class="form-control" id="' + getName('stroke-width', 'line') + '">' +
                      '<option value="1">1 pt</option>' +
                      '<option value="2">2 pt</option>' +
                      '<option value="3">3 pt</option>' +
                      '<option value="4">4 pt</option>' +
                      '<option value="5">5 pt</option>' +
                      '<option value="6">6 pt</option>' +
                      '<option value="7">7 pt</option>' +
                      '<option value="8">8 pt</option>' +
                      '<option value="9">9 pt</option>' +
                      '<option value="10">10 pt</option>' +
                    '</select>' +
                  '</div>' +
                '</div>' +
                '<div class="form-group">' +
                  '<label class="col-sm-6 control-label" for="' + getName('stroke-opacity', 'line') + '">Opacity</label>' +
                  '<div class="col-sm-6">' +
                    '<select class="form-control" id="' + getName('stroke-opacity', 'line') + '">' +
                      '<option value="0">0</option>' +
                      '<option value="0.1">0.1</option>' +
                      '<option value="0.2">0.2</option>' +
                      '<option value="0.3">0.3</option>' +
                      '<option value="0.4">0.4</option>' +
                      '<option value="0.5">0.5</option>' +
                      '<option value="0.6">0.6</option>' +
                      '<option value="0.7">0.7</option>' +
                      '<option value="0.8">0.8</option>' +
                      '<option value="0.9">0.9</option>' +
                      '<option value="1">1</option>' +
                    '</select>' +
                  '</div>' +
                '</div>' +
              '</fieldset>' +
            '';
            break;
          case 'point':
            if (overlay.type === 'cartodb') {
              // TODO: Also stroke properties (surface to NPMap.js): stroke opacity, color, and weight.
              panel += '' +
                '<fieldset>' +
                  '<div class="form-group">' +
                    '<label class="col-sm-6 control-label" for="' + getName('marker-color', 'point') + '">Color</label>' +
                    '<div class="col-sm-6">' +
                      '<input class="form-control colorpicker" id="' + getName('marker-color', 'point') + '"></input>' +
                    '</div>' +
                  '</div>' +
                  '<div class="form-group">' +
                    '<label class="col-sm-6 control-label" for="' + getName('marker-size', 'point') + '">Size</label>' +
                    '<div class="col-sm-6">' +
                      '<select class="form-control" id="' + getName('marker-size', 'point') + '"><option value="small">Small</option><option value="medium">Medium</option><option value="large">Large</option></select>' +
                    '</div>' +
                  '</div>' +
                '</fieldset>' +
              '';
            } else {
              panel += '' +
                '<fieldset>' +
                  '<div class="form-group">' +
                    '<label class="col-sm-6 control-label" for="' + getName('marker-library', 'point') + '">Library</label>' +
                    '<div class="col-sm-6">' +
                      '<select class="form-control marker-library" id="' + getName('marker-library', 'point') + '" onchange="FulcrumStyler.ui.steps.addAndCustomizeData.handlers.changeMarkerLibrary(this);return false;">' +
                        '<option value="maki">Icons</option>' +
                        '<option value="letters">Letters</option>' +
                        '<option value="npmaki">Park Icons</option>' +
                        '<option value="numbers">Numbers</option>' +
                      '</select>' +
                    '</div>' +
                  '</div>' +
                  '<div class="form-group">' +
                    '<label class="col-sm-6 control-label" for="' + getName('marker-symbol', 'point') + '">Symbol</label>' +
                    '<div class="col-sm-6">' +
                      '<select class="form-control marker-symbol" id="' + getName('marker-symbol', 'point') + '"></select>' +
                    '</div>' +
                  '</div>' +
                  '<div class="form-group">' +
                    '<label class="col-sm-6 control-label" for="' + getName('marker-color', 'point') + '">Color</label>' +
                    '<div class="col-sm-6">' +
                      '<input class="form-control colorpicker" id="' + getName('marker-color', 'point') + '"></input>' +
                    '</div>' +
                  '</div>' +
                  '<div class="form-group">' +
                    '<label class="col-sm-6 control-label" for="' + getName('marker-size', 'point') + '">Size</label>' +
                    '<div class="col-sm-6">' +
                      '<select class="form-control" id="' + getName('marker-size', 'point') + '">' +
                        '<option value="small">Small</option>' +
                        '<option value="medium">Medium</option>' +
                        '<option value="large">Large</option>' +
                      '</select>' +
                    '</div>' +
                  '</div>' +
                '</fieldset>' +
              '';
            }

            break;

          case 'polygon':
            panel += '' +
              '<fieldset>' +
                '<div class="form-group">' +
                  '<label class="col-sm-6 control-label" for="' + getName('fill', 'polygon') + '">Color</label>' +
                  '<div class="col-sm-6">' +
                    '<input class="form-control colorpicker" id="' + getName('fill', 'polygon') + '" ></input>' +
                  '</div>' +
                '</div>' +
                '<div class="form-group">' +
                  '<label class="col-sm-6 control-label" for="' + getName('fill-opacity', 'polygon') + '">Opacity</label>' +
                  '<div class="col-sm-6">' +
                    '<select class="form-control" id="' + getName('fill-opacity', 'polygon') + '">' +
                      '<option value="0">0</option>' +
                      '<option value="0.1">0.1</option>' +
                      '<option value="0.2">0.2</option>' +
                      '<option value="0.3">0.3</option>' +
                      '<option value="0.4">0.4</option>' +
                      '<option value="0.5">0.5</option>' +
                      '<option value="0.6">0.6</option>' +
                      '<option value="0.7">0.7</option>' +
                      '<option value="0.8">0.8</option>' +
                      '<option value="0.9">0.9</option>' +
                      '<option value="1">1</option>' +
                    '</select>' +
                  '</div>' +
                '</div>' +
                '<div class="form-group">' +
                  '<label class="col-sm-6 control-label" for="' + getName('stroke', 'polygon') + '">Outline Color</label>' +
                  '<div class="col-sm-6">' +
                    '<input class="form-control colorpicker" id="' + getName('stroke', 'polygon') + '"></input>' +
                  '</div>' +
                '</div>' +
                '<div class="form-group">' +
                  '<label class="col-sm-6 control-label" for="' + getName('stroke-width', 'polygon') + '">Outline Width</label>' +
                  '<div class="col-sm-6">' +
                    '<select class="form-control" id="' + getName('stroke-width', 'polygon') + '">' +
                      '<option value="1">1 pt</option>' +
                      '<option value="2">2 pt</option>' +
                      '<option value="3">3 pt</option>' +
                      '<option value="4">4 pt</option>' +
                      '<option value="5">5 pt</option>' +
                      '<option value="6">6 pt</option>' +
                      '<option value="7">7 pt</option>' +
                      '<option value="8">8 pt</option>' +
                      '<option value="9">9 pt</option>' +
                      '<option value="10">10 pt</option>' +
                    '</select>' +
                  '</div>' +
                '</div>' +
                '<div class="form-group">' +
                  '<label class="col-sm-6 control-label" for="' + getName('stroke-opacity', 'polygon') + '">Outline Opacity</label>' +
                  '<div class="col-sm-6">' +
                    '<select class="form-control" id="' + getName('stroke-opacity', 'polygon') + '">' +
                      '<option value="0">0</option>' +
                      '<option value="0.1">0.1</option>' +
                      '<option value="0.2">0.2</option>' +
                      '<option value="0.3">0.3</option>' +
                      '<option value="0.4">0.4</option>' +
                      '<option value="0.5">0.5</option>' +
                      '<option value="0.6">0.6</option>' +
                      '<option value="0.7">0.7</option>' +
                      '<option value="0.8">0.8</option>' +
                      '<option value="0.9">0.9</option>' +
                      '<option value="1">1</option>' +
                    '</select>' +
                  '</div>' +
                '</div>' +
              '</fieldset>' +
            '';
            break;
          }

          return panel + '</div>';
        }
      }
      function createTab(id, text) {
        var disabled = geometryTypes.indexOf(id) === -1 && id !== "cluster",
          active = !disabled && !activeTabSet,
          tab = '<li class="';

        if (active) {
          tab += 'active ';
          activeTabSet = true;
        }

        if (disabled) {
          tab += 'disabled';
        }

        tab += '"><a href="';

        if (disabled) {
          tab += 'javascript:void(0);';
        } else {
          tab += '#' + id;
        }

        tab += '"';

        if (!disabled) {
          tab += ' data-toggle="tab"';
        }

        tab += '>' + text + '</a></li>';
        return tab;
      }
      function sort(a, b) {
        if (a.name < b.name) {
          return -1;
        }

        if (a.name > b.name) {
          return 1;
        }

        return 0;
      }

      if (!colors.length) {
        $.each(document.getElementById('iframe-map').contentWindow.L.npmap.preset.colors, function(prop, value) {
          // TODO: Use prop too.
          colors.push(value.color);
        });
      }

      if (!optionsMaki.length) {
        sortable = [];
        $.each(document.getElementById('iframe-map').contentWindow.L.npmap.preset.maki, function(prop, value) {
          sortable.push({
            icon: value.icon,
            name: value.name
          });
        });
        sortable.sort(sort);
        $.each(sortable, function(i, icon) {
          optionsMaki.push('<option value="' + icon.icon + '">' + icon.name + '</option>');
        });
      }

      if (!optionsNpmakiAll.length) {
        var letters = [],
          numbers = [];

        sortable = [];
        $.each(document.getElementById('iframe-map').contentWindow.L.npmap.preset.npmaki, function(prop, value) {
          var lower = value.name.toLowerCase(),
            obj = {
              icon: value.icon,
              name: value.name
            };

          if (lower.indexOf('letter') > -1) {
            letters.push(obj);
          } else if (lower.indexOf('number') > -1) {
            numbers.push(obj);
          } else {
            sortable.push(obj);
          }
        });
        letters.sort(sort);
        $.each(letters, function(i, icon) {
          optionsLettersAll.push('<option value="' + icon.icon + '">' + icon.name + '</option>');
        });
        numbers.sort(sort);
        $.each(numbers, function(i, icon) {
          optionsNumbersAll.push('<option value="' + icon.icon + '">' + icon.name + '</option>');
        });
        sortable.sort(sort);
        $.each(sortable, function(i, icon) {
          optionsNpmakiAll.push('<option value="' + icon.icon + '">' + icon.name + '</option>');
        });
      }

      // TODO: If the overlay is clustered, add a "Cluster" tab.
      // if fulcrum overlay then cluster, point
      return '' +
        '<form class="change-style form-horizontal" id="' + name + '_layer-change-style" role="form">' +
          '<div class="tab-content">' +
            createPanel('point') +
          '</div>' +
        '</form>' +
      '';
    }
    function getLayerIndexFromButton(el) {
      return $.inArray($(el).parent().parent().parent().prev().text(), abcs);
    }
    function getLeafletMap() {
      return document.getElementById('iframe-map').contentWindow.NPMap.config.L;
    }
    function loadModule(module, callback) {
      module = module.replace('FulcrumStyler.', '').replace(/\./g,'/');

      $.ajax({
        dataType: 'html',
        success: function (html) {
          $('body').append(html);
          $.getScript(module + '.js', function() {
            if (callback) {
              callback();
            }
          });
        },
        url: module + '.html'
      });
    }
    function saveMap(callback) {
      var $this = $(this),
        id = App.mapId,
        datum = {
          'description': 'the mapping config',
          'public': true,
          'files': {
            'app.js': {
              'content': 'var NPMap = '+ JSON.stringify(NPMap) + ';' +
              'var s = document.createElement(\"script\");'+
              's.src = \"http://www.nps.gov/npmap/npmap.js/2.0.0/npmap-bootstrap.min.js\";'+
              'document.body.appendChild(s);'
            },
            'index.html': {
              'content': '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no"><title>' + title + '</title><link rel=\"stylesheet\" href=\"style.css\"></head><body><div id=\"map\" /><script src=\"app.js\"></script></body></html>'
            },
            'style.css': {
              'content': 'body {margin: 0;padding: 0;} #map {bottom: 0;position: absolute;top: 0;width: 100%;}.leaflet-container .leaflet-control-attribution {display:none !important;}'
            }
          }
        };
      saveMapInterval = saveMapInterval + 1;

      FulcrumStyler.showLoading();
      console.log(saveMapInterval);

      if (saveMapInterval === 0){
        $.ajax({
          url: 'https://api.github.com/gists',
          type: 'POST',
          dataType: 'json',
          data: JSON.stringify(datum),
          public: false
        })
        .success( function(response) {
          window.App.id = response.id;
          console.log(response);
          FulcrumStyler.hideLoading();

          updateSaveStatus(response.modified);
          alertify.success('Your map was saved!');
          success = true;
          
          if (typeof callback === 'function') {
            callback(success);
          }
        })
        .error( function(e) {
          var error = 'Sorry, there was an unhandled error while saving your map. Please try again.';
          alertify.error(error);
        });
      } else {
        $.ajax({
          url: 'https://api.github.com/gists/' + App.id,
          type: 'PATCH',
          dataType: 'json',
          data: JSON.stringify(datum),
          public: false
        })
        .success( function(response) {
          alertify.success('Your map was saved!');
          success = true;
          
          if (typeof callback === 'function') {
            callback(success);
          }
        })
        .error( function(e) {
          var error = 'Sorry, there was an unhandled error while saving your map. Please try again.';
          alertify.error(error);
        });
      }
    }
    function unescapeHtml(unsafe) {
      return unsafe
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '\"');
    }
    function updateInitialCenterAndZoom() {
      $lat.html(NPMap.center.lat.toFixed(2));
      $lng.html(NPMap.center.lng.toFixed(2));
      $zoom.html(NPMap.zoom);
    }
    function updateSaveStatus(date) {
      $('.info-saved p').text('Saved ' + moment(date).format('MM/DD/YYYY') + ' at ' + moment(date).format('h:mm:ssa'));
      $('.info-saved').show();
      disableSave();
    }

    return {
      _afterUpdateCallbacks: {},
      _defaultStyles: {
        line: {
          'stroke': '#d39800',
          'stroke-opacity': 0.8,
          'stroke-width': 3
        },
        point: {
          'marker-color': '#000000',
          'marker-library': 'maki',
          'marker-size': 'medium',
          'marker-symbol': 'star'
        },
        polygon: {
          'fill': '#d39800',
          'fill-opacity': 0.2,
          'stroke': '#d39800',
          'stroke-opacity': 0.8,
          'stroke-width': 3
        }
      },
      _defaultStylesCollapsed: {
        'fill': '#d39800',
        'fill-opacity': 0.2,
        'marker-color': '#000000',
        'marker-size': 'small',
        'stroke': '#d39800',
        'stroke-opacity': 0.8,
        'stroke-width': 3
      },
      changeCluster: function(el){
        if (el.checked) {
          $('#fulcrum-options').css('display','block');
          NPMap.overlays[0].cluster = {
            clusterIcon: '#6c6c6c',
            maxClusterRadius: 12
          };
          $('#cluster-options').css('display','block');
          $('input[type=range]').on('input', function() {
            if (this.id === 'size'){
              NPMap.overlays[0].cluster.maxClusterRadius = parseInt($('#size')[0].value);
            } else {
              $("input#large").ColorPickerSliders({
                size: 'lg',
                placement: 'bottom',
                swatches: false,
                order: {
                  cie: 1
                }
              });
              debugger;
              NPMap.overlays[0].cluster.clusterIcon = $("input#large").value;
            }
            FulcrumStyler.updateMap();
          });

        } else {
          $('#cluster-options').css('display','none');
          NPMap.overlays[0].cluster = false;
        }

        FulcrumStyler.updateMap()
      },
      saveMap: function(callback) {
        var $this = $(this),
          id = App.mapId,
          datum = {
            'description': 'the mapping config',
            'public': true,
            'files': {
              'app.js': {
                'content': 'var NPMap = '+ JSON.stringify(NPMap) + ';' +
                'var s = document.createElement(\"script\");'+
                's.src = \"http://www.nps.gov/npmap/npmap.js/2.0.0/npmap-bootstrap.min.js\";'+
                'document.body.appendChild(s);'
              },
              'index.html': {
                'content': '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no"><title>Fulcrum Data Collection</title><link rel=\"stylesheet\" href=\"style.css\"></head><body><div id=\"map\" /><script src=\"app.js\"></script></body></html>'
              },
              'style.css': {
                'content': 'body {margin: 0;padding: 0;} #map {bottom: 0;position: absolute;top: 0;width: 100%;}#title {position: absolute;top: 10px;left: 10px;background: #fff;background: rgba(255, 255, 255, 0.7);font: 24px/1.5 "Helvetica Neue", Arial, Helvetica, sans-serif;}'
              }
            }
          };

        FulcrumStyler.showLoading();
        $this.blur();

        $.ajax({
          url: 'https://api.github.com/gists',
          type: 'POST',
          dataType: 'json',
          data: JSON.stringify(datum),
          public: false
        })
        .success( function(response) {
          window.App.id = response.id;
          console.log(response);
          FulcrumStyler.hideLoading();

          updateSaveStatus(response.modified);
          alertify.success('Your map was saved!');
          success = true;
          
          if (typeof callback === 'function') {
            callback(success);
          }
        })
        .error( function(e) {
          var error = 'Sorry, there was an unhandled error while saving your map. Please try again.';
          alertify.error(error);
        });
      },
      ui: {
        init: function() {
          // Dropzone.options.dropzone = {
          //   accept: function(file, done) {
          //     console.log(file);
          //     done();
          //   },
          //   clickable: false,
          //   createImageThumbnails: false,
          //   maxFilesize: 5,
          //   uploadMultiple: false
          // };
          App.title = NPMap.name;
           
          $('#title a').text(App.title).editable({
            animation: false,
            emptytext: 'Untitled Map',
            validate: function(value) {
              if ($.trim(value) === '') {
                return 'Name your map!';
              }
            }
          }).on('hidden', function() {
            var newTitle = $('.title a').text();

            if (newTitle !== App.title) {
              saveMap();
            }

            if (!titleSet) {
              next.css({
                'z-index': titleZ
              });
              titleSet = true;
            }

            App.title = newTitle;
            NPMap.name = App.title;
          })
        },
        steps: {
          addAndCustomizeData: {
            handlers: {
              cancelApplyInteractivity: function() {
                $activeConfigureInteractivityButton.popover('toggle');
                $('#mask').hide();
              },
              cancelApplyStyles: function() {
                $activeChangeStyleButton.popover('toggle');
                $('#mask').hide();
              },
              changeCartoDbHasPoints: function(el) {
                var $el = $(el),
                  $next = $($el.parent().parent().next()),
                  $popover = $next.parents('.popover');

                if ($el.prop('checked')) {
                  if ($next.is(':hidden')) {
                    $next.show();
                    $popover.css({
                      top: (parseInt($popover.css('top').replace('px', ''), 10) - $next.outerHeight() + 45) + 'px'
                    });
                  }
                } else {
                  if ($next.is(':visible')) {
                    $popover.css({
                      top: (parseInt($popover.css('top').replace('px', ''), 10) + $next.outerHeight() - 45) + 'px'
                    });
                    $next.hide();
                  }
                }
              },
              changeEnableTooltips: function(el) {
                var $el = $(el),
                  $tip = $($($el.parent().parent().next().children('input')[0])[0]),
                  checked = $el.prop('checked');

                $tip.prop('disabled', !checked);

                if (!checked) {
                  $tip.val('');
                }
              },
              changeMarkerLibrary: function(el) {
                var $el = $('#' + el.id.replace('_marker-library', '') + '_marker-symbol'),
                  value = $(el).val();

                switch (value) {
                case 'letters':
                  $el.html(optionsLettersFiltered.join(''));
                  break;
                case 'maki':
                  $el.html(optionsMaki.join(''));
                  break;
                case 'npmaki':
                  $el.html(optionsNpmakiFiltered.join(''));
                  break;
                case 'numbers':
                  $el.html(optionsNumbersFiltered.join(''));
                  break;
                }

                $el.val(null);
              },
              clickApplyInteractivity: function(elName, overlayName) {
                var d = $('#' + elName + '_description').val(),
                  popup = {},
                  t = $('#' + elName + '_title').val(),
                  tooltip = $('#' + elName + '_tooltip').val(),
                  overlay = NPMap.overlays[0];
                  
                if (d) {
                  popup.description = escapeHtml(d);
                }

                if (t) {
                  popup.title = escapeHtml(t);
                }

                if (!popup.description && !popup.title && typeof popup.max !== 'number' && typeof popup.min !== 'number') {
                  delete overlay.popup;
                } else {
  
                  overlay.popup = popup;
                }
                console.log(overlay.popup);
                if (tooltip) {
                  overlay.tooltip = escapeHtml(tooltip);
                } else {
                  delete overlay.tooltip;
                }

                $activeConfigureInteractivityButton.popover('toggle');
                $('#mask').hide();
                FulcrumStyler.updateMap();
              },
              clickApplyStyles: function(elName, overlayName) {
                var updated = {},
                  i, overlay = NPMap.overlays[0];

                $.each($('#' + elName + '_layer-change-style input, #' + elName + '_layer-change-style select'), function(i, el) {
                  var $field = $(el),
                    split = $field.attr('id').split('_'),
                    property = split[split.length - 1],
                    value = $field.val();

                  if (overlay.type === 'cartodb') {
                    updated[property] = value;
                  } else {
                    var type = split[split.length - 2];

                    if (property === 'marker-library' && (value === 'letters' || value === 'numbers')) {
                      value = 'npmaki';
                    }

                    if (!updated[type]) {
                      updated[type] = {};
                    }

                    updated[type][property] = value;
                  }
                });
                overlay.styles = updated;
                $activeChangeStyleButton.popover('toggle');
                $('#mask').hide();
                FulcrumStyler.updateMap();
              },
              changeStyle: function (el){
                var $el = $(el);

                if ($el.data('popover-created')) {
                  $el.popover('toggle');
                } else {
                  var layer = document.getElementById('iframe-map').contentWindow.NPMap.config.overlays[0],
                    overlay = NPMap.overlays[0],
                    name = 'fulcrum';
  
                    overlay.type = 'geojson';

                  $el.popover({
                    animation: false,
                    container: 'body',
                    content: '' +
                      generateLayerChangeStyle(name, layer) +
                      '<div style="text-align:center;">' +
                        '<button class="btn btn-primary" onclick="FulcrumStyler.ui.steps.addAndCustomizeData.handlers.clickApplyStyles(\'' + name + '\',\'' + overlay.name + '\');" type="button">Apply</button>' +
                        '<button class="btn btn-default" onclick="FulcrumStyler.ui.steps.addAndCustomizeData.handlers.cancelApplyStyles();" style="margin-left:5px;">Cancel</button>' +
                      '</div>' +
                    '',
                    html: true,
                    placement: 'right',
                    title: null,
                    trigger: 'manual'
                  })
                    .on('hide.bs.popover', function() {
                      $activeChangeStyleButton = null;
                    })
                    .on('shown.bs.popover', function() {
                      var styles = overlay.styles,
                        $field, prop, style, type, value;

                      $activeChangeStyleButton = $el;
                      $('#mask').show();
                      $.each($('#' + name + '_layer-change-style .colorpicker'), function(i, el) {
                        var $el = $(el),
                          obj = {
                            customswatches: false,
                            hsvpanel: true,
                            previewformat: 'hex',
                            size: 'sm',
                            sliders: false,
                            swatches: colors
                          };

                        if (overlay.type !== 'cartodb' && $el.attr('id').toLowerCase().indexOf('marker-color') > -1) {
                          obj.onchange = function(container, color) {
                            FulcrumStyler.ui.steps.addAndCustomizeData.filterColors(color);
                          };
                        }

                        $(el).ColorPickerSliders(obj);
                      });

                      if (overlay.type === 'cartodb') {
                        for (prop in styles) {
                          $field = $('#' + name + '_' + prop);

                          if ($field) {
                            value = overlay.styles[prop];

                            if (prop === 'fill' || prop === 'marker-color' || prop === 'stroke') {
                              $field.trigger('colorpickersliders.updateColor', value);
                            } else {
                              $field.val(value);
                            }
                          }
                        }
                      } else {
                        for (type in styles) {
                          style = styles[type];

                          for (prop in style) {
                            $field = $('#' + name + '_' + type + '_' + prop);

                            if ($field) {
                              value = style[prop];

                              if (prop === 'fill' || prop === 'marker-color' || prop === 'stroke') {
                                $field.trigger('colorpickersliders.updateColor', value);
                              } else if (prop === 'marker-library') {
                                var symbol = style['marker-symbol'];

                                if (typeof symbol === 'string') {
                                  if (symbol.indexOf('letter') > -1) {
                                    $field.val('letters');
                                  } else if (symbol.indexOf('number') > -1) {
                                    $field.val('numbers');
                                  } else {
                                    $field.val(value);
                                  }
                                } else {
                                  $field.val(value);
                                }
                              } else {
                                if (prop === 'marker-symbol') {
                                  if (style['marker-library'] === 'maki') {
                                    $field.html(optionsMaki);
                                  } else {
                                    FulcrumStyler.ui.steps.addAndCustomizeData.filterColors(style['marker-color']);

                                    if (typeof value === 'string') {
                                      if (value.indexOf('letter') > -1) {
                                        $field.html(optionsLettersFiltered.join(''));
                                      } else if (value.indexOf('number') > -1) {
                                        $field.html(optionsNumbersFiltered.join(''));
                                      } else {
                                        $field.html(optionsNpmakiFiltered.join(''));
                                      }
                                    } else {
                                      $field.html(optionsNpmakiFiltered.join(''));
                                    }
                                  }

                                  $field.val(value);
                                } else {
                                  $field.val(value);
                                }
                              }
                            }
                          }
                        }
                      }
                    });
                  $el.popover('show');
                  $('.popover.right.in').css({
                    'z-index': 1031
                  });
                  $el.data('popover-created', true);
                  $activeChangeStyleButton = $el;
                }
              },
              clickLayerChangeStyle: function(el) {
                var $el = $(el);

                if ($el.data('popover-created')) {
                  $el.popover('toggle');
                } else {
                  var index = getLayerIndexFromButton(el),
                    layer = document.getElementById('iframe-map').contentWindow.NPMap.config.overlays[index],
                    name = 'overlay-index-' + index,
                    overlay = NPMap.overlays[index];

                  $el.popover({
                    animation: false,
                    container: 'body',
                    content: '' +
                      generateLayerChangeStyle(name, layer) +
                      '<div style="text-align:center;">' +
                        '<button class="btn btn-primary" onclick="Builder.ui.steps.addAndCustomizeData.handlers.clickApplyStyles(\'' + name + '\');" type="button">Apply</button>' +
                        '<button class="btn btn-default" onclick="Builder.ui.steps.addAndCustomizeData.handlers.cancelApplyStyles();" style="margin-left:5px;">Cancel</button>' +
                      '</div>' +
                    '',
                    html: true,
                    placement: 'right',
                    title: null,
                    trigger: 'manual'
                  })
                    .on('hide.bs.popover', function() {
                      $activeChangeStyleButton = null;
                    })
                    .on('shown.bs.popover', function() {
                      var styles = overlay.styles,
                        $field, prop, style, type, value;

                      $activeChangeStyleButton = $el;
                      $('#mask').show();
                      $.each($('#' + name + '_layer-change-style .colorpicker'), function(i, el) {
                        var $el = $(el),
                          obj = {
                            customswatches: false,
                            hsvpanel: true,
                            previewformat: 'hex',
                            size: 'sm',
                            sliders: false,
                            swatches: colors
                          };

                        if (overlay.type !== 'cartodb' && $el.attr('id').toLowerCase().indexOf('marker-color') > -1) {
                          obj.onchange = function(container, color) {
                            Builder.ui.steps.addAndCustomizeData.filterColors(color);
                          };
                        }

                        $(el).ColorPickerSliders(obj);
                      });

                      if (overlay.type === 'cartodb') {
                        for (prop in styles) {
                          $field = $('#' + name + '_' + prop);

                          if ($field) {
                            value = overlay.styles[prop];

                            if (prop === 'fill' || prop === 'marker-color' || prop === 'stroke') {
                              $field.trigger('colorpickersliders.updateColor', value);
                            } else {
                              $field.val(value);
                            }
                          }
                        }
                      } else {
                        for (type in styles) {
                          style = styles[type];

                          for (prop in style) {
                            $field = $('#' + name + '_' + type + '_' + prop);

                            if ($field) {
                              value = style[prop];

                              if (prop === 'fill' || prop === 'marker-color' || prop === 'stroke') {
                                $field.trigger('colorpickersliders.updateColor', value);
                              } else if (prop === 'marker-library') {
                                var symbol = style['marker-symbol'];

                                if (typeof symbol === 'string') {
                                  if (symbol.indexOf('letter') > -1) {
                                    $field.val('letters');
                                  } else if (symbol.indexOf('number') > -1) {
                                    $field.val('numbers');
                                  } else {
                                    $field.val(value);
                                  }
                                } else {
                                  $field.val(value);
                                }
                              } else {
                                if (prop === 'marker-symbol') {
                                  if (style['marker-library'] === 'maki') {
                                    $field.html(optionsMaki);
                                  } else {
                                    Builder.ui.steps.addAndCustomizeData.filterColors(style['marker-color']);

                                    if (typeof value === 'string') {
                                      if (value.indexOf('letter') > -1) {
                                        $field.html(optionsLettersFiltered.join(''));
                                      } else if (value.indexOf('number') > -1) {
                                        $field.html(optionsNumbersFiltered.join(''));
                                      } else {
                                        $field.html(optionsNpmakiFiltered.join(''));
                                      }
                                    } else {
                                      $field.html(optionsNpmakiFiltered.join(''));
                                    }
                                  }

                                  $field.val(value);
                                } else {
                                  $field.val(value);
                                }
                              }
                            }
                          }
                        }
                      }
                    });
                  $el.popover('show');
                  $('.popover.right.in').css({
                    'z-index': 1031
                  });
                  $el.data('popover-created', true);
                  $activeChangeStyleButton = $el;
                }
              },
              clickLayerConfigureInteractivity: function(el) {
                var $el = $(el);
                
                if ($el.data('popover-created')) {
                  $el.popover('toggle');
                } else {
                  var overlay = NPMap.overlays[0], //getLayerIndexFromButton(el)
                    name = overlay.name.split(' ').join('_'),
                    supportsTooltips = (overlay.type === 'cartodb' || overlay.type === 'csv' || overlay.type === 'geojson' || overlay.type === 'kml' || overlay.type === 'mapbox'),
                    html;

                  html = '' +
                    // Checkbox here "Display all fields in a table?" should be checked on by default.
                    '<form class="configure-interactivity" id="' + name + '_layer-configure-interactivity" role="form">' +
                      '<fieldset>' +
                        '<div class="form-group">' +
                          '<span><label for="' + name + '_title">Title</label><a href="https://fulcrumapp.github.io/fulcrum-styler/popups-and-tooltips.html" target="_blank"><img data-container="body" data-placement="bottom" rel="tooltip" src="assets/img/help@2x.png" style="cursor:pointer;float:right;height:18px;" title="The title will display in bold at the top of the popup. HTML and Handlebars templates are allowed. Click for more info."></a></span>' +
                          '<input class="form-control" id="' + name + '_title" rows="3" type="text"></input>' +
                        '</div>' +
                        '<div class="form-group">' +
                          '<span><label for="' + name + '_description">Description</label><a href="https://fulcrumapp.github.io/fulcrum-styler/popups-and-tooltips.html" target="_blank"><img data-container="body" data-placement="bottom" rel="tooltip" src="assets/img/help@2x.png" style="cursor:pointer;float:right;height:18px;" title="The description will display underneath the title. HTML and Handlebars templates are allowed. Click for more info."></a></span>' +
                          '<textarea class="form-control" id="' + name + '_description" rows="4"></textarea>' +
                        '</div>' +
                        (supportsTooltips ? '' +
                          '<div class="checkbox">' +
                            '<label>' +
                              '<input onchange="FulcrumStyler.ui.steps.addAndCustomizeData.handlers.changeEnableTooltips(this);return false;" type="checkbox" value="tooltips"> Enable tooltips?' +
                            '</label>' +
                          '</div>' +
                          '<div class="form-group">' +
                            '<span><label for="' + name + '_tooltip">Tooltip</label><a href="https://fulcrumapp.github.io/fulcrum-styler/popups-and-tooltips.html" target="_blank"><img data-container="body" data-placement="bottom" rel="tooltip" src="assets/img/help@2x.png" style="cursor:pointer;float:right;height:18px;" title="Tooltips display when the cursor moves over a shape. HTML and Handlebars templates are allowed. Click for more info."></a></span>' +
                            '<input class="form-control" id="' + name + '_tooltip" type="text" disabled></input>' +
                          '</div>' +
                        '' : '') +
                      '</fieldset>' +
                    '</form>' +
                    '<div style="text-align:center;">' +
                      '<button class="btn btn-primary" onclick="FulcrumStyler.ui.steps.addAndCustomizeData.handlers.clickApplyInteractivity(\'' + name + '\',\'' + overlay.name + '\');" type="button">Apply</button><button class="btn btn-default" onclick="FulcrumStyler.ui.steps.addAndCustomizeData.handlers.cancelApplyInteractivity();" style="margin-left:5px;">Cancel</button>' +
                    '</div>' +
                  '';

                  $el.popover({
                    animation: false,
                    container: 'body',
                    content: html,
                    html: true,
                    placement: 'right',
                    title: null,
                    trigger: 'manual'
                  })
                    .on('hide.bs.popover', function() {
                      $activeConfigureInteractivityButton = null;
                    })
                    .on('shown.bs.popover', function() {
                      var config;

                      overlay = NPMap.overlays[0], //getLayerIndexFromButton(el)];
                      config = overlay.popup;
                      $activeConfigureInteractivityButton = $el;
                      $('#mask').show();

                      if (config) {
                        if (typeof config === 'object') {
                          if (typeof config.description === 'string') {
                            $('#' + name + '_description').val(unescapeHtml(config.description));
                          }

                          if (typeof config.title === 'string') {
                            $('#' + name + '_title').val(unescapeHtml(config.title));
                          }

                          if (typeof config.width === 'number') {
                            $('#' + name + '_autoWidth').prop('checked', false).trigger('change');
                            $('#' + name + '_fixedWidth').val(config.width);
                          }
                        } else if (typeof config === 'string') {
                          // TODO: Legacy. Can be taken out when all maps are using objects to configure popups.
                          var div = document.createElement('div'),
                            d, t;

                          div.innerHTML = unescapeHtml(config);

                          for (var i = 0; i < div.childNodes.length; i++) {
                            var $childNode = $(div.childNodes[i]);

                            if ($childNode.hasClass('title')) {
                              t = $childNode.html();
                            } else if ($childNode.hasClass('content')) {
                              d = $childNode.html();
                            }
                          }

                          if (t) {
                            $('#' + name + '_title').val(t);
                          }
                        }

                        config = overlay.tooltip;
                       
                        if (config) {
                          $($('#' + name + '_layer-configure-interactivity .checkbox input')[0]).prop('checked', true).trigger('change');
                          $('#' + name + '_tooltip').val(unescapeHtml(config));
                        }
                      }

                      FulcrumStyler.buildTooltips();
                    });
                  $el.popover('show');
                  $('.popover.right.in').css({
                    'z-index': 1031
                  });
                  $el.data('popover-created', true);
                  $activeConfigureInteractivityButton = $el;
                }
              },
              clickLayerEdit: function(el) {
                var index = getLayerIndexFromButton(el);

                function callback() {
                  FulcrumStyler.ui.modal.addLayer._load(NPMap.overlays[index]);
                  FulcrumStyler.ui.modal.addLayer._editingIndex = index;
                  $modalAddLayer.off('shown.bs.modal', callback);
                }

                if ($modalAddLayer) {
                  $modalAddLayer
                    .on('shown.bs.modal', callback)
                    .modal('show');
                } else {
                  FulcrumStyler._pendingLayerEditIndex = index;
                  loadModule('FulcrumStyler.ui.modal.addLayer', function() {
                    $modalAddLayer = $('#modal-addLayer');
                    callback();
                  });
                }
              },
              clickLayerRemove: function(el) {
                FulcrumStyler.showConfirm('Yes, remove the overlay', 'Once the overlay is removed, you cannot get it back.', 'Are you sure?', function() {
                  FulcrumStyler.ui.steps.addAndCustomizeData.removeLi(el);
                  FulcrumStyler.removeOverlay(getLayerIndexFromButton(el));
                });
              }
            },
            filterColors: function(color) {
              var $icon = $('.marker-symbol'),
                keep = (tinycolor(color).isDark() ? 'White' : 'Black'),
                remove = keep === 'White' ? 'black' : 'white',
                value = $icon.val();

              optionsLettersFiltered = [];
              optionsNpmakiFiltered = [];
              optionsNumbersFiltered = [];

              $.each(optionsLettersAll, function(i, option) {
                if (option.indexOf(keep) > -1) {
                  optionsLettersFiltered.push(option.replace('Letter \'', '').replace('\' (' + keep + ')', ''));
                }
              });
              $.each(optionsNpmakiAll, function(i, option) {
                if (option.indexOf(keep) > -1) {
                  optionsNpmakiFiltered.push(option.replace(' (' + keep + ')', ''));
                }
              });
              $.each(optionsNumbersAll, function(i, option) {
                if (option.indexOf(keep) > -1) {
                  optionsNumbersFiltered.push(option.replace('Number \'', '').replace('\' (' + keep + ')', ''));
                }
              });

              switch ($('.marker-library').val().toLowerCase()) {
              case 'letters':
                $icon.html(optionsLettersFiltered.join(''));
                break;
              case 'npmaki':
                $icon.html(optionsNpmakiFiltered.join(''));
                break;
              case 'numbers':
                $icon.html(optionsNumbersFiltered.join(''));
                break;
              }

              if (value) {
                $icon.val(value.replace(remove, keep.toLowerCase()));
              }
            },
            init: function() {
              $('.dd').nestable({
                handleClass: 'letter',
                listNodeName: 'ul'
              })
                .on('change', function() {
                  debugger;
                  var children = $ul.children(),
                    overlays = [];

                  if (children.length > 1) {
                    $.each(children, function(i, li) {
                      var from = $.inArray($($(li).children('.letter')[0]).text(), abcs);

                      if (from !== i) {
                        overlays.splice(i, 0, NPMap.overlays[from]);
                      } else {
                        overlays.push(NPMap.overlays[from]);
                      }
                    });

                    if (overlays.length) {
                      NPMap.overlays = overlays;
                      FulcrumStyler.updateMap();
                    }

                    FulcrumStyler.ui.steps.addAndCustomizeData.refreshUl();
                  }
                });

              $('#addAnotherLayer, #addLayer').on('click', function() {
                if ($modalAddLayer) {
                  $modalAddLayer.modal('show');
                } else {
                  loadModule('FulcrumStyler.ui.modal.addLayer', function() {
                    $modalAddLayer = $('#modal-addLayer');
                  });
                }
              });
              $('#editBaseMaps, #editBaseMapsAgain').on('click', function() {
                if ($modalEditBaseMaps) {
                  $modalEditBaseMaps.modal('show');
                } else {
                  loadModule('FulcrumStyler.ui.modal.editBaseMaps', function() {
                    $modalEditBaseMaps = $('#modal-editBaseMaps');
                  });
                }
              });
              // $('#filterLayer, #filterLayerAgain').on('click', function() {
              //   if ($modalfilterLayer) {
              //     $modalfilterLayer.modal('show');
              //   } else {
              //     loadModule('FulcrumStyler.ui.modal.filterLayer', function() {
              //       $modalfilterLayer = $('#modal-filterLayer');
              //     });
              //   }
              // });
            },
            load: function() {
              if ($.isArray(NPMap.overlays)) {
                if (!NPMap.overlays[0]){
                  $.each(NPMap.overlays, function(i, overlay) {
                    FulcrumStyler.ui.steps.addAndCustomizeData.overlayToLi(overlay);
                  });
                }
              }
            },
            overlayToLi: function(overlay) {
              var interactive = (overlay.type !== 'tiled' && (typeof overlay.clickable === 'undefined' || overlay.clickable === true)),
                styleable = (overlay.type === 'cartodb' || overlay.type === 'csv' || overlay.type === 'geojson' || overlay.type === 'kml' || overlay.type === 'spot'),
                index;

              if (!$layers.is(':visible')) {
                $layers.prev().hide();
                $('#customize .content').css({
                  padding: 0
                });
                $layers.show();
              }

              index = $layers.children().length;
              $layers.append($('<li class="dd-item">').html('' +
                '<div class="letter">' + abcs[index] + '</div>' +
                '<div class="details">' +
                  '<span class="name">' + overlay.name + '</span>' +
                  '<span class="description">' + (overlay.description || '') + '</span>' +
                  '<div class="actions">' +
                    '<div style="float:left;">' +
                      '<button class="btn btn-default btn-xs" data-container="section" onclick="FulcrumStyler.ui.steps.addAndCustomizeData.handlers.clickLayerEdit(this);" type="button">' +
                        '<span class="fa fa-edit"> Edit</span>' +
                      '</button>' +
                    '</div>' +
                    '<div style="float:right;">' +
                      '<button class="btn btn-default btn-xs interactivity" data-container="section" data-placement="bottom" onclick="FulcrumStyler.ui.steps.addAndCustomizeData.handlers.clickLayerConfigureInteractivity(this);" rel="tooltip" style="' + (interactive ? '' : 'display:none;') + 'margin-right:5px;" title="Configure Interactivity" type="button">' +
                        '<span class="fa fa-comment"></span>' +
                      '</button>' +
                      '<button class="btn btn-default btn-xs" data-container="section" data-placement="bottom" onclick="FulcrumStyler.ui.steps.addAndCustomizeData.handlers.clickLayerChangeStyle(this);" rel="tooltip" style="' + (styleable ? '' : 'display:none;') + 'margin-right:5px;" title="Change Style" type="button">' +
                        '<span class="fa fa-map-marker"></span>' +
                      '</button>' +
                      '<button class="btn btn-default btn-xs" data-container="section" data-placement="bottom" onclick="FulcrumStyler.ui.steps.addAndCustomizeData.handlers.clickLayerRemove(this);" rel="tooltip" title="Delete Overlay" type="button">' +
                        '<span class="fa fa-trash-o"></span>' +
                      '</button>' +
                    '</div>' +
                  '</div>' +
                '</div>' +
              ''));
              FulcrumStyler.ui.steps.addAndCustomizeData.refreshUl();
            },
            refreshUl: function() {
              var children = $ul.children(),
                previous = $ul.parent().prev();

              if (children.length === 0) {
                $buttonAddAnotherLayer.hide();
                $buttonEditBaseMapsAgain.hide();
                previous.show();
              } else {
                $buttonAddAnotherLayer.show();
                $buttonEditBaseMapsAgain.show();
                previous.hide();
                $.each(children, function(i, li) {
                  $($(li).children('.letter')[0]).text(abcs[i]);
                  debugger;
                });
              }
            },
            removeLi: function(el) {
              $($(el).parents('li')[0]).remove();
              FulcrumStyler.ui.steps.addAndCustomizeData.refreshUl();
            },
            updateOverlayLetters: function() {}
          },
          setCenterAndZoom: {
            init: function() {
              var buttonBlocks = $('#set-center-and-zoom .buttons');

              $(buttonBlocks[1]).on('click', function() {
                var map = getLeafletMap(),
                  center = map.getCenter();

                NPMap.center = {
                  lat: center.lat,
                  lng: center.lng
                };
                NPMap.zoom = map.getZoom();

                updateInitialCenterAndZoom();
                this.style.backgroundColor = '';
                $('#fulcrum-zoom:hover').css('background-color','#ddd');
                FulcrumStyler.updateMap();
              });
              $(buttonBlocks[2]).on('click', function() {
                var center = getLeafletMap().getCenter();

                NPMap.center = {
                  lat: center.lat,
                  lng: center.lng
                };
                updateInitialCenterAndZoom();
                FulcrumStyler.updateMap();
              });
              $(buttonBlocks[3]).on('click', function() {
                NPMap.zoom = getLeafletMap().getZoom();
                updateInitialCenterAndZoom();
                FulcrumStyler.updateMap();
              });
              $(buttonBlocks[4]).on('click', function() {
                var $this = $(this);

                if ($this.hasClass('active')) {
                  delete NPMap.maxBounds;
                  $this.removeClass('active').text('Restrict Bounds');
                  $this.next().hide();
                } else {
                  var bounds = getLeafletMap().getBounds(),
                    northEast = bounds.getNorthEast(),
                    southWest = bounds.getSouthWest();

                  NPMap.maxBounds = [
                    [southWest.lat, southWest.lng],
                    [northEast.lat, northEast.lng]
                  ];

                  $(this).addClass('active').text('Remove Bounds Restriction');
                  $this.next().show();
                }

                FulcrumStyler.updateMap();
              });
    
              $('input#set-zoom').slider({
                max: 19,
                min: 0,
                value: [typeof NPMap.minZoom === 'number' ? NPMap.minZoom : 0, typeof NPMap.maxZoom === 'number' ? NPMap.maxZoom : 19]
              })
                .on('slideStop', function(e) {
                  NPMap.maxZoom = e.value[1];
                  NPMap.minZoom = e.value[0];
                  FulcrumStyler.updateMap();
                });
            },
            load: function() {
              updateInitialCenterAndZoom();

              if (typeof NPMap.maxBounds === 'object') {
                var $bounds = $($('#set-center-and-zoom .btn-block')[3]);

                $bounds.addClass('active').text('Remove Bounds Restriction');
                $bounds.next().show();
              }
            }
          },
          init: function() {
            $.each($('form'), function(i, form) {
              $.each($(form).find('input'), function(j, input) {
                $(input).on('change', function() {
                  var checked = $(this).prop('checked'),
                    value = this.value;
                    if (value === 'overviewControl') {
                      if (checked) {
                        NPMap[value] = {
                          layer: (function() {
                            for (var i = 0; i < NPMap.baseLayers.length; i++) {
                              var baseLayer = NPMap.baseLayers[0];

                              if (typeof baseLayer.visible === 'undefined' || baseLayer.visible === true) {
                                return baseLayer;
                              }
                            }
                          })()
                        };
                      } else {
                        NPMap[value] = false;
                      }
                    } else {
                      NPMap[value] = checked;
                    }

                    FulcrumStyler.updateMap();
                  });
                });
              });
          },
          load: function() {
            $.each($('form'), function(i, form) {
              $.each($(form).find('input'), function(j, input) {
                var $input = $(input),
                  name = $input.attr('value'),
                  property = NPMap[name];

                if (typeof property !== 'undefined') {
                  $input.attr('checked', property);
                }
              });
            });
          }
        },
        toolbar: {
          handlers: {
            clickSettings: function(el) {
              $(el).parents('.popover').css({
                'z-index': settingsZ
              });
              $('#mask').hide();
              $($('#button-settings span')[2]).popover('hide');
              settingsSet = true;
            }
          },
          init: function() {
            $('#export').on('click', function(){
              saveMap();
              $('.content').css('display', 'none')
              $('#map').css('left','0px');
              $('#map').css('right','230px');
              $('#export-panel').css('display', 'block');
              $('#cluster-options').css('display', 'none');

              $('.ssk').click(function(){
                $('.ssk-facebook')[0].href = 'http://www.facebook.com/share.php?u=http%3A%2F%2Fbl.ocks.org%2Fanonymous%2Fraw%2F' + App.id;
                $('.ssk-twitter')[0].href = 'https://twitter.com/intent/tweet?text=This%20is%20the%20data%20we%20have%20collected:&url=http%3A%2F%2Fbl.ocks.org%2Fanonymous%2Fraw%2F' + App.id;
                $('.ssk-email').href = 'mailto:?subject=|Data collected with Fulcrum|';
                window.open($(this).attr('href'),'Data collected with Fulcrum','toolbar=0,resizable=1,status=0,width=640,height=528');
                return false;
              });
            });
            $('#goback').on('click', function(){
              $('.content').css('display', 'block')
              $('#map').css('left','266px');
              $('#map').css('right','0px');
              $('#export-panel').css('display', 'none');
            });

            $buttonExport.on('click', function() {
              if ( $('#sharing-code').is(':hidden') ) {
                $('#sharing-code').slideDown('fast');
                $('#generate-result').val('<iframe height="500px" frameBorder="0" width="100%" src="http://bl.ocks.org/anonymous/raw/' + App.id + '"></iframe>').select();
              } else {
                $('#sharing-code').hide();
              }
            });

            $('#button-refresh').on('click', function() {
              FulcrumStyler.updateMap(null, true);
            });
            $('#button-save').on('click', saveMap);
          }
        }
      },
      addOverlay: function(overlay) {
        NPMap.overlays.push(overlay);
        FulcrumStyler.ui.steps.addAndCustomizeData.overlayToLi(overlay);
      },
      buildTooltips: function() {
        $('[rel=tooltip]').tooltip({
          animation: false
        });
      },
      hideLoading: function() {
        $('#loading').hide();
        document.body.removeChild(document.getElementById('loading-backdrop'));
      },
      removeOverlay: function(index) {
        NPMap.overlays.splice(index, 1);
        this.updateMap();
      },
      showConfirm: function(button, content, t, callback) {
        $($modalConfirm.find('.btn-primary')[0]).html(button).on('click', function() {
          $modalConfirm.modal('hide');
          callback();
        });
        $($modalConfirm.find('.modal-body')[0]).html(content);
        $($modalConfirm.find('h4')[0]).html(t);
        $modalConfirm.modal('show');
      },
      showLoading: function() {
        var div = document.createElement('div');
        div.className = 'modal-backdrop in';
        div.id = 'loading-backdrop';
        document.body.appendChild(div);
        $('#loading').show();
      },
      updateMap: function(callback, manualRefresh) {
        var interval;

        $iframe.attr('src', 'iframe.html');

        interval = setInterval(function() {
          var npmap = document.getElementById('iframe-map').contentWindow.NPMap;

          if (npmap && npmap.config && npmap.config.L) {
            clearInterval(interval);
              
            if (typeof callback === 'function') {
              callback(npmap.config);
            }
            var iframe = document.getElementById('iframe-map'),
              bottom = iframe.contentDocument.getElementsByClassName('leaflet-control-attribution')[0], 
              disclaimer = bottom.getElementsByTagName('a')[0].innerHTML = '';

            if (!manualRefresh) {
              if (firstLoad) {
                firstLoad = false;
              } else {

                enableSave();
                var iframe = document.getElementById('iframe-map'),
              bottom = iframe.contentDocument.getElementsByClassName('leaflet-control-attribution')[0], 
              disclaimer = bottom.getElementsByTagName('a')[0];
              disclaimer.innerHTML = '';
              }
            }
          }
        }, 0);
      }
    };
  })();

  FulcrumStyler.ui.steps.addAndCustomizeData.init();
  FulcrumStyler.ui.steps.setCenterAndZoom.init();
  FulcrumStyler.ui.init();
  FulcrumStyler.ui.steps.init();
  FulcrumStyler.ui.toolbar.init();

  if (mapId) {
    FulcrumStyler.ui.steps.addAndCustomizeData.load();
    FulcrumStyler.ui.steps.load();
    FulcrumStyler.ui.steps.setCenterAndZoom.load();
    delete NPMap.created;
    delete NPMap.isPublic;
    delete NPMap.isShared;
    delete NPMap.modified;
    delete NPMap.tags;
  }

  FulcrumStyler.buildTooltips();
  FulcrumStyler.updateMap();
}

var App = {
  mapId: decodeURI((RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]),
  title: ''
}

if (App.mapId === 'null' || App.mapId === 'fulcrum-data-id') {
  $('#mask').show();
  alertify.error('Please enter your fulcrum data share id at the end of the URL: \'?id=<i>data-share number</i>\'');
} else if (App.mapId) {
  alertify.success('Welcome to the Styler.  Zoom to your Fulcrum layer and begin styling!');
  NPMap = {
    baseLayers: [
      'cartodb-positron'
    ],
    center: {
      lat: 0,
      lng: 0
    },
    div: 'map',
    overlays: [{
      name: App.title,
      type: 'geojson',
      url: 'https://web.fulcrumapp.com/shares/' + App.mapId + '.geojson'
    }],
    homeControl: {
      position: 'topright'
    },
     smallzoomControl: {
      position: 'topright'
    },
    zoom: 2
  };
  ready();
}
