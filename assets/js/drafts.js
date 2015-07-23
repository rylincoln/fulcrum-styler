/* global tinycolor, L, NPMap */

(function() {
  var s = document.createElement('script');
   s.src = 'http://www.nps.gov/lib/npmap.js/2.0.0/npmap-bootstrap.js';
  document.body.appendChild(s);
})();

var NPMap,
  App = {
  init: function (){
    $('body').append('<div class="navbar navbar-inverse navbar-fixed-top" role="navigation">'+
      '<div class="container-fluid">'+
        '<div class="navbar-header">'+
          '<div class="navbar-icon-container">'+
            '<a href="#" class="navbar-icon pull-right visible-xs" id="nav-btn"><i class="fa fa-bars fa-lg white"></i></a>'+
          '</div>'+
          '<a class="navbar-brand" href="#" name="title" id="navbar-title">Fulcrum Styler</a>'+
        '</div>'+
        '<div class="navbar-collapse collapse">'+
          '<ul class="nav navbar-nav">'+
            '<li class="hidden-xs"><a href="#" data-toggle="collapse" data-target=".navbar-collapse.in" id="button-editBaseMaps"><i class="fa fa-edit white"></i>&nbsp;&nbsp;Change Basemaps</a></li>'+
            '<li class="hidden-xs"><a href="#" data-toggle="collapse" data-target=".navbar-collapse.in" id="button-createDataset"><i class="fa fa-map-marker white"></i>&nbsp;&nbsp;Style Your Layer</a></li>'+
            '<li class="hidden-xs"><a href="#" data-toggle="collapse" data-target=".navbar-collapse.in" id="button-addAnotherLayer"><i class="fa fa-map-marker white"></i>&nbsp;&nbsp;Add Another Layer</a></li>'+
            '<li class="dropdown">'+
                '<a class="dropdown-toggle" id="downloadDrop" href="#" role="button" data-toggle="dropdown"><i class="fa fa-refresh white"></i>&nbsp;&nbsp;Refresh <b class="caret"></b></a>'+
                '<ul class="dropdown-menu dropdown-menu-form">'+
                  '<li><a href="#" id="refresh-btn" data-toggle="collapse" data-target=".navbar-collapse.in"><i class="fa fa-refresh"></i>&nbsp;&nbsp;Refresh Now</a></li>'+
                  '<li class="dropdown-input"><input type="checkbox" id="auto-refresh">&nbsp;&nbsp;Auto Refresh (every minute)</li>'+
                '</ul>'+
            '</li>'+
          '</ul>'+
          '<ul class="nav navbar-nav navbar-right">'+
            '<li class="dropdown">'+
              '<a href="#" role="button" class="dropdown-toggle" data-toggle="dropdown"><i class="fa fa-share white"></i>&nbsp;&nbsp;Share<b class="caret"></b></a>'+
              '<ul class="dropdown-menu" style="padding: 10px; min-width: 100px;">'+
              '<div class="ssk-group ssk-count">'+
                '<a href="" class="ssk ssk-facebook"></a>'+
                '<a href="" class="ssk ssk-twitter"></a>'+
                '<a href="" class="ssk ssk-google-plus"></a>'+
                '<a href="" class="ssk ssk-linkedin"></a>'+
                '<a href="" class="ssk ssk-email"></a>'+
              '</div>'+
              '</ul>'+
            '</li>'+
          '</ul>'+
        '</div>'+
      '</div>'+
    '</div>'+
    '<div class="modal fade" id="featureModal" tabindex="-1" role="dialog">'+
      '<div class="modal-dialog">'+
        '<div class="modal-content">'+
          '<div class="modal-header">'+
            '<button class="close" type="button" data-dismiss="modal" aria-hidden="true">&times;</button>'+
            '<h4 class="modal-title text-primary" id="feature-title"></h4>'+
          '</div>'+
          '<div class="modal-body" id="feature-info"></div>'+
          '<div class="modal-footer">'+
            '<div class="btn-group pull-left">'+
              '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" id="share-btn">'+
                '<i class="fa fa-share"></i>&nbsp;Share&nbsp;<span class="caret"></span>'+
              '</button>'+
              '<ul class="dropdown-menu" role="menu">'+
              '<div class="ssk-group ssk-count">'+
                '<a href="" class="ssk ssk-facebook"></a>'+
                '<a href="" class="ssk ssk-twitter"></a>'+
                '<a href="" class="ssk ssk-google-plus"></a>'+
                '<a href="" class="ssk ssk-linkedin"></a>'+
                '<a href="" class="ssk ssk-email"></a>'+
                '<a href="" class="ssk ssk-"></a>'+
              '</div>'+
              '</ul>'+
            '</div>'+
            '<button type="button" class="btn btn-primary" data-dismiss="modal">Close</button>'+
          '</div>'+
        '</div>'+
      '</div>'+
    '</div>');
  },
  mapId: document.location.search.replace('?id=', '')
}

function ready() {
  FulcrumStyler = (function() {
    var $activeChangeStyleButton = null,
      $activeConfigureInteractivityButton = null,
      $buttonAddAnotherLayer = $('#button-addAnotherLayer'),
      $buttonCreateDatasetAgain = $('#button-createDatasetAgain'),
      $buttonEditBaseMapsAgain = $('#button-editBaseMapsAgain'),
      $buttonExport = $('#button-export'),
      $buttonSave = $('#button-save'),
      $mappy = $('#map'),
      $lat = $('.lat'),
      $lng = $('.lng'),
      $layers = $('#layers'),
      $modalConfirm = $('#modal-confirm'),
      $modalSignIn = $('#modal-signin'),
      $stepSection = $('section .step'),
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
      // stepLis = $('#steps li'),
      title = null,
      titleSet = false,
      titleZ = null,
      $modalAddLayer, $modalEditBaseMaps, $modalExport, $modalViewConfig;

    function disableSave() {
      $buttonSave.prop('disabled', true);
      $buttonExport.text('Export Map');
    }
    function enableSave() {
      $buttonSave.prop('disabled', false);
      $buttonExport.text('Save & Export Map');
    }
    function escapeHtml(unsafe) {
      return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
        //.replace(/'/g, '&#039;');
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
                      '<select class="form-control marker-library" id="' + getName('marker-library', 'point') + '" onchange="FulcrumStyler.ui.steps.handlers.changeMarkerLibrary(this);return false;">' +
                        '<option value="letters">Letters</option>' +
                        '<option value="maki">Maki</option>' +
                        '<option value="npmaki">NPMaki</option>' +
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
        var disabled = geometryTypes.indexOf(id) === -1,
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
        $.each(document.getElementById('map').contentWindow.L.npmap.preset.colors, function(prop, value) {
          // TODO: Use prop too.
          colors.push(value.color);
        });
      }

      if (!optionsMaki.length) {
        sortable = [];
        $.each(document.getElementById('map').contentWindow.L.npmap.preset.maki, function(prop, value) {
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
        $.each(document.getElementById('map').contentWindow.L.npmap.preset.npmaki, function(prop, value) {
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
      return '' +
        '<form class="change-style form-horizontal" id="' + name + '_layer-change-style" role="form">' +
          '<ul class="nav nav-tabs" style="padding-left:5px;">' +
            createTab('point', 'Point') +
            createTab('line', 'Line') +
            createTab('polygon', 'Polygon') +
          '</ul>' +
          '<div class="tab-content">' +
            createPanel('point') +
            createPanel('line') +
            createPanel('polygon') +
          '</div>' +
        '</form>' +
      '';
    }
    function getLayerIndexFromButton(el) {
      return $.inArray($(el).parent().parent().parent().prev().text(), abcs);
    }
    function getLeafletMap() {
      return document.getElementById('map').contentWindow.NPMap.config.L;
    }
    function goToStep(from, to) {
      $($stepSection[from]).hide();
      $($stepSection[to]).show();
      $(stepLis[from]).removeClass('active');
      $(stepLis[to]).addClass('active');
    }
    function loadModule(module, callback) {
      module = module.replace('FulcrumStyler.', '').replace(/\./g,'/');
      debugger;
      $.ajax({
        dataType: 'html',
        success: function (html) {
          $('body').append(html);
          $.getScript(module + '.js', function() {
            if (callback) {
              debugger;
              callback();
            }
          });
        },
        url: module + '.html'
      });
      console.log(module + '.html')
    }
    function saveMap(callback) {
      var $this = $(this);

      FulcrumStyler.showLoading();
      $this.blur();
      $.ajax({
        data: {
          description: description,
          isPublic: true,
          isShared: true,
          json: JSON.stringify(NPMap),
          mapId: App.mapId || null,
          name: title
        },
        dataType: 'json',
        error: function() {
          FulcrumStyler.hideLoading();
          // alertify.error('You must be connected to the National Park Service network to save a map.');

          if (typeof callback === 'function') {
            callback(false);
          }
        },
        success: function(response) {
          // var error = 'Sorry, there was an unhandled error while saving your map. Please try again.',
            var success = false;

          FulcrumStyler.hideLoading();

          if (response) {
            if (response.success === true) {
              if (!App.mapId && window.history.replaceState) {
                var location = window.location,
                  url = location.protocol + '//' + location.host + location.pathname + '?mapId=' + response.mapId;

                window.history.replaceState({
                  path: url
                }, '', url);
              }

              App.mapId = response.mapId;
              updateSaveStatus(response.modified);
              alertify.success('Your map was saved!');
              success = true;
            } else if (response.success === false && response.error) {
              if (response.type === 'login') {
                $modalSignIn.modal('show');
              } else {
                alertify.error(response.error);
              }
            } else {
              alertify.error(error);
            }
          } else {
            alertify.error(error);
          }

          if (typeof callback === 'function') {
            callback(success);
          }
        },
        type: 'POST',
        url: '/FulcrumStyler/save/'
      });
    }
    function unescapeHtml(unsafe) {
      return unsafe
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '\"');
        //.replace(/&#039;/g, '\'');
    }
    function updateInitialCenterAndZoom() {
      // debugger;
      if (NPMap.config){
        $lat.html(NPMap.config.center.lat.toFixed(2));
        $lng.html(NPMap.config.center.lng.toFixed(2));
        $zoom.html(NPMap.zoom);
      }
    }
    function updateSaveStatus(date) {
      $('.info-saved p').text('Saved ' + moment(date).format('MM/DD/YYYY') + ' at ' + moment(date).format('h:mm:ssa'));
      $('.info-saved').show();
      disableSave();
    }
    // $(document).ready(function() {
    //   if (mapId) {
    //     descriptionSet = true;
    //     settingsSet = true;
    //     titleSet = true;
    //   } else {
    //     setTimeout(function() {
    //       $('#metadata .title a').editable('toggle');
    //     }, 200);
    //   }
    // });
    return {
      _afterUpdateCallbacks: {},
      _defaultStyles: {
        line: {
          'stroke': '#d39800',
          'stroke-opacity': 0.8,
          'stroke-width': 3
        },
        point: {
          'marker-color': '#FFCCFF',
          'marker-library': 'maki',
          'marker-size': 'small',
          'marker-symbol': null
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
      ui: {
        // app: {
          // init: function() {
            // var backButtons = $('section .step .btn-link'),
            //   eventMethod = window.addEventListener ? 'addEventListener' : 'attachEvent',
            //   eventer = window[eventMethod],
            //   messageEvent = eventMethod === 'attachEvent' ? 'onmessage' : 'message',
            //   stepButtons = $('section .step .btn-primary');

            // eventer(messageEvent, function(e) {
            //   if (e.data === 'logged_in') {
            //     $modalSignIn.modal('hide');
            //     alertify.log('You are now logged in. Please try to save again.', 'success', 6000);
            //   }
            // }, false);

        //     /*
        //     Dropzone.options.dropzone = {
        //       accept: function(file, done) {
        //         console.log(file);
        //         done();
        //       },
        //       clickable: false,
        //       createImageThumbnails: false,
        //       maxFilesize: 5,
        //       uploadMultiple: false
        //     };
        //     */
          //   $modalSignIn.modal({
          //     show: false
          //   })
          //     .on('hidden.bs.modal', function() {
          //       $($('#modal-signin .modal-body')[0]).html(null);
          //     })
          //     .on('shown.bs.modal', function() {
          //       $($('#modal-signin .modal-body')[0]).html('<iframe id="iframe" src="https://insidemaps.nps.gov/account/logon/?iframe=true" style="height:202px;"></iframe>');
          //     });
          //   $(backButtons[0]).on('click', function() {
          //     goToStep(1, 0);
          //   });
          //   $(backButtons[1]).on('click', function() {
          //     goToStep(2, 1);
          //   });
          //   $(stepButtons[0]).on('click', function() {
          //     goToStep(0, 1);
          //   });
          //   $(stepButtons[1]).on('click', function() {
          //     goToStep(1, 2);
          //   });
          //   $.each(stepLis, function(i, li) {
          //     $(li.childNodes[0]).on('click', function() {
          //       var currentIndex = -1;

          //       for (var j = 0; j < stepLis.length; j++) {
          //         if ($(stepLis[j]).hasClass('active')) {
          //           currentIndex = j;
          //           break;
          //         }
          //       }

          //       if (currentIndex !== i) {
          //         goToStep(currentIndex, i);
          //       }
          //     });
          //   });
          // }
        // },
        // metadata: {
        //   init: function() {
        //     description = NPMap.description;
        //     firstLoad = true;
        //     title = NPMap.name;

        //     $('#metadata .description a').text(description).editable({
        //       animation: false,
        //       container: '#metadata div.info',
        //       emptytext: 'Add a description to give your map context.',
        //       validate: function(value) {
        //         if ($.trim(value) === '') {
        //           return 'Please enter a description for your map.';
        //         }
        //       }
        //     })
        //       .on('hidden', function() {
        //         var newDescription = $('#metadata .description a').text(),
        //           next = $(this).next();

        //         if (descriptionSet) {
        //           if (newDescription !== description) {
        //             enableSave();
        //           }
        //         } else {
        //           $($('#button-settings span')[2]).popover('show');

        //           next.css({
        //             'z-index': descriptionZ
        //           });
        //           $(next.find('button')[1]).css({
        //             display: 'block'
        //           });
        //           descriptionSet = true;

        //           if (!settingsSet) {
        //             next = $('#metadata .buttons .popover');
        //             settingsZ = next.css('z-index');
        //             next.css({
        //               'z-index': 1031
        //             });
        //             $('#metadata .buttons .popover button').focus();
        //           }
        //         }

        //         description = newDescription;
        //         NPMap.description = description;
        //       })
        //       .on('shown', function() {
        //         var next = $(this).parent().next();

        //         if (!descriptionSet) {
        //           descriptionZ = next.css('z-index');
        //           next.css({
        //             'z-index': 1031
        //           });
        //           $(next.find('button')[1]).css({
        //             display: 'none'
        //           });
        //         }

        //         next.find('textarea').css({
        //           'resize': 'none'
        //         });
        //       });
        //     $('#metadata .title a').text(title).editable({
        //       animation: false,
        //       emptytext: 'Untitled Map',
        //       validate: function(value) {
        //         if ($.trim(value) === '') {
        //           return 'Please enter a title for your map.';
        //         }
        //       }
        //     })
        //       .on('hidden', function() {
        //         var newDescription = $('#metadata .description a').text(),
        //           newTitle = $('#metadata .title a').text(),
        //           next = $(this).next();

        //         if (!newDescription || newDescription === 'Add a description to give your map context.') {
        //           $('#metadata .description a').editable('toggle');
        //         } else {
        //           if (newTitle !== title) {
        //             enableSave();
        //           }
        //         }

        //         if (!titleSet) {
        //           next.css({
        //             'z-index': titleZ
        //           });
        //           $(next.find('button')[1]).css({
        //             display: 'block'
        //           });
        //           titleSet = true;
        //         }

        //         title = newTitle;
        //         NPMap.name = title;
        //       })
        //       .on('shown', function() {
        //         var next = $(this).next();

        //         if (!titleSet) {
        //           titleZ = next.css('z-index');
        //           next.css({
        //             'z-index': 1031
        //           });
        //           $(next.find('button')[1]).css({
        //             display: 'none'
        //           });
        //         }

        //         next.find('.editable-clear-x').remove();
        //         next.find('input').css({
        //           'padding-right': '10px'
        //         });
        //       });
        //   },
        //   load: function() {
        //     if (NPMap.description) {
        //       $('#metadata .description a').text(NPMap.description);
        //     }

        //     if (NPMap.name) {
        //       $('#metadata .title a').text(NPMap.name);
        //     }

        //     updateSaveStatus(NPMap.modified);
        //   }
        // },
        steps: {
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
                overlay;

              for (var i = 0; i < NPMap.overlays.length; i++) {
                var o = NPMap.overlays[i];

                if (o.name === overlayName) {
                  overlay = o;
                  break;
                }
              }

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
                i, overlay;

              for (i = 0; i < NPMap.overlays.length; i++) {
                var o = NPMap.overlays[i];

                if (o.name === overlayName) {
                  overlay = o;
                  break;
                }
              }

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
            clickLayerChangeStyle: function(el) {
              var $el = $(el);

              if ($el.data('popover-created')) {
                $el.popover('toggle');
              } else {
                var layer = document.getElementById('map').contentWindow.NPMap.config.overlays[getLayerIndexFromButton(el)],
                  overlay = NPMap.overlays[getLayerIndexFromButton(el)],
                  name = overlay.name.split(' ').join('_');

                $el.popover({
                  animation: false,
                  container: 'body',
                  content: '' +
                    generateLayerChangeStyle(name, layer) +
                    '<div style="text-align:center;">' +
                      '<button class="btn btn-primary" onclick="FulcrumStyler.ui.steps.handlers.clickApplyStyles(\'' + name + '\',\'' + overlay.name + '\');" type="button">Apply</button>' +
                      '<button class="btn btn-default" onclick="FulcrumStyler.ui.steps.handlers.cancelApplyStyles();" style="margin-left:5px;">Cancel</button>' +
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

                      if ($el.attr('id').toLowerCase().indexOf('marker-color') > -1) {
                        obj.onchange = function(container, color) {
                          FulcrumStyler.ui.steps.filterColors(color);
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
                                  FulcrumStyler.ui.steps.filterColors(style['marker-color']);

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
                var overlay = NPMap.overlays[getLayerIndexFromButton(el)],
                  name = overlay.name.split(' ').join('_'),
                  supportsTooltips = (overlay.type === 'cartodb' || overlay.type === 'csv' || overlay.type === 'geojson' || overlay.type === 'kml' || overlay.type === 'mapbox'),
                  html;

                html = '' +
                  // Checkbox here "Display all fields in a table?" should be checked on by default.
                  '<form class="configure-interactivity" id="' + name + '_layer-configure-interactivity" role="form">' +
                    '<fieldset>' +
                      '<div class="form-group">' +
                        '<span><label for="' + name + '_title">Title</label><a href="https://github.com/nationalparkservice/npmap-FulcrumStyler/wiki/Popups-and-Tooltips" target="_blank"><img data-container="body" data-placement="bottom" rel="tooltip" src="assets/img/help@2x.png" style="cursor:pointer;float:right;height:18px;" title="The title will display in bold at the top of the popup. HTML and Handlebars templates are allowed. Click for more info."></a></span>' +
                        '<input class="form-control" id="' + name + '_title" rows="3" type="text"></input>' +
                      '</div>' +
                      '<div class="form-group">' +
                        '<span><label for="' + name + '_description">Description</label><a href="https://github.com/nationalparkservice/npmap-FulcrumStyler/wiki/Popups-and-Tooltips" target="_blank"><img data-container="body" data-placement="bottom" rel="tooltip" src="assets/img/help@2x.png" style="cursor:pointer;float:right;height:18px;" title="The description will display underneath the title. HTML and Handlebars templates are allowed. Click for more info."></a></span>' +
                        '<textarea class="form-control" id="' + name + '_description" rows="4"></textarea>' +
                      '</div>' +
                      (supportsTooltips ? '' +
                        '<div class="checkbox">' +
                          '<label>' +
                            '<input onchange="FulcrumStyler.ui.steps.handlers.changeEnableTooltips(this);return false;" type="checkbox" value="tooltips"> Enable tooltips?' +
                          '</label>' +
                        '</div>' +
                        '<div class="form-group">' +
                          '<span><label for="' + name + '_tooltip">Tooltip</label><a href="https://github.com/nationalparkservice/npmap-FulcrumStyler/wiki/Popups-and-Tooltips" target="_blank"><img data-container="body" data-placement="bottom" rel="tooltip" src="assets/img/help@2x.png" style="cursor:pointer;float:right;height:18px;" title="Tooltips display when the cursor moves over a shape. HTML and Handlebars templates are allowed. Click for more info."></a></span>' +
                          '<input class="form-control" id="' + name + '_tooltip" type="text" disabled></input>' +
                        '</div>' +
                      '' : '') +
                    '</fieldset>' +
                  '</form>' +
                  '<div style="text-align:center;">' +
                    '<button class="btn btn-primary" onclick="FulcrumStyler.ui.steps.handlers.clickApplyInteractivity(\'' + name + '\',\'' + overlay.name + '\');" type="button">Apply</button><button class="btn btn-default" onclick="FulcrumStyler.ui.steps.handlers.cancelApplyInteractivity();" style="margin-left:5px;">Cancel</button>' +
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

                    overlay = NPMap.overlays[getLayerIndexFromButton(el)];
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
                FulcrumStyler.ui.steps.removeLi(el);
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
            // $('.dd').nestable({
            //   handleClass: 'letter',
            //   listNodeName: 'ul'
            // })
            //   .on('change', function() {
            //     var children = $ul.children(),
            //       overlays = [];

            //     if (children.length > 1) {
            //       $.each(children, function(i, li) {
            //         var from = $.inArray($($(li).children('.letter')[0]).text(), abcs);

            //         if (from !== i) {
            //           overlays.splice(i, 0, NPMap.overlays[from]);
            //         } else {
            //           overlays.push(NPMap.overlays[from]);
            //         }
            //       });

            //       if (overlays.length) {
            //         NPMap.overlays = overlays;
            //         FulcrumStyler.updateMap();
            //       }

            //       FulcrumStyler.ui.steps.refreshUl();
            //     }
            //   });
            $('#button-editBaseMaps, #button-editBaseMapsAgain').on('click', function() {
              if ($modalEditBaseMaps) {
                $modalEditBaseMaps.modal('show');
              debugger;
              } else {
                loadModule('FulcrumStyler.ui.modal.editBaseMaps', function() {
                  $modalEditBaseMaps = $('#modal-editBaseMaps');
                });
              }
            });
            $('a#button-addAnotherLayer, a#button-addLayer').on('click', function() {
              if ($modalAddLayer) {
                $modalAddLayer.modal('show');
              } else {
                loadModule('FulcrumStyler.ui.modal.addLayer', function() {
                  $modalAddLayer = $('#modal-addLayer');
                });
              }
            });
            var buttonBlocks = $('#set-center-and-zoom .btn-block');

              $(buttonBlocks[0]).on('click', function() {
                var center = getLeafletMap().getCenter();

                NPMap.center = {
                  lat: center.lat,
                  lng: center.lng
                };
                updateInitialCenterAndZoom();
                FulcrumStyler.updateMap();
              });
              $(buttonBlocks[1]).on('click', function() {
                NPMap.zoom = getLeafletMap().getZoom();
                updateInitialCenterAndZoom();
                FulcrumStyler.updateMap();
              });
              $(buttonBlocks[2]).on('click', function() {
                var map = getLeafletMap(),
                  center = map.getCenter();

                NPMap.center = {
                  lat: center.lat,
                  lng: center.lng
                };
                NPMap.zoom = map.getZoom();

                updateInitialCenterAndZoom();
                FulcrumStyler.updateMap();
              });
              $(buttonBlocks[3]).on('click', function() {
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
              $('#set-zoom').slider({
                //center: 4,
                max: 19,
                min: 0,
                value: [typeof NPMap.minZoom === 'number' ? NPMap.minZoom : 0, typeof NPMap.maxZoom === 'number' ? NPMap.maxZoom : 19]
              })
                .on('slideStop', function(e) {
                  NPMap.maxZoom = e.value[1];
                  NPMap.minZoom = e.value[0];
                  FulcrumStyler.updateMap();
                });
                        $.each($('#tools-and-settings form'), function(i, form) {
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
            if ($.isArray(NPMap.overlays)) {
              $.each(NPMap.overlays, function(i, overlay) {
                FulcrumStyler.ui.steps.overlayToLi(overlay);
              });
            }
            updateInitialCenterAndZoom();

            if (typeof NPMap.maxBounds === 'object') {
              var $bounds = $($('#set-center-and-zoom .btn-block')[3]);

              $bounds.addClass('active').text('Remove Bounds Restriction');
              $bounds.next().show();
            }

            $.each($('#tools-and-settings form'), function(i, form) {
              $.each($(form).find('input'), function(j, input) {
                var $input = $(input),
                  name = $input.attr('value'),
                  property = NPMap[name];

                if (typeof property !== 'undefined') {
                  $input.attr('checked', property);
                }
              });
            });
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
                '<span class="actions">' +
                  '<div style="float:left;">' +
                    '<button class="btn btn-default btn-xs" data-container="section" onclick="FulcrumStyler.ui.steps.handlers.clickLayerEdit(this);" type="button">' +
                      '<span class="fa fa-edit"> Edit</span>' +
                    '</button>' +
                  '</div>' +
                  '<div style="float:right;">' +
                    '<button class="btn btn-default btn-xs interactivity" data-container="section" data-placement="bottom" onclick="FulcrumStyler.ui.steps.handlers.clickLayerConfigureInteractivity(this);" rel="tooltip" style="' + (interactive ? '' : 'display:none;') + 'margin-right:5px;" title="Configure Interactivity" type="button">' +
                      '<span class="fa fa-comment"></span>' +
                    '</button>' +
                    '<button class="btn btn-default btn-xs" data-container="section" data-placement="bottom" onclick="FulcrumStyler.ui.steps.handlers.clickLayerChangeStyle(this);" rel="tooltip" style="' + (styleable ? '' : 'display:none;') + 'margin-right:5px;" title="Change Style" type="button">' +
                      '<span class="fa fa-map-marker"></span>' +
                    '</button>' +
                    '<button class="btn btn-default btn-xs" data-container="section" data-placement="bottom" onclick="FulcrumStyler.ui.steps.handlers.clickLayerRemove(this);" rel="tooltip" title="Delete Overlay" type="button">' +
                      '<span class="fa fa-trash-o"></span>' +
                    '</button>' +
                  '</div>' +
                '</span>' +
              '</div>' +
            ''));
            FulcrumStyler.ui.steps.refreshUl();
          },
          refreshUl: function() {
            var children = $ul.children(),
              previous = $ul.parent().prev();

            if (children.length === 0) {
              $buttonAddAnotherLayer.hide();
              $buttonCreateDatasetAgain.hide();
              $buttonEditBaseMapsAgain.hide();
              previous.show();
            } else {
              $buttonAddAnotherLayer.show();
              $buttonCreateDatasetAgain.show();
              $buttonEditBaseMapsAgain.show();
              previous.hide();
              $.each(children, function(i, li) {
                $($(li).children('.letter')[0]).text(abcs[i]);
              });
            }
          },
          removeLi: function(el) {
            $($(el).parents('li')[0]).remove();
            FulcrumStyler.ui.steps.refreshUl();
          },
          updateOverlayLetters: function() {},
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
            $buttonExport.on('click', function() {
              function openExport() {
                if ($modalExport) {
                  $modalExport.modal('show');
                } else {
                  loadModule('FulcrumStyler.ui.modal.export', function() {
                    $modalExport = $('#modal-export');
                  });
                }
              }

              if ($(this).text().indexOf('Save') === -1) {
                openExport();
              } else {
                saveMap(function(success) {
                  if (mapId) {
                    if (!success) {
                      alertify.log('Because your map couldn\'t be saved, but was successfully saved at one point, any exports you do here will not include any changes made to the map since the last time it was saved.', 'error', 15000);
                    }

                    openExport();
                  } else {
                    alertify.log('The map cannot be exported until it is saved. Please try again. If this error persists, please report an issue by clicking on "Submit Feedback" below.', 'error', 15000);
                  }
                });
              }
            });
            $('#button-config').on('click', function() {
              loadModule('FulcrumStyler.ui.modal.viewConfig', function() {
                $modalViewConfig = $('#modal-viewConfig');
              });
            });
            $('#refresh-btn').on('click', function() {
              FulcrumStyler.updateMap(null, true);
            });
            // ctrl S
            $('#button-save').on('click', saveMap);
            $('#button-settings').on('click', function() {
              var $this = $(this),
                $span = $($this.children('span')[2]);

              if ($this.hasClass('active')) {
                $span.popover('hide');
                $this.removeClass('active');
              } else {
                $span.popover('show');
                $this.addClass('active');
              }
            });
            $($('#button-settings span')[2]).popover({
              animation: false,
              // container: '#metadata .buttons',
              content: '<div class="checkbox"><label><input type="checkbox" value="public" checked="checked" disabled>Is this map public?</label></div><div class="checkbox"><label><input type="checkbox" value="shared" checked="checked" disabled>Share this map with others?</label></div><div style="text-align:center;"><button type="button" class="btn btn-primary" onclick="FulcrumStyler.ui.toolbar.handlers.clickSettings(this);">Acknowledge</button></div>',
              html: true,
              placement: 'bottom',
              trigger: 'manual'
            })
              .on('shown.bs.popover', function() {
                if (settingsSet) {
                  // $('#metadata .buttons .popover .btn-primary').hide();
                }
              });
          }
        }
      },
      addOverlay: function(overlay) {
        NPMap.overlays.push(overlay);
        FulcrumStyler.ui.steps.overlayToLi(overlay);
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
        // var interval;

        // $mappy.attr('src', 'iframe.html');

        // interval = setInterval(function() {
        //   var npmap = document.getElementById('map').contentWindow.NPMap;

        //   if (npmap && npmap.config && npmap.config.L) {
        //     clearInterval(interval);

        //     if (typeof callback === 'function') {
        //       callback(npmap.config);
        //     }

        //     if (!manualRefresh) {
        //       if (firstLoad) {
        //         firstLoad = false;
        //       } else {
        //         enableSave();
        //       }
        //     }
        //   }
        // }, 0);
      }
    };
  })();

  // FulcrumStyler.ui.app.init();
  // FulcrumStyler.ui.metadata.init();
  FulcrumStyler.ui.steps.init();
  // FulcrumStyler.ui.toolbar.init();

  if (App.mapId) {
    // FulcrumStyler.ui.metadata.load();
    FulcrumStyler.ui.steps.load();
    delete NPMap.created;
    delete NPMap.isShared;
    delete NPMap.modified;
    delete NPMap.tags;
  }
  FulcrumStyler.buildTooltips();
  FulcrumStyler.updateMap();
}

var SocialShareKit = (function () {
    var els, options, supportsShare, urlsToCount = {}, sep = '*|*';

    function init(opts) {
        options = opts || {};
        supportsShare = /(twitter|facebook|google-plus|pinterest|tumblr|vk|linkedin|email)/;
        ready(function () {
            els = $(options.selector || '.ssk');
            if (!els.length)
                return;

            each(els, function (el) {
                var network = elSupportsShare(el), uniqueKey;
                if (!network) {
                    return;
                }
                removeEventListener(el, 'click', onClick);
                addEventListener(el, 'click', onClick);

                // Gather icons with share counts
                if (el.parentNode.className.indexOf('ssk-count') !== -1) {
                    //networksToCount.push(network);
                    network = network[0];
                    uniqueKey = network + sep + getShareUrl(network, el);
                    if (!(uniqueKey in urlsToCount)) {
                        urlsToCount[uniqueKey] = [];
                    }
                    urlsToCount[uniqueKey].push(el);
                }
            });

            processShareCount();
        });
    }

    function ready(fn) {
        if (document.readyState != 'loading') {
            fn();
        } else if (document.addEventListener) {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            document.attachEvent('onreadystatechange', function () {
                if (document.readyState != 'loading')
                    fn();
            });
        }
    }

    function $(selector) {
      return document.querySelectorAll(selector);
    }

    function each(elements, fn) {
      for (var i = 0; i < elements.length; i++)
        fn(elements[i], i);
    }

    function addEventListener(el, eventName, handler) {
      if (el.addEventListener) {
        el.addEventListener(eventName, handler);
      } else {
        el.attachEvent('on' + eventName, function () {
          handler.call(el);
        });
      }
    }

    function removeEventListener(el, eventName, handler) {
      if (el.removeEventListener)
          el.removeEventListener(eventName, handler);
      else
          el.detachEvent('on' + eventName, handler);
    }

    function elSupportsShare(el) {
      return el.className.match(supportsShare);
    }

    function onClick(e) {
      var target = preventDefault(e),
        match = elSupportsShare(target), url;
      if (!match)
        return;

      url = getUrl(match[0], target);
      if (!url)
        return;
      if (match[0] != 'email') {
        winOpen(url);
      } else {
        document.location = url;
      }
    }

    function preventDefault(e) {
      var evt = e || window.event; // IE8 compatibility
      if (evt.preventDefault) {
          evt.preventDefault();
      } else {
          evt.returnValue = false;
          evt.cancelBubble = true;
      }
      return evt.currentTarget || evt.srcElement;
    }

    function winOpen(url) {
      var width = 575, height = 400,
          left = (document.documentElement.clientWidth / 2 - width / 2),
          top = (document.documentElement.clientHeight - height) / 2,
          opts = 'status=1,resizable=yes' +
              ',width=' + width + ',height=' + height +
              ',top=' + top + ',left=' + left;
      win = window.open(url, '', opts);
      win.focus();
      return win;
    }

    function getUrl(network, el) {
      var url, dataOpts = getDataOpts(network, el),
        shareUrl = getShareUrl(network, el, dataOpts),
        shareUrlEnc = encodeURIComponent(shareUrl),
        title = typeof dataOpts['title'] !== 'undefined' ? dataOpts['title'] : getTitle(network),
        text = typeof dataOpts['text'] !== 'undefined' ? dataOpts['text'] : getText(network),
        image = dataOpts['image'], via = dataOpts['via'];
      console.log(title);
      switch (network) {
        case 'facebook':
          url = 'https://www.facebook.com/share.php?u=' + shareUrlEnc;
          break;
        case 'twitter':
          url = 'https://twitter.com/share?url=' + shareUrlEnc +
          '&text=' + encodeURIComponent(title + (text && title ? ' - ' : '') + text);
          via = via || getMetaContent('twitter:site');
          if (via)
              url += '&via=' + via.replace('@', '');
          break;
        case 'google-plus':
          url = 'https://plus.google.com/share?url=' + shareUrlEnc;
          break;
        case 'linkedin':
          url = 'http://www.linkedin.com/shareArticle?mini=true&url=' + shareUrlEnc +
          '&title=' + encodeURIComponent(title) +
          '&summary=' + encodeURIComponent(text);
          break;
        case 'email':
          url = 'mailto:?subject=' + encodeURIComponent(title) +
          '&body=' + encodeURIComponent(title + '\n' + shareUrl + '\n\n' + text + '\n');
          break;
        case 'code':
          url = 'mailto:?subject=' + encodeURIComponent(title) +
          '&body=' + encodeURIComponent(title + '\n' + shareUrl + '\n\n' + text + '\n');
          break;
      }
      return url;
    }

    function getShareUrl(network, el, dataOpts) {
      dataOpts = dataOpts || getDataOpts(network, el);
      return dataOpts['url'] || window.location.href;
    }

    function getTitle(network) {
      var title;
      if (network == 'twitter')
          title = getMetaContent('twitter:title');
      return title || document.title;
    }

    function getText(network) {
      var text;
      if (network == 'twitter')
          text = getMetaContent('twitter:description');
      return text || getMetaContent('description');
    }

    function getMetaContent(tagName, attr) {
      var text, tag = $('meta[' + (attr ? attr : tagName.indexOf('og:') === 0 ? 'property' : 'name') + '="' + tagName + '"]');
      if (tag.length) {
          text = tag[0].getAttribute('content') || '';
      }
      return text || ''
    }

    function getDataOpts(network, el) {
      var validOpts = ['url', 'title', 'text', 'image'],
        opts = {}, optValue, optKey, dataKey, a, parent = el.parentNode;
      network == 'twitter' && validOpts.push('via');
      for (a in validOpts) {
        optKey = validOpts[a];
        dataKey = 'data-' + optKey;
        optValue = el.getAttribute(dataKey) || parent.getAttribute(dataKey) ||
        (options[network] && typeof options[network][optKey] != 'undefined' ? options[network][optKey] : options[optKey]);
        if (typeof optValue != 'undefined') {
          opts[optKey] = optValue;
        }
      }
      return opts;
    }

    function processShareCount() {
      var a, ref;
      for (a in urlsToCount) {
        ref = a.split(sep);
        (function (els) {
          getCount(ref[0], ref[1], function (cnt) {
            for (var c in els)
              addCount(els[c], cnt);
          });
        })(urlsToCount[a]);
      }
    }

    function addCount(el, cnt) {
      var newEl = document.createElement('div');
      newEl.innerHTML = cnt;
      newEl.className = 'ssk-num';
      el.appendChild(newEl);
    }

    function getCount(network, shareUrl, onReady) {
      var url, parseFunc, body,
          shareUrlEnc = encodeURIComponent(shareUrl);
        switch (network) {
          case 'facebook':
            url = 'http://graph.facebook.com/?id=' + shareUrlEnc;
            parseFunc = function (r) {
                return onReady(r.shares ? r.shares : 0);
            };
            break;
          case 'twitter':
            url = 'http://cdn.api.twitter.com/1/urls/count.json?url=' + shareUrlEnc;
            parseFunc = function (r) {
                return onReady(r.count);
            };
            break;
          case 'google-plus':
            url = 'https://clients6.google.com/rpc?key=AIzaSyCKSbrvQasunBoV16zDH9R33D88CeLr9gQ';
            body = "[{\"method\":\"pos.plusones.get\",\"id\":\"p\"," +
            "\"params\":{\"id\":\"" + shareUrl + "\",\"userId\":\"@viewer\",\"groupId\":\"@self\",\"nolog\":true}," +
            "\"jsonrpc\":\"2.0\",\"key\":\"p\",\"apiVersion\":\"v1\"}]";
            parseFunc = function (r) {
                r = JSON.parse(r);
                if (r.length) {
                    return onReady(r[0].result.metadata.globalCounts.count);
                }
            };
            ajax(url, parseFunc, body);
            return;
          case 'linkedin':
            url = 'http://www.linkedin.com/countserv/count/share?url=' + shareUrlEnc;
            parseFunc = function (r) {
                return onReady(r.count);
            };
            break;
          case 'pinterest':
            url = 'http://api.pinterest.com/v1/urls/count.json?url=' + shareUrlEnc;
            parseFunc = function (r) {
                return onReady(r.count);
            };
            break;
          case 'vk':
            url = 'http://vk.com/share.php?act=count&url=' + shareUrlEnc;
            parseFunc = function (r) {
              return onReady(r);
            };
          break;
      }
      url && parseFunc && JSONPRequest(network, url, parseFunc, body);
    }

    function ajax(url, callback, body) {
      var request = new XMLHttpRequest();
      request.onreadystatechange = function () {
        if (this.readyState === 4) {
          if (this.status >= 200 && this.status < 400) {
            callback(this.responseText);
          }
        }
      };
      request.open('POST', url, true);
      request.setRequestHeader('Content-Type', 'application/json');
      request.send(body);
    }

    function JSONPRequest(network, url, callback) {
        var callbackName = 'cb_' + network + '_' + Math.round(100000 * Math.random()),
          script = document.createElement('script');
        window[callbackName] = function (data) {
          try { // IE8
            delete window[callbackName];
          } catch (e) {
        }
          document.body.removeChild(script);
          callback(data);
        };
        if (network == 'vk') {
          window['VK'] = {
            Share: {
              count: function (a, b) {
                window[callbackName](b);
              }
            }
          };
        } else if (network == 'google-plus') {
          window['services'] = {
            gplus: {
              cb: window[callbackName]
            }
          };
        }
      script.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + callbackName;
      document.body.appendChild(script);
      return true;
    }

    return {
      init: init
    };
})();

window.SocialShareKit = SocialShareKit;

$(document).ready(function() {
  if (App.mapId) {
  NPMap = {
    baseLayers: [{
      clickable: false,
      id: 'nps.7j7nxwde',
      type: 'mapbox'
    }],
    center: {
      lat: 39.37,
      lng: -105.7
    },
    div: 'map',
    modules: [{
      content: '<div id="my-custom-module"></div>',
      icon: 'info',
      title: 'Add Custom Features<button type="button" class="btn btn-xs btn-default pull-right npmap-modules-buttons" alt="Close" id="sidebar-hide-btn"><i class="fa fa-chevron-left"></i></button></h3>',
      type: 'custom',
      visible: true
    }],
    hooks: {
      preinit: function(callback){
        L.npmap.util._.appendJsFile([
          'http://ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min.js',
          'assets/libs/bootstrap-slider/js/bootstrap-slider.js',
          'assets/libs/share/js/share.js'
          ]);
        L.npmap.util._.appendCssFile([
          '//maxcdn.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css',
          'http://netdna.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css',
          'assets/libs/share/css/share.css'
        ]);
        App.init();
        ready();
        callback();
      },
      init: function(callback) {
        document.getElementById('my-custom-module').innerHTML = '' +
          '<h3 class="panel-title">Map Center & Zoom</h3>'+
          '<button class="btn btn-subtle btn-block" id="fulcrum-zoom">Zoom to Fulcrum Layer</button>'+
          '<button class="btn btn-subtle btn-block">Set Center to <span id="current-lat">39.00</span>, <span id="current-lng">-96.00</span></button>'+
          '<button class="btn btn-subtle btn-block">Set Zoom to <span id="current-zoom">4</span></button>'+
          '<button class="btn btn-subtle btn-block">Set Center & Zoom</button>'+
          '<button class="btn btn-subtle btn-block">Restrict Bounds</button>'+
          '<p class="help-block">The map\'s viewport is constrained to the bounds of the area you defined.</p>'+
          // '<h5 style="font-weight:bold;">Min and Max Zoom Levels</h5>'+
          // '<p style="margin-bottom:20px;">Use the slider to restrict the map to a range of zoom levels.</p>'+
          // '<b>€ 10</b> <input id="set-zoom" type="text" class="span2" value="" data-slider-min="10" data-slider-max="1000" data-slider-step="5" data-slider-value="[250,450]"/> <b>€ 1000</b>'+
          // '<input type="text" id="set-zoom" class="form-control" required>'+
          '<p class="help-block" style="margin:20px 0 0 0;">Initial Center: <span class="lat">39.00</span>, <span class="lng">-96.00</span><br>Initial Zoom: <span class="zoom">4</span></p>'+
          '<form style="margin-bottom:15px;">'+
            '<fieldset>'+
              '<h3 class="panel-title">Tools</h3>'+
              '<div class="checkbox">'+
                '<label><input type="checkbox" value="editControl">Draw</label>'+
              '</div>'+
              '<div class="checkbox">'+
                '<label><input type="checkbox" value="fullscreenControl">Fullscreen</label>'+
              '</div>'+
              '<div class="checkbox">'+
                '<label><input type="checkbox" value="geocoderControl">Geocoder</label>'+
              '</div>'+
              '<div class="checkbox">'+
                '<label><input type="checkbox" value="hashControl">Hash</label>'+
              '</div>'+
              '<div class="checkbox">'+
                '<label><input type="checkbox" value="homeControl" checked="checked">Home</label>'+
              '</div>'+
              '<div class="checkbox">'+
                '<label><input type="checkbox" value="locateControl">Locate</label>'+
              '</div>'+
              '<div class="checkbox">'+
                '<label><input type="checkbox" value="measureControl">Measure</label>'+
              '</div>'+
              '<div class="checkbox">'+
                '<label><input type="checkbox" value="overviewControl">Overview</label>'+
              '</div>'+
              '<div class="checkbox">'+
                '<label><input type="checkbox" value="printControl">Print</label>'+
              '</div>'+
              '<div class="checkbox">'+
                '<label><input type="checkbox" value="scaleControl">Scale</label>'+
              '</div>'+
              // '<div class="checkbox">'+
              //   '<label><input type="checkbox" value="shareControl">Share</label>'+
              // '</div>'+ 
              '<div class="checkbox">'+
                '<label><input type="checkbox" value="smallzoomControl" checked="checked">Zoom Buttons</label>'+
              '</div>'+
              '<div class="checkbox">'+
                '<label><input type="checkbox" value="zoomdisplayControl">Zoom Display</label>'+
              '</div>'+
            '</fieldset>'+
          '</form>'+
          '<form>'+
            '<fieldset>'+
              '<h3 class="panel-title">Behavior</h3>'+
              '<div class="checkbox">'+
                '<label><input type="checkbox" value="dragging" checked="checked">Draggable</label>'+
              '</div>'+
              '<div class="checkbox">'+
                '<label><input type="checkbox" value="doubleClickZoom" checked="checked">Double-click Zoom</label>'+
              '</div>'+
              '<div class="checkbox">'+
                '<label><input type="checkbox" value="scrollWheelZoom" checked="checked">Scroll Wheel Zoom</label>'+
              '</div>'+
              '<div class="checkbox">'+
                '<label><input type="checkbox" value="boxZoom" checked="checked">Box Zoom</label>'+
              '</div>'+
              '<div class="checkbox">'+
                '<label><input type="checkbox" value="touchZoom" checked="checked">Touch Zoom (Touchscreen)</label>'+
              '</div>'+
            '</fieldset>'+
          '</form>'+
          '</div>'+
        '</div>'+
      '</div>';

      var $ = window.parent.$,
        $currentLat = $('#current-lat'),
        $currentLng = $('#current-lng'),
        $currentZoom = $('#current-zoom'),
        map = NPMap.config.L,
        zoom = $('#fulcrum-zoom');

      function updateCurrent() {
        var latLng = map.getCenter();

        $currentLat.html(latLng.lat.toFixed(2));
        $currentLng.html(latLng.lng.toFixed(2));
        $currentZoom.html(map.getZoom());
      }

      zoom.click(function() {
        map.fitBounds(NPMap.config.overlays[0].L.getBounds());
        return false;
      });

      map.on('moveend', updateCurrent);
      updateCurrent();
      callback();
      }
    },
    overlays: [{
      type: 'geojson',
      url: 'https://web.fulcrumapp.com/shares/' + App.mapId + '.geojson'
    }],
    homeControl: {
      position: 'topright'
    },
     smallzoomControl: {
      position: 'topright'
    }
  };
  ready();
    // App.changezoom
  } else {
    $('#mask').show();
    alert("URL missing data share 'id' parameter!");
  }
});



/* global tinycolor, L, NPMap */

(function() {
  var s = document.createElement('script');
   s.src = 'http://www.nps.gov/lib/npmap.js/2.0.0/npmap-bootstrap.js';
  document.body.appendChild(s);
})();

var NPMap,
  App = {
  init: function (){
    $('body').append('<div class="navbar navbar-inverse navbar-fixed-top" role="navigation">'+
      '<div class="container-fluid">'+
        '<div class="navbar-header">'+
          '<div class="navbar-icon-container">'+
            '<a href="#" class="navbar-icon pull-right visible-xs" id="nav-btn"><i class="fa fa-bars fa-lg white"></i></a>'+
          '</div>'+
          '<a class="navbar-brand" href="#" name="title" id="navbar-title">Fulcrum Styler</a>'+
        '</div>'+
        '<div class="navbar-collapse collapse">'+
          '<ul class="nav navbar-nav">'+
            '<li class="hidden-xs"><a href="#" data-toggle="collapse" data-target=".navbar-collapse.in" id="button-editBaseMaps"><i class="fa fa-edit white"></i>&nbsp;&nbsp;Change Basemaps</a></li>'+
            '<li class="hidden-xs"><a href="#" data-toggle="collapse" data-target=".navbar-collapse.in" id="button-createDataset"><i class="fa fa-map-marker white"></i>&nbsp;&nbsp;Style Your Layer</a></li>'+
            '<li class="hidden-xs"><a href="#" data-toggle="collapse" data-target=".navbar-collapse.in" id="button-addAnotherLayer"><i class="fa fa-map-marker white"></i>&nbsp;&nbsp;Add Another Layer</a></li>'+
            '<li class="dropdown">'+
                '<a class="dropdown-toggle" id="downloadDrop" href="#" role="button" data-toggle="dropdown"><i class="fa fa-refresh white"></i>&nbsp;&nbsp;Refresh <b class="caret"></b></a>'+
                '<ul class="dropdown-menu dropdown-menu-form">'+
                  '<li><a href="#" id="refresh-btn" data-toggle="collapse" data-target=".navbar-collapse.in"><i class="fa fa-refresh"></i>&nbsp;&nbsp;Refresh Now</a></li>'+
                  '<li class="dropdown-input"><input type="checkbox" id="auto-refresh">&nbsp;&nbsp;Auto Refresh (every minute)</li>'+
                '</ul>'+
            '</li>'+
          '</ul>'+
          '<ul class="nav navbar-nav navbar-right">'+
            '<li class="dropdown">'+
              '<a href="#" role="button" class="dropdown-toggle" data-toggle="dropdown"><i class="fa fa-share white"></i>&nbsp;&nbsp;Share<b class="caret"></b></a>'+
              '<ul class="dropdown-menu" style="padding: 10px; min-width: 100px;">'+
              '<div class="ssk-group ssk-count">'+
                '<a href="" class="ssk ssk-facebook"></a>'+
                '<a href="" class="ssk ssk-twitter"></a>'+
                '<a href="" class="ssk ssk-google-plus"></a>'+
                '<a href="" class="ssk ssk-linkedin"></a>'+
                '<a href="" class="ssk ssk-email"></a>'+
              '</div>'+
              '</ul>'+
            '</li>'+
          '</ul>'+
        '</div>'+
      '</div>'+
    '</div>'+
    '<div class="modal fade" id="featureModal" tabindex="-1" role="dialog">'+
      '<div class="modal-dialog">'+
        '<div class="modal-content">'+
          '<div class="modal-header">'+
            '<button class="close" type="button" data-dismiss="modal" aria-hidden="true">&times;</button>'+
            '<h4 class="modal-title text-primary" id="feature-title"></h4>'+
          '</div>'+
          '<div class="modal-body" id="feature-info"></div>'+
          '<div class="modal-footer">'+
            '<div class="btn-group pull-left">'+
              '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" id="share-btn">'+
                '<i class="fa fa-share"></i>&nbsp;Share&nbsp;<span class="caret"></span>'+
              '</button>'+
              '<ul class="dropdown-menu" role="menu">'+
              '<div class="ssk-group ssk-count">'+
                '<a href="" class="ssk ssk-facebook"></a>'+
                '<a href="" class="ssk ssk-twitter"></a>'+
                '<a href="" class="ssk ssk-google-plus"></a>'+
                '<a href="" class="ssk ssk-linkedin"></a>'+
                '<a href="" class="ssk ssk-email"></a>'+
                '<a href="" class="ssk ssk-"></a>'+
              '</div>'+
              '</ul>'+
            '</div>'+
            '<button type="button" class="btn btn-primary" data-dismiss="modal">Close</button>'+
          '</div>'+
        '</div>'+
      '</div>'+
    '</div>');
  },
  mapId: document.location.search.replace('?id=', '')
}

function ready() {
  FulcrumStyler = (function() {
    var $activeChangeStyleButton = null,
      $activeConfigureInteractivityButton = null,
      $buttonAddAnotherLayer = $('#button-addAnotherLayer'),
      $buttonCreateDatasetAgain = $('#button-createDatasetAgain'),
      $buttonEditBaseMapsAgain = $('#button-editBaseMapsAgain'),
      $buttonExport = $('#button-export'),
      $buttonSave = $('#button-save'),
      $mappy = $('#map'),
      $lat = $('.lat'),
      $lng = $('.lng'),
      $layers = $('#layers'),
      $modalConfirm = $('#modal-confirm'),
      $modalSignIn = $('#modal-signin'),
      $stepSection = $('section .step'),
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
      // stepLis = $('#steps li'),
      title = null,
      titleSet = false,
      titleZ = null,
      $modalAddLayer, $modalEditBaseMaps, $modalExport, $modalViewConfig;

    function disableSave() {
      $buttonSave.prop('disabled', true);
      $buttonExport.text('Export Map');
    }
    function enableSave() {
      $buttonSave.prop('disabled', false);
      $buttonExport.text('Save & Export Map');
    }
    function escapeHtml(unsafe) {
      return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
        //.replace(/'/g, '&#039;');
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
                      '<select class="form-control marker-library" id="' + getName('marker-library', 'point') + '" onchange="FulcrumStyler.ui.steps.handlers.changeMarkerLibrary(this);return false;">' +
                        '<option value="letters">Letters</option>' +
                        '<option value="maki">Maki</option>' +
                        '<option value="npmaki">NPMaki</option>' +
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
        var disabled = geometryTypes.indexOf(id) === -1,
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
        $.each(document.getElementById('map').contentWindow.L.npmap.preset.colors, function(prop, value) {
          // TODO: Use prop too.
          colors.push(value.color);
        });
      }

      if (!optionsMaki.length) {
        sortable = [];
        $.each(document.getElementById('map').contentWindow.L.npmap.preset.maki, function(prop, value) {
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
        $.each(document.getElementById('map').contentWindow.L.npmap.preset.npmaki, function(prop, value) {
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
      return '' +
        '<form class="change-style form-horizontal" id="' + name + '_layer-change-style" role="form">' +
          '<ul class="nav nav-tabs" style="padding-left:5px;">' +
            createTab('point', 'Point') +
            createTab('line', 'Line') +
            createTab('polygon', 'Polygon') +
          '</ul>' +
          '<div class="tab-content">' +
            createPanel('point') +
            createPanel('line') +
            createPanel('polygon') +
          '</div>' +
        '</form>' +
      '';
    }
    function getLayerIndexFromButton(el) {
      return $.inArray($(el).parent().parent().parent().prev().text(), abcs);
    }
    function getLeafletMap() {
      return document.getElementById('map').contentWindow.NPMap.config.L;
    }
    function goToStep(from, to) {
      $($stepSection[from]).hide();
      $($stepSection[to]).show();
      $(stepLis[from]).removeClass('active');
      $(stepLis[to]).addClass('active');
    }
    function loadModule(module, callback) {
      module = module.replace('FulcrumStyler.', '').replace(/\./g,'/');
      debugger;
      $.ajax({
        dataType: 'html',
        success: function (html) {
          $('body').append(html);
          $.getScript(module + '.js', function() {
            if (callback) {
              debugger;
              callback();
            }
          });
        },
        url: module + '.html'
      });
      console.log(module + '.html')
    }
    function saveMap(callback) {
      var $this = $(this);

      FulcrumStyler.showLoading();
      $this.blur();
      $.ajax({
        data: {
          description: description,
          isPublic: true,
          isShared: true,
          json: JSON.stringify(NPMap),
          mapId: App.mapId || null,
          name: title
        },
        dataType: 'json',
        error: function() {
          FulcrumStyler.hideLoading();
          // alertify.error('You must be connected to the National Park Service network to save a map.');

          if (typeof callback === 'function') {
            callback(false);
          }
        },
        success: function(response) {
          // var error = 'Sorry, there was an unhandled error while saving your map. Please try again.',
            var success = false;

          FulcrumStyler.hideLoading();

          if (response) {
            if (response.success === true) {
              if (!App.mapId && window.history.replaceState) {
                var location = window.location,
                  url = location.protocol + '//' + location.host + location.pathname + '?mapId=' + response.mapId;

                window.history.replaceState({
                  path: url
                }, '', url);
              }

              App.mapId = response.mapId;
              updateSaveStatus(response.modified);
              alertify.success('Your map was saved!');
              success = true;
            } else if (response.success === false && response.error) {
              if (response.type === 'login') {
                $modalSignIn.modal('show');
              } else {
                alertify.error(response.error);
              }
            } else {
              alertify.error(error);
            }
          } else {
            alertify.error(error);
          }

          if (typeof callback === 'function') {
            callback(success);
          }
        },
        type: 'POST',
        url: '/FulcrumStyler/save/'
      });
    }
    function unescapeHtml(unsafe) {
      return unsafe
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '\"');
        //.replace(/&#039;/g, '\'');
    }
    function updateInitialCenterAndZoom() {
      // debugger;
      if (NPMap.config){
        $lat.html(NPMap.config.center.lat.toFixed(2));
        $lng.html(NPMap.config.center.lng.toFixed(2));
        $zoom.html(NPMap.zoom);
      }
    }
    function updateSaveStatus(date) {
      $('.info-saved p').text('Saved ' + moment(date).format('MM/DD/YYYY') + ' at ' + moment(date).format('h:mm:ssa'));
      $('.info-saved').show();
      disableSave();
    }
    // $(document).ready(function() {
    //   if (mapId) {
    //     descriptionSet = true;
    //     settingsSet = true;
    //     titleSet = true;
    //   } else {
    //     setTimeout(function() {
    //       $('#metadata .title a').editable('toggle');
    //     }, 200);
    //   }
    // });
    return {
      _afterUpdateCallbacks: {},
      _defaultStyles: {
        line: {
          'stroke': '#d39800',
          'stroke-opacity': 0.8,
          'stroke-width': 3
        },
        point: {
          'marker-color': '#FFCCFF',
          'marker-library': 'maki',
          'marker-size': 'small',
          'marker-symbol': null
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
      ui: {
        // app: {
          // init: function() {
            // var backButtons = $('section .step .btn-link'),
            //   eventMethod = window.addEventListener ? 'addEventListener' : 'attachEvent',
            //   eventer = window[eventMethod],
            //   messageEvent = eventMethod === 'attachEvent' ? 'onmessage' : 'message',
            //   stepButtons = $('section .step .btn-primary');

            // eventer(messageEvent, function(e) {
            //   if (e.data === 'logged_in') {
            //     $modalSignIn.modal('hide');
            //     alertify.log('You are now logged in. Please try to save again.', 'success', 6000);
            //   }
            // }, false);

        //     /*
        //     Dropzone.options.dropzone = {
        //       accept: function(file, done) {
        //         console.log(file);
        //         done();
        //       },
        //       clickable: false,
        //       createImageThumbnails: false,
        //       maxFilesize: 5,
        //       uploadMultiple: false
        //     };
        //     */
          //   $modalSignIn.modal({
          //     show: false
          //   })
          //     .on('hidden.bs.modal', function() {
          //       $($('#modal-signin .modal-body')[0]).html(null);
          //     })
          //     .on('shown.bs.modal', function() {
          //       $($('#modal-signin .modal-body')[0]).html('<iframe id="iframe" src="https://insidemaps.nps.gov/account/logon/?iframe=true" style="height:202px;"></iframe>');
          //     });
          //   $(backButtons[0]).on('click', function() {
          //     goToStep(1, 0);
          //   });
          //   $(backButtons[1]).on('click', function() {
          //     goToStep(2, 1);
          //   });
          //   $(stepButtons[0]).on('click', function() {
          //     goToStep(0, 1);
          //   });
          //   $(stepButtons[1]).on('click', function() {
          //     goToStep(1, 2);
          //   });
          //   $.each(stepLis, function(i, li) {
          //     $(li.childNodes[0]).on('click', function() {
          //       var currentIndex = -1;

          //       for (var j = 0; j < stepLis.length; j++) {
          //         if ($(stepLis[j]).hasClass('active')) {
          //           currentIndex = j;
          //           break;
          //         }
          //       }

          //       if (currentIndex !== i) {
          //         goToStep(currentIndex, i);
          //       }
          //     });
          //   });
          // }
        // },
        // metadata: {
        //   init: function() {
        //     description = NPMap.description;
        //     firstLoad = true;
        //     title = NPMap.name;

        //     $('#metadata .description a').text(description).editable({
        //       animation: false,
        //       container: '#metadata div.info',
        //       emptytext: 'Add a description to give your map context.',
        //       validate: function(value) {
        //         if ($.trim(value) === '') {
        //           return 'Please enter a description for your map.';
        //         }
        //       }
        //     })
        //       .on('hidden', function() {
        //         var newDescription = $('#metadata .description a').text(),
        //           next = $(this).next();

        //         if (descriptionSet) {
        //           if (newDescription !== description) {
        //             enableSave();
        //           }
        //         } else {
        //           $($('#button-settings span')[2]).popover('show');

        //           next.css({
        //             'z-index': descriptionZ
        //           });
        //           $(next.find('button')[1]).css({
        //             display: 'block'
        //           });
        //           descriptionSet = true;

        //           if (!settingsSet) {
        //             next = $('#metadata .buttons .popover');
        //             settingsZ = next.css('z-index');
        //             next.css({
        //               'z-index': 1031
        //             });
        //             $('#metadata .buttons .popover button').focus();
        //           }
        //         }

        //         description = newDescription;
        //         NPMap.description = description;
        //       })
        //       .on('shown', function() {
        //         var next = $(this).parent().next();

        //         if (!descriptionSet) {
        //           descriptionZ = next.css('z-index');
        //           next.css({
        //             'z-index': 1031
        //           });
        //           $(next.find('button')[1]).css({
        //             display: 'none'
        //           });
        //         }

        //         next.find('textarea').css({
        //           'resize': 'none'
        //         });
        //       });
        //     $('#metadata .title a').text(title).editable({
        //       animation: false,
        //       emptytext: 'Untitled Map',
        //       validate: function(value) {
        //         if ($.trim(value) === '') {
        //           return 'Please enter a title for your map.';
        //         }
        //       }
        //     })
        //       .on('hidden', function() {
        //         var newDescription = $('#metadata .description a').text(),
        //           newTitle = $('#metadata .title a').text(),
        //           next = $(this).next();

        //         if (!newDescription || newDescription === 'Add a description to give your map context.') {
        //           $('#metadata .description a').editable('toggle');
        //         } else {
        //           if (newTitle !== title) {
        //             enableSave();
        //           }
        //         }

        //         if (!titleSet) {
        //           next.css({
        //             'z-index': titleZ
        //           });
        //           $(next.find('button')[1]).css({
        //             display: 'block'
        //           });
        //           titleSet = true;
        //         }

        //         title = newTitle;
        //         NPMap.name = title;
        //       })
        //       .on('shown', function() {
        //         var next = $(this).next();

        //         if (!titleSet) {
        //           titleZ = next.css('z-index');
        //           next.css({
        //             'z-index': 1031
        //           });
        //           $(next.find('button')[1]).css({
        //             display: 'none'
        //           });
        //         }

        //         next.find('.editable-clear-x').remove();
        //         next.find('input').css({
        //           'padding-right': '10px'
        //         });
        //       });
        //   },
        //   load: function() {
        //     if (NPMap.description) {
        //       $('#metadata .description a').text(NPMap.description);
        //     }

        //     if (NPMap.name) {
        //       $('#metadata .title a').text(NPMap.name);
        //     }

        //     updateSaveStatus(NPMap.modified);
        //   }
        // },
        steps: {
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
                overlay;

              for (var i = 0; i < NPMap.overlays.length; i++) {
                var o = NPMap.overlays[i];

                if (o.name === overlayName) {
                  overlay = o;
                  break;
                }
              }

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
                i, overlay;

              for (i = 0; i < NPMap.overlays.length; i++) {
                var o = NPMap.overlays[i];

                if (o.name === overlayName) {
                  overlay = o;
                  break;
                }
              }

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
            clickLayerChangeStyle: function(el) {
              var $el = $(el);

              if ($el.data('popover-created')) {
                $el.popover('toggle');
              } else {
                var layer = document.getElementById('map').contentWindow.NPMap.config.overlays[getLayerIndexFromButton(el)],
                  overlay = NPMap.overlays[getLayerIndexFromButton(el)],
                  name = overlay.name.split(' ').join('_');

                $el.popover({
                  animation: false,
                  container: 'body',
                  content: '' +
                    generateLayerChangeStyle(name, layer) +
                    '<div style="text-align:center;">' +
                      '<button class="btn btn-primary" onclick="FulcrumStyler.ui.steps.handlers.clickApplyStyles(\'' + name + '\',\'' + overlay.name + '\');" type="button">Apply</button>' +
                      '<button class="btn btn-default" onclick="FulcrumStyler.ui.steps.handlers.cancelApplyStyles();" style="margin-left:5px;">Cancel</button>' +
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

                      if ($el.attr('id').toLowerCase().indexOf('marker-color') > -1) {
                        obj.onchange = function(container, color) {
                          FulcrumStyler.ui.steps.filterColors(color);
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
                                  FulcrumStyler.ui.steps.filterColors(style['marker-color']);

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
                var overlay = NPMap.overlays[getLayerIndexFromButton(el)],
                  name = overlay.name.split(' ').join('_'),
                  supportsTooltips = (overlay.type === 'cartodb' || overlay.type === 'csv' || overlay.type === 'geojson' || overlay.type === 'kml' || overlay.type === 'mapbox'),
                  html;

                html = '' +
                  // Checkbox here "Display all fields in a table?" should be checked on by default.
                  '<form class="configure-interactivity" id="' + name + '_layer-configure-interactivity" role="form">' +
                    '<fieldset>' +
                      '<div class="form-group">' +
                        '<span><label for="' + name + '_title">Title</label><a href="https://github.com/nationalparkservice/npmap-FulcrumStyler/wiki/Popups-and-Tooltips" target="_blank"><img data-container="body" data-placement="bottom" rel="tooltip" src="assets/img/help@2x.png" style="cursor:pointer;float:right;height:18px;" title="The title will display in bold at the top of the popup. HTML and Handlebars templates are allowed. Click for more info."></a></span>' +
                        '<input class="form-control" id="' + name + '_title" rows="3" type="text"></input>' +
                      '</div>' +
                      '<div class="form-group">' +
                        '<span><label for="' + name + '_description">Description</label><a href="https://github.com/nationalparkservice/npmap-FulcrumStyler/wiki/Popups-and-Tooltips" target="_blank"><img data-container="body" data-placement="bottom" rel="tooltip" src="assets/img/help@2x.png" style="cursor:pointer;float:right;height:18px;" title="The description will display underneath the title. HTML and Handlebars templates are allowed. Click for more info."></a></span>' +
                        '<textarea class="form-control" id="' + name + '_description" rows="4"></textarea>' +
                      '</div>' +
                      (supportsTooltips ? '' +
                        '<div class="checkbox">' +
                          '<label>' +
                            '<input onchange="FulcrumStyler.ui.steps.handlers.changeEnableTooltips(this);return false;" type="checkbox" value="tooltips"> Enable tooltips?' +
                          '</label>' +
                        '</div>' +
                        '<div class="form-group">' +
                          '<span><label for="' + name + '_tooltip">Tooltip</label><a href="https://github.com/nationalparkservice/npmap-FulcrumStyler/wiki/Popups-and-Tooltips" target="_blank"><img data-container="body" data-placement="bottom" rel="tooltip" src="assets/img/help@2x.png" style="cursor:pointer;float:right;height:18px;" title="Tooltips display when the cursor moves over a shape. HTML and Handlebars templates are allowed. Click for more info."></a></span>' +
                          '<input class="form-control" id="' + name + '_tooltip" type="text" disabled></input>' +
                        '</div>' +
                      '' : '') +
                    '</fieldset>' +
                  '</form>' +
                  '<div style="text-align:center;">' +
                    '<button class="btn btn-primary" onclick="FulcrumStyler.ui.steps.handlers.clickApplyInteractivity(\'' + name + '\',\'' + overlay.name + '\');" type="button">Apply</button><button class="btn btn-default" onclick="FulcrumStyler.ui.steps.handlers.cancelApplyInteractivity();" style="margin-left:5px;">Cancel</button>' +
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

                    overlay = NPMap.overlays[getLayerIndexFromButton(el)];
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
                FulcrumStyler.ui.steps.removeLi(el);
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
            // $('.dd').nestable({
            //   handleClass: 'letter',
            //   listNodeName: 'ul'
            // })
            //   .on('change', function() {
            //     var children = $ul.children(),
            //       overlays = [];

            //     if (children.length > 1) {
            //       $.each(children, function(i, li) {
            //         var from = $.inArray($($(li).children('.letter')[0]).text(), abcs);

            //         if (from !== i) {
            //           overlays.splice(i, 0, NPMap.overlays[from]);
            //         } else {
            //           overlays.push(NPMap.overlays[from]);
            //         }
            //       });

            //       if (overlays.length) {
            //         NPMap.overlays = overlays;
            //         FulcrumStyler.updateMap();
            //       }

            //       FulcrumStyler.ui.steps.refreshUl();
            //     }
            //   });
            $('#button-editBaseMaps, #button-editBaseMapsAgain').on('click', function() {
              if ($modalEditBaseMaps) {
                $modalEditBaseMaps.modal('show');
              debugger;
              } else {
                loadModule('FulcrumStyler.ui.modal.editBaseMaps', function() {
                  $modalEditBaseMaps = $('#modal-editBaseMaps');
                });
              }
            });
            $('a#button-addAnotherLayer, a#button-addLayer').on('click', function() {
              if ($modalAddLayer) {
                $modalAddLayer.modal('show');
              } else {
                loadModule('FulcrumStyler.ui.modal.addLayer', function() {
                  $modalAddLayer = $('#modal-addLayer');
                });
              }
            });
            var buttonBlocks = $('#set-center-and-zoom .btn-block');

              $(buttonBlocks[0]).on('click', function() {
                var center = getLeafletMap().getCenter();

                NPMap.center = {
                  lat: center.lat,
                  lng: center.lng
                };
                updateInitialCenterAndZoom();
                FulcrumStyler.updateMap();
              });
              $(buttonBlocks[1]).on('click', function() {
                NPMap.zoom = getLeafletMap().getZoom();
                updateInitialCenterAndZoom();
                FulcrumStyler.updateMap();
              });
              $(buttonBlocks[2]).on('click', function() {
                var map = getLeafletMap(),
                  center = map.getCenter();

                NPMap.center = {
                  lat: center.lat,
                  lng: center.lng
                };
                NPMap.zoom = map.getZoom();

                updateInitialCenterAndZoom();
                FulcrumStyler.updateMap();
              });
              $(buttonBlocks[3]).on('click', function() {
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
              $('#set-zoom').slider({
                //center: 4,
                max: 19,
                min: 0,
                value: [typeof NPMap.minZoom === 'number' ? NPMap.minZoom : 0, typeof NPMap.maxZoom === 'number' ? NPMap.maxZoom : 19]
              })
                .on('slideStop', function(e) {
                  NPMap.maxZoom = e.value[1];
                  NPMap.minZoom = e.value[0];
                  FulcrumStyler.updateMap();
                });
                        $.each($('#tools-and-settings form'), function(i, form) {
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
            if ($.isArray(NPMap.overlays)) {
              $.each(NPMap.overlays, function(i, overlay) {
                FulcrumStyler.ui.steps.overlayToLi(overlay);
              });
            }
            updateInitialCenterAndZoom();

            if (typeof NPMap.maxBounds === 'object') {
              var $bounds = $($('#set-center-and-zoom .btn-block')[3]);

              $bounds.addClass('active').text('Remove Bounds Restriction');
              $bounds.next().show();
            }

            $.each($('#tools-and-settings form'), function(i, form) {
              $.each($(form).find('input'), function(j, input) {
                var $input = $(input),
                  name = $input.attr('value'),
                  property = NPMap[name];

                if (typeof property !== 'undefined') {
                  $input.attr('checked', property);
                }
              });
            });
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
                '<span class="actions">' +
                  '<div style="float:left;">' +
                    '<button class="btn btn-default btn-xs" data-container="section" onclick="FulcrumStyler.ui.steps.handlers.clickLayerEdit(this);" type="button">' +
                      '<span class="fa fa-edit"> Edit</span>' +
                    '</button>' +
                  '</div>' +
                  '<div style="float:right;">' +
                    '<button class="btn btn-default btn-xs interactivity" data-container="section" data-placement="bottom" onclick="FulcrumStyler.ui.steps.handlers.clickLayerConfigureInteractivity(this);" rel="tooltip" style="' + (interactive ? '' : 'display:none;') + 'margin-right:5px;" title="Configure Interactivity" type="button">' +
                      '<span class="fa fa-comment"></span>' +
                    '</button>' +
                    '<button class="btn btn-default btn-xs" data-container="section" data-placement="bottom" onclick="FulcrumStyler.ui.steps.handlers.clickLayerChangeStyle(this);" rel="tooltip" style="' + (styleable ? '' : 'display:none;') + 'margin-right:5px;" title="Change Style" type="button">' +
                      '<span class="fa fa-map-marker"></span>' +
                    '</button>' +
                    '<button class="btn btn-default btn-xs" data-container="section" data-placement="bottom" onclick="FulcrumStyler.ui.steps.handlers.clickLayerRemove(this);" rel="tooltip" title="Delete Overlay" type="button">' +
                      '<span class="fa fa-trash-o"></span>' +
                    '</button>' +
                  '</div>' +
                '</span>' +
              '</div>' +
            ''));
            FulcrumStyler.ui.steps.refreshUl();
          },
          refreshUl: function() {
            var children = $ul.children(),
              previous = $ul.parent().prev();

            if (children.length === 0) {
              $buttonAddAnotherLayer.hide();
              $buttonCreateDatasetAgain.hide();
              $buttonEditBaseMapsAgain.hide();
              previous.show();
            } else {
              $buttonAddAnotherLayer.show();
              $buttonCreateDatasetAgain.show();
              $buttonEditBaseMapsAgain.show();
              previous.hide();
              $.each(children, function(i, li) {
                $($(li).children('.letter')[0]).text(abcs[i]);
              });
            }
          },
          removeLi: function(el) {
            $($(el).parents('li')[0]).remove();
            FulcrumStyler.ui.steps.refreshUl();
          },
          updateOverlayLetters: function() {},
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
            $buttonExport.on('click', function() {
              function openExport() {
                if ($modalExport) {
                  $modalExport.modal('show');
                } else {
                  loadModule('FulcrumStyler.ui.modal.export', function() {
                    $modalExport = $('#modal-export');
                  });
                }
              }

              if ($(this).text().indexOf('Save') === -1) {
                openExport();
              } else {
                saveMap(function(success) {
                  if (mapId) {
                    if (!success) {
                      alertify.log('Because your map couldn\'t be saved, but was successfully saved at one point, any exports you do here will not include any changes made to the map since the last time it was saved.', 'error', 15000);
                    }

                    openExport();
                  } else {
                    alertify.log('The map cannot be exported until it is saved. Please try again. If this error persists, please report an issue by clicking on "Submit Feedback" below.', 'error', 15000);
                  }
                });
              }
            });
            $('#button-config').on('click', function() {
              loadModule('FulcrumStyler.ui.modal.viewConfig', function() {
                $modalViewConfig = $('#modal-viewConfig');
              });
            });
            $('#refresh-btn').on('click', function() {
              FulcrumStyler.updateMap(null, true);
            });
            // ctrl S
            $('#button-save').on('click', saveMap);
            $('#button-settings').on('click', function() {
              var $this = $(this),
                $span = $($this.children('span')[2]);

              if ($this.hasClass('active')) {
                $span.popover('hide');
                $this.removeClass('active');
              } else {
                $span.popover('show');
                $this.addClass('active');
              }
            });
            $($('#button-settings span')[2]).popover({
              animation: false,
              // container: '#metadata .buttons',
              content: '<div class="checkbox"><label><input type="checkbox" value="public" checked="checked" disabled>Is this map public?</label></div><div class="checkbox"><label><input type="checkbox" value="shared" checked="checked" disabled>Share this map with others?</label></div><div style="text-align:center;"><button type="button" class="btn btn-primary" onclick="FulcrumStyler.ui.toolbar.handlers.clickSettings(this);">Acknowledge</button></div>',
              html: true,
              placement: 'bottom',
              trigger: 'manual'
            })
              .on('shown.bs.popover', function() {
                if (settingsSet) {
                  // $('#metadata .buttons .popover .btn-primary').hide();
                }
              });
          }
        }
      },
      addOverlay: function(overlay) {
        NPMap.overlays.push(overlay);
        FulcrumStyler.ui.steps.overlayToLi(overlay);
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
        // var interval;

        // $mappy.attr('src', 'iframe.html');

        // interval = setInterval(function() {
        //   var npmap = document.getElementById('map').contentWindow.NPMap;

        //   if (npmap && npmap.config && npmap.config.L) {
        //     clearInterval(interval);

        //     if (typeof callback === 'function') {
        //       callback(npmap.config);
        //     }

        //     if (!manualRefresh) {
        //       if (firstLoad) {
        //         firstLoad = false;
        //       } else {
        //         enableSave();
        //       }
        //     }
        //   }
        // }, 0);
      }
    };
  })();

  // FulcrumStyler.ui.app.init();
  // FulcrumStyler.ui.metadata.init();
  FulcrumStyler.ui.steps.init();
  // FulcrumStyler.ui.toolbar.init();

  if (App.mapId) {
    // FulcrumStyler.ui.metadata.load();
    FulcrumStyler.ui.steps.load();
    delete NPMap.created;
    delete NPMap.isShared;
    delete NPMap.modified;
    delete NPMap.tags;
  }
  FulcrumStyler.buildTooltips();
  FulcrumStyler.updateMap();
}

var SocialShareKit = (function () {
    var els, options, supportsShare, urlsToCount = {}, sep = '*|*';

    function init(opts) {
        options = opts || {};
        supportsShare = /(twitter|facebook|google-plus|pinterest|tumblr|vk|linkedin|email)/;
        ready(function () {
            els = $(options.selector || '.ssk');
            if (!els.length)
                return;

            each(els, function (el) {
                var network = elSupportsShare(el), uniqueKey;
                if (!network) {
                    return;
                }
                removeEventListener(el, 'click', onClick);
                addEventListener(el, 'click', onClick);

                // Gather icons with share counts
                if (el.parentNode.className.indexOf('ssk-count') !== -1) {
                    //networksToCount.push(network);
                    network = network[0];
                    uniqueKey = network + sep + getShareUrl(network, el);
                    if (!(uniqueKey in urlsToCount)) {
                        urlsToCount[uniqueKey] = [];
                    }
                    urlsToCount[uniqueKey].push(el);
                }
            });

            processShareCount();
        });
    }

    function ready(fn) {
        if (document.readyState != 'loading') {
            fn();
        } else if (document.addEventListener) {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            document.attachEvent('onreadystatechange', function () {
                if (document.readyState != 'loading')
                    fn();
            });
        }
    }

    function $(selector) {
      return document.querySelectorAll(selector);
    }

    function each(elements, fn) {
      for (var i = 0; i < elements.length; i++)
        fn(elements[i], i);
    }

    function addEventListener(el, eventName, handler) {
      if (el.addEventListener) {
        el.addEventListener(eventName, handler);
      } else {
        el.attachEvent('on' + eventName, function () {
          handler.call(el);
        });
      }
    }

    function removeEventListener(el, eventName, handler) {
      if (el.removeEventListener)
          el.removeEventListener(eventName, handler);
      else
          el.detachEvent('on' + eventName, handler);
    }

    function elSupportsShare(el) {
      return el.className.match(supportsShare);
    }

    function onClick(e) {
      var target = preventDefault(e),
        match = elSupportsShare(target), url;
      if (!match)
        return;

      url = getUrl(match[0], target);
      if (!url)
        return;
      if (match[0] != 'email') {
        winOpen(url);
      } else {
        document.location = url;
      }
    }

    function preventDefault(e) {
      var evt = e || window.event; // IE8 compatibility
      if (evt.preventDefault) {
          evt.preventDefault();
      } else {
          evt.returnValue = false;
          evt.cancelBubble = true;
      }
      return evt.currentTarget || evt.srcElement;
    }

    function winOpen(url) {
      var width = 575, height = 400,
          left = (document.documentElement.clientWidth / 2 - width / 2),
          top = (document.documentElement.clientHeight - height) / 2,
          opts = 'status=1,resizable=yes' +
              ',width=' + width + ',height=' + height +
              ',top=' + top + ',left=' + left;
      win = window.open(url, '', opts);
      win.focus();
      return win;
    }

    function getUrl(network, el) {
      var url, dataOpts = getDataOpts(network, el),
        shareUrl = getShareUrl(network, el, dataOpts),
        shareUrlEnc = encodeURIComponent(shareUrl),
        title = typeof dataOpts['title'] !== 'undefined' ? dataOpts['title'] : getTitle(network),
        text = typeof dataOpts['text'] !== 'undefined' ? dataOpts['text'] : getText(network),
        image = dataOpts['image'], via = dataOpts['via'];
      console.log(title);
      switch (network) {
        case 'facebook':
          url = 'https://www.facebook.com/share.php?u=' + shareUrlEnc;
          break;
        case 'twitter':
          url = 'https://twitter.com/share?url=' + shareUrlEnc +
          '&text=' + encodeURIComponent(title + (text && title ? ' - ' : '') + text);
          via = via || getMetaContent('twitter:site');
          if (via)
              url += '&via=' + via.replace('@', '');
          break;
        case 'google-plus':
          url = 'https://plus.google.com/share?url=' + shareUrlEnc;
          break;
        case 'linkedin':
          url = 'http://www.linkedin.com/shareArticle?mini=true&url=' + shareUrlEnc +
          '&title=' + encodeURIComponent(title) +
          '&summary=' + encodeURIComponent(text);
          break;
        case 'email':
          url = 'mailto:?subject=' + encodeURIComponent(title) +
          '&body=' + encodeURIComponent(title + '\n' + shareUrl + '\n\n' + text + '\n');
          break;
        case 'code':
          url = 'mailto:?subject=' + encodeURIComponent(title) +
          '&body=' + encodeURIComponent(title + '\n' + shareUrl + '\n\n' + text + '\n');
          break;
      }
      return url;
    }

    function getShareUrl(network, el, dataOpts) {
      dataOpts = dataOpts || getDataOpts(network, el);
      return dataOpts['url'] || window.location.href;
    }

    function getTitle(network) {
      var title;
      if (network == 'twitter')
          title = getMetaContent('twitter:title');
      return title || document.title;
    }

    function getText(network) {
      var text;
      if (network == 'twitter')
          text = getMetaContent('twitter:description');
      return text || getMetaContent('description');
    }

    function getMetaContent(tagName, attr) {
      var text, tag = $('meta[' + (attr ? attr : tagName.indexOf('og:') === 0 ? 'property' : 'name') + '="' + tagName + '"]');
      if (tag.length) {
          text = tag[0].getAttribute('content') || '';
      }
      return text || ''
    }

    function getDataOpts(network, el) {
      var validOpts = ['url', 'title', 'text', 'image'],
        opts = {}, optValue, optKey, dataKey, a, parent = el.parentNode;
      network == 'twitter' && validOpts.push('via');
      for (a in validOpts) {
        optKey = validOpts[a];
        dataKey = 'data-' + optKey;
        optValue = el.getAttribute(dataKey) || parent.getAttribute(dataKey) ||
        (options[network] && typeof options[network][optKey] != 'undefined' ? options[network][optKey] : options[optKey]);
        if (typeof optValue != 'undefined') {
          opts[optKey] = optValue;
        }
      }
      return opts;
    }

    function processShareCount() {
      var a, ref;
      for (a in urlsToCount) {
        ref = a.split(sep);
        (function (els) {
          getCount(ref[0], ref[1], function (cnt) {
            for (var c in els)
              addCount(els[c], cnt);
          });
        })(urlsToCount[a]);
      }
    }

    function addCount(el, cnt) {
      var newEl = document.createElement('div');
      newEl.innerHTML = cnt;
      newEl.className = 'ssk-num';
      el.appendChild(newEl);
    }

    function getCount(network, shareUrl, onReady) {
      var url, parseFunc, body,
          shareUrlEnc = encodeURIComponent(shareUrl);
        switch (network) {
          case 'facebook':
            url = 'http://graph.facebook.com/?id=' + shareUrlEnc;
            parseFunc = function (r) {
                return onReady(r.shares ? r.shares : 0);
            };
            break;
          case 'twitter':
            url = 'http://cdn.api.twitter.com/1/urls/count.json?url=' + shareUrlEnc;
            parseFunc = function (r) {
                return onReady(r.count);
            };
            break;
          case 'google-plus':
            url = 'https://clients6.google.com/rpc?key=AIzaSyCKSbrvQasunBoV16zDH9R33D88CeLr9gQ';
            body = "[{\"method\":\"pos.plusones.get\",\"id\":\"p\"," +
            "\"params\":{\"id\":\"" + shareUrl + "\",\"userId\":\"@viewer\",\"groupId\":\"@self\",\"nolog\":true}," +
            "\"jsonrpc\":\"2.0\",\"key\":\"p\",\"apiVersion\":\"v1\"}]";
            parseFunc = function (r) {
                r = JSON.parse(r);
                if (r.length) {
                    return onReady(r[0].result.metadata.globalCounts.count);
                }
            };
            ajax(url, parseFunc, body);
            return;
          case 'linkedin':
            url = 'http://www.linkedin.com/countserv/count/share?url=' + shareUrlEnc;
            parseFunc = function (r) {
                return onReady(r.count);
            };
            break;
          case 'pinterest':
            url = 'http://api.pinterest.com/v1/urls/count.json?url=' + shareUrlEnc;
            parseFunc = function (r) {
                return onReady(r.count);
            };
            break;
          case 'vk':
            url = 'http://vk.com/share.php?act=count&url=' + shareUrlEnc;
            parseFunc = function (r) {
              return onReady(r);
            };
          break;
      }
      url && parseFunc && JSONPRequest(network, url, parseFunc, body);
    }

    function ajax(url, callback, body) {
      var request = new XMLHttpRequest();
      request.onreadystatechange = function () {
        if (this.readyState === 4) {
          if (this.status >= 200 && this.status < 400) {
            callback(this.responseText);
          }
        }
      };
      request.open('POST', url, true);
      request.setRequestHeader('Content-Type', 'application/json');
      request.send(body);
    }

    function JSONPRequest(network, url, callback) {
        var callbackName = 'cb_' + network + '_' + Math.round(100000 * Math.random()),
          script = document.createElement('script');
        window[callbackName] = function (data) {
          try { // IE8
            delete window[callbackName];
          } catch (e) {
        }
          document.body.removeChild(script);
          callback(data);
        };
        if (network == 'vk') {
          window['VK'] = {
            Share: {
              count: function (a, b) {
                window[callbackName](b);
              }
            }
          };
        } else if (network == 'google-plus') {
          window['services'] = {
            gplus: {
              cb: window[callbackName]
            }
          };
        }
      script.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + callbackName;
      document.body.appendChild(script);
      return true;
    }

    return {
      init: init
    };
})();

window.SocialShareKit = SocialShareKit;

$(document).ready(function() {
  if (App.mapId) {
  NPMap = {
    baseLayers: [{
      clickable: false,
      id: 'nps.7j7nxwde',
      type: 'mapbox'
    }],
    center: {
      lat: 39.37,
      lng: -105.7
    },
    div: 'map',
    modules: [{
      content: '<div id="my-custom-module"></div>',
      icon: 'info',
      title: 'Add Custom Features<button type="button" class="btn btn-xs btn-default pull-right npmap-modules-buttons" alt="Close" id="sidebar-hide-btn"><i class="fa fa-chevron-left"></i></button></h3>',
      type: 'custom',
      visible: true
    }],
    hooks: {
      preinit: function(callback){
        L.npmap.util._.appendJsFile([
          'http://ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min.js',
          'assets/libs/bootstrap-slider/js/bootstrap-slider.js',
          'assets/libs/share/js/share.js'
          ]);
        L.npmap.util._.appendCssFile([
          '//maxcdn.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css',
          'http://netdna.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css',
          'assets/libs/share/css/share.css'
        ]);
        App.init();
        ready();
        callback();
      },
      init: function(callback) {
        document.getElementById('my-custom-module').innerHTML = '' +
          '<h3 class="panel-title">Map Center & Zoom</h3>'+
          '<button class="btn btn-subtle btn-block" id="fulcrum-zoom">Zoom to Fulcrum Layer</button>'+
          '<button class="btn btn-subtle btn-block">Set Center to <span id="current-lat">39.00</span>, <span id="current-lng">-96.00</span></button>'+
          '<button class="btn btn-subtle btn-block">Set Zoom to <span id="current-zoom">4</span></button>'+
          '<button class="btn btn-subtle btn-block">Set Center & Zoom</button>'+
          '<button class="btn btn-subtle btn-block">Restrict Bounds</button>'+
          '<p class="help-block">The map\'s viewport is constrained to the bounds of the area you defined.</p>'+
          // '<h5 style="font-weight:bold;">Min and Max Zoom Levels</h5>'+
          // '<p style="margin-bottom:20px;">Use the slider to restrict the map to a range of zoom levels.</p>'+
          // '<b>€ 10</b> <input id="set-zoom" type="text" class="span2" value="" data-slider-min="10" data-slider-max="1000" data-slider-step="5" data-slider-value="[250,450]"/> <b>€ 1000</b>'+
          // '<input type="text" id="set-zoom" class="form-control" required>'+
          '<p class="help-block" style="margin:20px 0 0 0;">Initial Center: <span class="lat">39.00</span>, <span class="lng">-96.00</span><br>Initial Zoom: <span class="zoom">4</span></p>'+
          '<form style="margin-bottom:15px;">'+
            '<fieldset>'+
              '<h3 class="panel-title">Tools</h3>'+
              '<div class="checkbox">'+
                '<label><input type="checkbox" value="editControl">Draw</label>'+
              '</div>'+
              '<div class="checkbox">'+
                '<label><input type="checkbox" value="fullscreenControl">Fullscreen</label>'+
              '</div>'+
              '<div class="checkbox">'+
                '<label><input type="checkbox" value="geocoderControl">Geocoder</label>'+
              '</div>'+
              '<div class="checkbox">'+
                '<label><input type="checkbox" value="hashControl">Hash</label>'+
              '</div>'+
              '<div class="checkbox">'+
                '<label><input type="checkbox" value="homeControl" checked="checked">Home</label>'+
              '</div>'+
              '<div class="checkbox">'+
                '<label><input type="checkbox" value="locateControl">Locate</label>'+
              '</div>'+
              '<div class="checkbox">'+
                '<label><input type="checkbox" value="measureControl">Measure</label>'+
              '</div>'+
              '<div class="checkbox">'+
                '<label><input type="checkbox" value="overviewControl">Overview</label>'+
              '</div>'+
              '<div class="checkbox">'+
                '<label><input type="checkbox" value="printControl">Print</label>'+
              '</div>'+
              '<div class="checkbox">'+
                '<label><input type="checkbox" value="scaleControl">Scale</label>'+
              '</div>'+
              // '<div class="checkbox">'+
              //   '<label><input type="checkbox" value="shareControl">Share</label>'+
              // '</div>'+ 
              '<div class="checkbox">'+
                '<label><input type="checkbox" value="smallzoomControl" checked="checked">Zoom Buttons</label>'+
              '</div>'+
              '<div class="checkbox">'+
                '<label><input type="checkbox" value="zoomdisplayControl">Zoom Display</label>'+
              '</div>'+
            '</fieldset>'+
          '</form>'+
          '<form>'+
            '<fieldset>'+
              '<h3 class="panel-title">Behavior</h3>'+
              '<div class="checkbox">'+
                '<label><input type="checkbox" value="dragging" checked="checked">Draggable</label>'+
              '</div>'+
              '<div class="checkbox">'+
                '<label><input type="checkbox" value="doubleClickZoom" checked="checked">Double-click Zoom</label>'+
              '</div>'+
              '<div class="checkbox">'+
                '<label><input type="checkbox" value="scrollWheelZoom" checked="checked">Scroll Wheel Zoom</label>'+
              '</div>'+
              '<div class="checkbox">'+
                '<label><input type="checkbox" value="boxZoom" checked="checked">Box Zoom</label>'+
              '</div>'+
              '<div class="checkbox">'+
                '<label><input type="checkbox" value="touchZoom" checked="checked">Touch Zoom (Touchscreen)</label>'+
              '</div>'+
            '</fieldset>'+
          '</form>'+
          '</div>'+
        '</div>'+
      '</div>';

      var $ = window.parent.$,
        $currentLat = $('#current-lat'),
        $currentLng = $('#current-lng'),
        $currentZoom = $('#current-zoom'),
        map = NPMap.config.L,
        zoom = $('#fulcrum-zoom');

      function updateCurrent() {
        var latLng = map.getCenter();

        $currentLat.html(latLng.lat.toFixed(2));
        $currentLng.html(latLng.lng.toFixed(2));
        $currentZoom.html(map.getZoom());
      }

      zoom.click(function() {
        map.fitBounds(NPMap.config.overlays[0].L.getBounds());
        return false;
      });

      map.on('moveend', updateCurrent);
      updateCurrent();
      callback();
      }
    },
    overlays: [{
      type: 'geojson',
      url: 'https://web.fulcrumapp.com/shares/' + App.mapId + '.geojson'
    }],
    homeControl: {
      position: 'topright'
    },
     smallzoomControl: {
      position: 'topright'
    }
  };
  ready();
    // App.changezoom
  } else {
    $('#mask').show();
    alert("URL missing data share 'id' parameter!");
  }
});


  //   $("#refresh-btn").click(function() {
  // // refresh();
  //   $(".navbar-collapse.in").collapse("hide");
  //   return false;
  // });

  // $("#auto-refresh").click(function() {
  //   // refresh();
  //   if ($(this).prop("checked")) {
  //     // autoRefresh = window.setInterval(refresh, 60 * 1000);
  //   } else {
  //     // clearInterval(autoRefresh);
  //   }
  // });

  // $("#full-extent-btn").click(function() {
  //   
  //   $(".navbar-collapse.in").collapse("hide");
  //   return false;
  // });


  // $("#nav-btn").click(function() {
  //   $(".navbar-collapse").collapse("toggle");
  //   return false;
  // });

  // $("#share-btn").click(function() {
  //   var link = location.toString() + "&fulcrum_id=" + activeRecord;
  //   $("#share-hyperlink").attr("href", link);
  //   $("#share-twitter").attr("href", "https://twitter.com/intent/tweet?url=" + encodeURIComponent(link) + "&via=fulcrumapp");
  //   $("#share-facebook").attr("href", "https://facebook.com/sharer.php?u=" + encodeURIComponent(link));
  // });


/* globals tinycolor */

var alertify, FulcrumStyler, mapId, moment, NPMap;

function ready() {
  FulcrumStyler = (function() {
    var $activeChangeStyleButton = null,
      $activeConfigureInteractivityButton = null,
      $buttonAddAnotherLayer = $('#button-addAnotherLayer'),
      $buttonCreateDatasetAgain = $('#button-createDatasetAgain'),
      $buttonEditBaseMapsAgain = $('#button-editBaseMapsAgain'),
      $buttonExport = $('#button-export'),
      $buttonSave = $('#button-save'),
      $iframe = $('#iframe-map'),
      $lat = $('.lat'),
      $lng = $('.lng'),
      $layers = $('#layers'),
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
      title = null,
      titleSet = false,
      titleZ = null,
      $modalAddLayer, $modalEditBaseMaps, $modalExport, $modalViewConfig;

    function disableSave() {
      $buttonSave.prop('disabled', true);
      $buttonExport.text('Export Map');
    }
    function enableSave() {
      $buttonSave.prop('disabled', false);
      $buttonExport.text('Save & Export Map');
    }
    function escapeHtml(unsafe) {
      return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
        //.replace(/'/g, '&#039;');
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
                      '<select class="form-control marker-library" id="' + getName('marker-library', 'point') + '" onchange="FulcrumStyler.ui.steps.handlers.changeMarkerLibrary(this);return false;">' +
                        '<option value="letters">Letters</option>' +
                        '<option value="maki">Maki</option>' +
                        '<option value="npmaki">NPMaki</option>' +
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
        var disabled = geometryTypes.indexOf(id) === -1,
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
      return '' +
        '<form class="change-style form-horizontal" id="' + name + '_layer-change-style" role="form">' +
          '<ul class="nav nav-tabs" style="padding-left:5px;">' +
            createTab('point', 'Point') +
            createTab('line', 'Line') +
            createTab('polygon', 'Polygon') +
          '</ul>' +
          '<div class="tab-content">' +
            createPanel('point') +
            createPanel('line') +
            createPanel('polygon') +
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
    function goToStep(from, to) {
      $($stepSection[from]).hide();
      $($stepSection[to]).show();
      $(stepLis[from]).removeClass('active');
      $(stepLis[to]).addClass('active');
    }
    function loadModule(module, callback) {
      module = module.replace('FulcrumStyler.', '').replace(/\./g,'/');

      $.ajax({
        dataType: 'html',
        success: function (html) {
          $('body').append(html);
          $.getScript(module + '.js', function() {
            if (callback) {
              debugger;
              callback();
            }
          });
        },
        url: module + '.html'
      });
    }
    function saveMap(callback) {
      var $this = $(this);

      FulcrumStyler.showLoading();
      $this.blur();
      $.ajax({
        data: {
          description: description,
          isPublic: true,
          isShared: true,
          json: JSON.stringify(NPMap),
          mapId: mapId || null,
          name: title
        },
        dataType: 'json',
        error: function() {
          FulcrumStyler.hideLoading();
          alertify.error('You must be connected to the National Park Service network to save a map.');

          if (typeof callback === 'function') {
            callback(false);
          }
        },
        success: function(response) {
          var error = 'Sorry, there was an unhandled error while saving your map. Please try again.',
            success = false;

          FulcrumStyler.hideLoading();

          if (response) {
            if (response.success === true) {
              if (!mapId && window.history.replaceState) {
                var location = window.location,
                  url = location.protocol + '//' + location.host + location.pathname + '?mapId=' + response.mapId;

                window.history.replaceState({
                  path: url
                }, '', url);
              }

              mapId = response.mapId;
              updateSaveStatus(response.modified);
              alertify.success('Your map was saved!');
              success = true;
            } else if (response.success === false && response.error) {
              if (response.type === 'login') {
                $modalSignIn.modal('show');
              } else {
                alertify.error(response.error);
              }
            } else {
              alertify.error(error);
            }
          } else {
            alertify.error(error);
          }

          if (typeof callback === 'function') {
            callback(success);
          }
        },
        type: 'POST',
        url: '/FulcrumStyler/save/'
      });
    }
    function unescapeHtml(unsafe) {
      return unsafe
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '\"');
        //.replace(/&#039;/g, '\'');
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

    $(document).ready(function() {
      if (mapId) {
        descriptionSet = true;
        settingsSet = true;
        titleSet = true;
      } else {
        setTimeout(function() {
          $('#metadata .title a').editable('toggle');
        }, 200);
      }
    });

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
          'marker-symbol': null
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
      ui: {
        metadata: {
          init: function() {
            description = NPMap.description;
            firstLoad = true;
            title = NPMap.name;

            $('#metadata .description a').text(description).editable({
              animation: false,
              container: '#metadata div.info',
              emptytext: 'Add a description to give your map context.',
              validate: function(value) {
                if ($.trim(value) === '') {
                  return 'Please enter a description for your map.';
                }
              }
            })
              .on('hidden', function() {
                var newDescription = $('#metadata .description a').text(),
                  next = $(this).next();

                if (descriptionSet) {
                  if (newDescription !== description) {
                    enableSave();
                  }
                } else {
                  $($('#button-settings span')[2]).popover('show');

                  next.css({
                    'z-index': descriptionZ
                  });
                  $(next.find('button')[1]).css({
                    display: 'block'
                  });
                  descriptionSet = true;

                  if (!settingsSet) {
                    next = $('#metadata .buttons .popover');
                    settingsZ = next.css('z-index');
                    next.css({
                      'z-index': 1031
                    });
                    $('#metadata .buttons .popover button').focus();
                  }
                }

                description = newDescription;
                NPMap.description = description;
              })
              .on('shown', function() {
                var next = $(this).parent().next();

                if (!descriptionSet) {
                  descriptionZ = next.css('z-index');
                  next.css({
                    'z-index': 1031
                  });
                  $(next.find('button')[1]).css({
                    display: 'none'
                  });
                }

                next.find('textarea').css({
                  'resize': 'none'
                });
              });
            $('#metadata .title a').text(title).editable({
              animation: false,
              emptytext: 'Untitled Map',
              validate: function(value) {
                if ($.trim(value) === '') {
                  return 'Please enter a title for your map.';
                }
              }
            })
              .on('hidden', function() {
                var newDescription = $('#metadata .description a').text(),
                  newTitle = $('#metadata .title a').text(),
                  next = $(this).next();

                if (!newDescription || newDescription === 'Add a description to give your map context.') {
                  $('#metadata .description a').editable('toggle');
                } else {
                  if (newTitle !== title) {
                    enableSave();
                  }
                }

                if (!titleSet) {
                  next.css({
                    'z-index': titleZ
                  });
                  $(next.find('button')[1]).css({
                    display: 'block'
                  });
                  titleSet = true;
                }

                title = newTitle;
                NPMap.name = title;
              })
              .on('shown', function() {
                var next = $(this).next();

                if (!titleSet) {
                  titleZ = next.css('z-index');
                  next.css({
                    'z-index': 1031
                  });
                  $(next.find('button')[1]).css({
                    display: 'none'
                  });
                }

                next.find('.editable-clear-x').remove();
                next.find('input').css({
                  'padding-right': '10px'
                });
              });
          },
          load: function() {
            if (NPMap.description) {
              $('#metadata .description a').text(NPMap.description);
            }

            if (NPMap.name) {
              $('#metadata .title a').text(NPMap.name);
            }

            updateSaveStatus(NPMap.modified);
          }
        },
        steps: {
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
                overlay;

              for (var i = 0; i < NPMap.overlays.length; i++) {
                var o = NPMap.overlays[i];

                if (o.name === overlayName) {
                  overlay = o;
                  break;
                }
              }

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
                i, overlay;

              for (i = 0; i < NPMap.overlays.length; i++) {
                var o = NPMap.overlays[i];

                if (o.name === overlayName) {
                  overlay = o;
                  break;
                }
              }

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
            clickLayerChangeStyle: function(el) {
              var $el = $(el);

              if ($el.data('popover-created')) {
                $el.popover('toggle');
              } else {
                var layer = document.getElementById('iframe-map').contentWindow.NPMap.config.overlays[getLayerIndexFromButton(el)],
                  overlay = NPMap.overlays[getLayerIndexFromButton(el)],
                  name = overlay.name.split(' ').join('_');

                $el.popover({
                  animation: false,
                  container: 'body',
                  content: '' +
                    generateLayerChangeStyle(name, layer) +
                    '<div style="text-align:center;">' +
                      '<button class="btn btn-primary" onclick="FulcrumStyler.ui.steps.handlers.clickApplyStyles(\'' + name + '\',\'' + overlay.name + '\');" type="button">Apply</button>' +
                      '<button class="btn btn-default" onclick="FulcrumStyler.ui.steps.handlers.cancelApplyStyles();" style="margin-left:5px;">Cancel</button>' +
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
                          FulcrumStyler.ui.steps.filterColors(color);
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
                                  FulcrumStyler.ui.steps.filterColors(style['marker-color']);

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
                var overlay = NPMap.overlays[getLayerIndexFromButton(el)],
                  name = overlay.name.split(' ').join('_'),
                  supportsTooltips = (overlay.type === 'cartodb' || overlay.type === 'csv' || overlay.type === 'geojson' || overlay.type === 'kml' || overlay.type === 'mapbox'),
                  html;

                html = '' +
                  // Checkbox here "Display all fields in a table?" should be checked on by default.
                  '<form class="configure-interactivity" id="' + name + '_layer-configure-interactivity" role="form">' +
                    '<fieldset>' +
                      '<div class="form-group">' +
                        '<span><label for="' + name + '_title">Title</label><a href="https://github.com/nationalparkservice/npmap-FulcrumStyler/wiki/Popups-and-Tooltips" target="_blank"><img data-container="body" data-placement="bottom" rel="tooltip" src="img/help@2x.png" style="cursor:pointer;float:right;height:18px;" title="The title will display in bold at the top of the popup. HTML and Handlebars templates are allowed. Click for more info."></a></span>' +
                        '<input class="form-control" id="' + name + '_title" rows="3" type="text"></input>' +
                      '</div>' +
                      '<div class="form-group">' +
                        '<span><label for="' + name + '_description">Description</label><a href="https://github.com/nationalparkservice/npmap-FulcrumStyler/wiki/Popups-and-Tooltips" target="_blank"><img data-container="body" data-placement="bottom" rel="tooltip" src="img/help@2x.png" style="cursor:pointer;float:right;height:18px;" title="The description will display underneath the title. HTML and Handlebars templates are allowed. Click for more info."></a></span>' +
                        '<textarea class="form-control" id="' + name + '_description" rows="4"></textarea>' +
                      '</div>' +
                      (supportsTooltips ? '' +
                        '<div class="checkbox">' +
                          '<label>' +
                            '<input onchange="FulcrumStyler.ui.steps.handlers.changeEnableTooltips(this);return false;" type="checkbox" value="tooltips"> Enable tooltips?' +
                          '</label>' +
                        '</div>' +
                        '<div class="form-group">' +
                          '<span><label for="' + name + '_tooltip">Tooltip</label><a href="https://github.com/nationalparkservice/npmap-FulcrumStyler/wiki/Popups-and-Tooltips" target="_blank"><img data-container="body" data-placement="bottom" rel="tooltip" src="img/help@2x.png" style="cursor:pointer;float:right;height:18px;" title="Tooltips display when the cursor moves over a shape. HTML and Handlebars templates are allowed. Click for more info."></a></span>' +
                          '<input class="form-control" id="' + name + '_tooltip" type="text" disabled></input>' +
                        '</div>' +
                      '' : '') +
                    '</fieldset>' +
                  '</form>' +
                  '<div style="text-align:center;">' +
                    '<button class="btn btn-primary" onclick="FulcrumStyler.ui.steps.handlers.clickApplyInteractivity(\'' + name + '\',\'' + overlay.name + '\');" type="button">Apply</button><button class="btn btn-default" onclick="FulcrumStyler.ui.steps.handlers.cancelApplyInteractivity();" style="margin-left:5px;">Cancel</button>' +
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

                    overlay = NPMap.overlays[getLayerIndexFromButton(el)];
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
                FulcrumStyler.ui.steps.removeLi(el);
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

                  FulcrumStyler.ui.steps.refreshUl();
                }
              });
            $('#button-addAnotherLayer, #button-addLayer').on('click', function() {
              if ($modalAddLayer) {
                $modalAddLayer.modal('show');
              } else {
                loadModule('FulcrumStyler.ui.modal.addLayer', function() {
                  $modalAddLayer = $('#modal-addLayer');
                });
              }
            });
            $('#button-createDataset, #button-createDatasetAgain').on('click', function() {
              alertify.log('The create dataset functionality is not quite ready. Please check back soon.', 'info', 15000);
            });
            $('#button-editBaseMaps, #button-editBaseMapsAgain').on('click', function() {
              if ($modalEditBaseMaps) {
                $modalEditBaseMaps.modal('show');
              } else {
                loadModule('FulcrumStyler.ui.modal.editBaseMaps', function() {
                  $modalEditBaseMaps = $('#modal-editBaseMaps');
                });
              }
            });
          },
          load: function() {
            if ($.isArray(NPMap.overlays)) {
              $.each(NPMap.overlays, function(i, overlay) {
                FulcrumStyler.ui.steps.overlayToLi(overlay);
              });
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
                      '<button class="btn btn-default btn-xs" data-container="section" onclick="FulcrumStyler.ui.steps.handlers.clickLayerEdit(this);" type="button">' +
                        '<span class="fa fa-edit"> Edit</span>' +
                      '</button>' +
                    '</div>' +
                    '<div style="float:right;">' +
                      '<button class="btn btn-default btn-xs interactivity" data-container="section" data-placement="bottom" onclick="FulcrumStyler.ui.steps.handlers.clickLayerConfigureInteractivity(this);" rel="tooltip" style="' + (interactive ? '' : 'display:none;') + 'margin-right:5px;" title="Configure Interactivity" type="button">' +
                        '<span class="fa fa-comment"></span>' +
                      '</button>' +
                      '<button class="btn btn-default btn-xs" data-container="section" data-placement="bottom" onclick="FulcrumStyler.ui.steps.handlers.clickLayerChangeStyle(this);" rel="tooltip" style="' + (styleable ? '' : 'display:none;') + 'margin-right:5px;" title="Change Style" type="button">' +
                        '<span class="fa fa-map-marker"></span>' +
                      '</button>' +
                      '<button class="btn btn-default btn-xs" data-container="section" data-placement="bottom" onclick="FulcrumStyler.ui.steps.handlers.clickLayerRemove(this);" rel="tooltip" title="Delete Overlay" type="button">' +
                        '<span class="fa fa-trash-o"></span>' +
                      '</button>' +
                    '</div>' +
                  '</div>' +
                '</div>' +
              ''));
              FulcrumStyler.ui.steps.refreshUl();
            },
            refreshUl: function() {
              var children = $ul.children(),
                previous = $ul.parent().prev();

              if (children.length === 0) {
                $buttonAddAnotherLayer.hide();
                $buttonCreateDatasetAgain.hide();
                $buttonEditBaseMapsAgain.hide();
                previous.show();
              } else {
                $buttonAddAnotherLayer.show();
                $buttonCreateDatasetAgain.show();
                $buttonEditBaseMapsAgain.show();
                previous.hide();
                $.each(children, function(i, li) {
                  $($(li).children('.letter')[0]).text(abcs[i]);
                });
              }
            },
            removeLi: function(el) {
              $($(el).parents('li')[0]).remove();
              FulcrumStyler.ui.steps.refreshUl();
            },
            updateOverlayLetters: function() {}
          },
          init: function() {
            var buttonBlocks = $('.btn-block');

              $(buttonBlocks[0]).on('click', function() {
                var center = getLeafletMap().getCenter();

                NPMap.center = {
                  lat: center.lat,
                  lng: center.lng
                };
                updateInitialCenterAndZoom();
                FulcrumStyler.updateMap();
              });
              $(buttonBlocks[1]).on('click', function() {
                NPMap.zoom = getLeafletMap().getZoom();
                updateInitialCenterAndZoom();
                FulcrumStyler.updateMap();
              });
              $(buttonBlocks[2]).on('click', function() {
                var map = getLeafletMap(),
                  center = map.getCenter();

                NPMap.center = {
                  lat: center.lat,
                  lng: center.lng
                };
                NPMap.zoom = map.getZoom();

                updateInitialCenterAndZoom();
                FulcrumStyler.updateMap();
              });
              $(buttonBlocks[3]).on('click', function() {
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
              $('#set-zoom').slider({
                //center: 4,
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
          : {
            init: function() {
              $.each($('#tools-and-settings form'), function(i, form) {
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
              $.each($('#tools-and-settings form'), function(i, form) {
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
            $buttonExport.on('click', function() {
              function openExport() {
                if ($modalExport) {
                  $modalExport.modal('show');
                } else {
                  loadModule('FulcrumStyler.ui.modal.export', function() {
                    $modalExport = $('#modal-export');
                  });
                }
              }

              if ($(this).text().indexOf('Save') === -1) {
                openExport();
              } else {
                saveMap(function(success) {
                  if (mapId) {
                    if (!success) {
                      alertify.log('Because your map couldn\'t be saved, but was successfully saved at one point, any exports you do here will not include any changes made to the map since the last time it was saved.', 'error', 15000);
                    }

                    openExport();
                  } else {
                    alertify.log('The map cannot be exported until it is saved. Please try again. If this error persists, please report an issue by clicking on "Submit Feedback" below.', 'error', 15000);
                  }
                });
              }
            });
            $('#button-config').on('click', function() {
              loadModule('FulcrumStyler.ui.modal.viewConfig', function() {
                $modalViewConfig = $('#modal-viewConfig');
              });
            });
            $('#button-refresh').on('click', function() {
              FulcrumStyler.updateMap(null, true);
            });
            $('#button-save').on('click', saveMap);
            $('#button-settings').on('click', function() {
              var $this = $(this),
                $span = $($this.children('span')[2]);

              if ($this.hasClass('active')) {
                $span.popover('hide');
                $this.removeClass('active');
              } else {
                $span.popover('show');
                $this.addClass('active');
              }
            });
            $($('#button-settings span')[2]).popover({
              animation: false,
              container: '#metadata .buttons',
              content: '<div class="checkbox"><label><input type="checkbox" value="public" checked="checked" disabled>Is this map public?</label></div><div class="checkbox"><label><input type="checkbox" value="shared" checked="checked" disabled>Share this map with others?</label></div><div style="text-align:center;"><button type="button" class="btn btn-primary" onclick="FulcrumStyler.ui.toolbar.handlers.clickSettings(this);">Acknowledge</button></div>',
              html: true,
              placement: 'bottom',
              trigger: 'manual'
            })
              .on('shown.bs.popover', function() {
                if (settingsSet) {
                  $('#metadata .buttons .popover .btn-primary').hide();
                }
              });
          }
        }
      },
      addOverlay: function(overlay) {
        NPMap.overlays.push(overlay);
        FulcrumStyler.ui.steps.overlayToLi(overlay);
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

            if (!manualRefresh) {
              if (firstLoad) {
                firstLoad = false;
              } else {
                enableSave();
              }
            }
          }
        }, 0);
      }
    };
  })();

  FulcrumStyler.ui.metadata.init();
  FulcrumStyler.ui.steps.init();
  FulcrumStyler.ui.toolbar.init();

  if (mapId) {
    // FulcrumStyler.ui.metadata.load();
    FulcrumStyler.ui.steps.load();
    // delete NPMap.created;
    // delete NPMap.isPublic;
    // delete NPMap.isShared;
    // delete NPMap.modified;
    // delete NPMap.tags;
  }

  FulcrumStyler.buildTooltips();
  FulcrumStyler.updateMap();
}

var App = {
  mapId: document.location.search.replace('?id=', '')
}

console.log(App.mapId);
if (App.mapId) {
    NPMap = {
      baseLayers: [
        'nps-parkTiles'
      ],
      center: {
        lat: 39.06,
        lng: -96.02
      },
      div: 'map',
      overlays: [{
        type: 'geojson',
        url: 'https://web.fulcrumapp.com/shares/' + App.mapId + '.geojson'
      }],
      homeControl: true,
      smallzoomControl: true,
      zoom: 4
    };
    ready();
  // var msg = 'The specified map could not be loaded. Please refresh the page.';

  // $.ajax({
  //   dataType: 'jsonp',
  //   error: function() {
  //     window.alert(msg);
  //   },
  //   jsonpCallback: 'callback',
  //   success: function(response) {
  //     if (response) {
  //       NPMap = response;
  //       ready();
  //     } else {
  //       window.alert(msg);
  //     }
  //   },
  //   timeout: 3000,
  //   url: 'http://www.nps.gov/maps/FulcrumStyler/configs/' + App.mapId + '.jsonp'
  // });
} else {
  $('#mask').show();

  NPMap = {
    baseLayers: [
      'nps-parkTiles'
    ],
    center: {
      lat: 39.06,
      lng: -96.02
    },
    div: 'map',
    overlays: [{
      type: 'geojson',
      url: 'https://web.fulcrumapp.com/shares/' + App.mapId + '.geojson'
    }],
    homeControl: true,
    smallzoomControl: true,
    zoom: 4
  };
}


