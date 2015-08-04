;(function ( $, window, undefined ) {
  var document = window.document;
  $.fn.ssk = function(method) {
    var methods = {
      init : function(options) {
        this.ssk.settings = $.extend({}, this.ssk.defaults, options);
        var settings = this.ssk.settings,
          networks = this.ssk.settings.networks,
          theme = this.ssk.settings.theme,
          orientation = this.ssk.settings.orientation,
          affix = this.ssk.settings.affix,
          margin = this.ssk.settings.margin,
          pageTitle = this.ssk.settings.title||$(document).attr('title'),
          pageUrl = this.ssk.settings.urlTossk||$(location).attr('href'),
          pageDesc = "";
        $.each($(document).find('meta[name="description"]'),function(idx,item){
          pageDesc = $(item).attr("content");
        });
                
        return this.each(function() {
          var $element = $(this),
            id = $element.attr("id"),
            u = encodeURIComponent(pageUrl),
            t = encodeURIComponent(pageTitle),
            d = pageDesc.substring(0,250),
            href;
            // append HTML for each network button
            for (var item in networks) {
              item = networks[item];
              href = helpers.networkDefs[item].url;
              href = href.replace('|u|',u).replace('|t|',t).replace('|d|',d)
                .replace('|140|',t.substring(0,130));
              $("<a href='" + href + "' title='Share this page on " + item + "' class='buttons ssk ssk-" + item + "'></a>")
                .appendTo($element);
            }
                    
            // customize css
            // $("#"+id+".ssk-"+theme).css('margin',margin);
            
            // if (orientation != "horizontal"){
            //   $("#"+id+" a.ssk-"+theme).css('display','block');
            // }
            // else {
            //   $("#"+id+" a.ssk-"+theme).css('display','inline-block');
            // }
                    
            if (typeof affix != "undefined"){
                $element.addClass('ssk-affix');
                if (affix.indexOf('right')!=-1){
                  $element.css('left','auto');
                  $element.css('right','0px');
                  if (affix.indexOf('center')!=-1){
                    $element.css('top','40%');
                  }
                }
                else if (affix.indexOf('left center')!=-1){
                  $element.css('top','40%');
                }
                        
                if (affix.indexOf('bottom')!=-1){
                  $element.css('bottom','0px');
                  $element.css('top','auto');
                  if (affix.indexOf('center')!=-1){
                    $element.css('left','40%');
                }
              }
            }

                $('.ssk').click(function(){
                window.open($(this).attr('href'),'t','    toolbar=0,resizable=1,status=0,width=640,height=528');
                return false;
              });  
            });
          }        
        }

        var helpers = {
          networkDefs: {
            facebook:{url:'http://www.facebook.com/share.php?u=|u|'},
            twitter:{url:'https://twitter.com/share?url=|u|&text=|140|'},
            email:{url:'mailto:?subject=|t|'}
          }
        }
     
        if (methods[method]) {
          return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
          return methods.init.apply(this, arguments);
        } else {
          $.error( 'Method "' +  method + '" does not exist in social plugin');
        }

    }

    $.fn.ssk.defaults = {
      networks: ['facebook','twitter','email'],
      theme: 'icon',
      autoShow: true,
      margin: '3px',
      orientation: 'horizontal',
      useIn1: false
    }

  $.fn.ssk.settings = {}      
  })(jQuery, window);