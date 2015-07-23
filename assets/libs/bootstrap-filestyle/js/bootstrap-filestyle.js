/**
 * bootstrap-filestyle - Modified by National Park Service
 * http://dev.tudosobreweb.com.br/bootstrap-filestyle/
 *
 * Copyright (c) 2013 Markus Vinicius da Silva Lima
 * Version 1.0.3
 * Licensed under the MIT license.
 */
(function($) {
  'use strict';
  
  var Filestyle = function(element, options) {
      this.options = options;
      this.$elementFilestyle = [];
      this.$element = $(element);
    },
    old = $.fn.filestyle;

  Filestyle.prototype = {
    clear: function() {
      this.$element.val('');
      this.$elementFilestyle.find(':text').val('');
    },
    destroy: function() {
      this.$element
        .removeAttr('style')
        .removeData('filestyle')
        .val('');
      this.$elementFilestyle.remove();
    },
    icon: function(value) {
      if (value === true) {
        if (!this.options.icon) {
          this.options.icon = true;
          this.$elementFilestyle.find('button').prepend(this.htmlIcon());
        }
      } else if (value === false) {
        if (this.options.icon) {
          this.options.icon = false;
          this.$elementFilestyle.find('i').remove();
        }
      } else {
        return this.options.icon;
      }
    },
    input: function(value) {
      if (value === true) {
        if (!this.options.input) {
          this.options.input = true;
          this.$elementFilestyle.prepend(this.htmlInput());

          var content = '',
            files = [];

          if (this.$element[0].files === undefined) {
            files[0] = {'name': this.$element[0].value};
          } else {
            files = this.$element[0].files;
          }

          for (var i = 0; i < files.length; i++) {
            content += files[i].name.split('\\').pop() + ', ';
          }

          if (content !== '') {
            this.$elementFilestyle.find(':text').val(content.replace(/\, $/g, ''));
          }
        }
      } else if (value === false) {
        if (this.options.input) {
          this.options.input = false;
          this.$elementFilestyle.find(':text').remove();
        }
      } else {
        return this.options.input;
      }
    },
    buttonText: function(value) {
      if (value !== undefined) {
        this.options.buttonText = value;
        this.$elementFilestyle.find('button').html(this.options.buttonText);
      } else {
        return this.options.buttonText;
      }
    },
    classButton: function(value) {
      if (value !== undefined) {
        this.options.classButton = value;
        this.$elementFilestyle.find('button').attr({'class': this.options.classButton});

        if (this.options.classButton.search(/btn-inverse|btn-primary|btn-danger|btn-warning|btn-success/i) !== -1) {
          this.$elementFilestyle.find('button i').addClass('icon-white');
        } else {
          this.$elementFilestyle.find('button i').removeClass('icon-white');
        }
      } else {
        return this.options.classButton;
      }
    },
    classIcon: function(value) {
      if (value !== undefined) {
        this.options.classIcon = value;

        if (this.options.classButton.search(/btn-inverse|btn-primary|btn-danger|btn-warning|btn-success/i) !== -1) {
          this.$elementFilestyle.find('button').find('i').attr({'class': 'icon-white '+this.options.classIcon});
        } else {
          this.$elementFilestyle.find('button').find('i').attr({'class': this.options.classIcon});
        }
      } else {
        return this.options.classIcon;
      }
    },
    classInput: function(value) {
      if (value !== undefined) {
        this.options.classInput = value;
        this.$elementFilestyle.find(':text').addClass(this.options.classInput);
      } else {
        return this.options.classInput;
      }
    },
    htmlIcon: function () {
      if (this.options.icon) {
        var colorIcon = '';

        if (this.options.classButton.search(/btn-inverse|btn-primary|btn-danger|btn-warning|btn-success/i) !== -1) {
          colorIcon = ' icon-white ';
        }

        return '<i class="'+colorIcon+this.options.classIcon+'"></i> ';
      } else {
        return '';
      }
    },
    htmlInput: function() {
      if (this.options.input) {
        return '<input type="text" class="'+this.options.classInput+'"> ';
      } else {
        return '';
      }
    },
    constructor: function() {
      var files = [],
        html = '',
        me = this,
        id = this.$element.attr('id');

      if (id === '' || !id) {
        id = 'filestyle-'+$('.bootstrap-filestyle').length;
        this.$element.attr({'id': id});
      }

      html = this.htmlInput() + '<button class="' + this.options.classButton +'">' + this.options.buttonText + '</button>';
      this.$elementFilestyle = $('<div class="bootstrap-filestyle" style="display:inline;">'+html+'</div>');

      var $button = this.$elementFilestyle.find('button');
      var $labelFocusableContainer = $button.parent();
      
      $button.click(function() {
        $($labelFocusableContainer.parent().children('label')[0]).click();
      });
      $labelFocusableContainer
        .attr('tabindex', '0')
        .keypress(function(e) {
          if (e.keyCode === 13 || e.charCode === 32) {
            $button.click();
          }
        });
      $($labelFocusableContainer.children('input')[0]).click(function() {
        $button.click();
      });
      this.$element
        .css({
          left:'-9999px',
          position:'absolute'
        })
        .attr('tabindex', '-1')
        .after(this.$elementFilestyle)
        .change(function() {
          var content = '';

          if (this.files === undefined) {
            files[0] = {'name': this.value};
          } else {
            files = this.files;
          }

          for (var i = 0; i < files.length; i++) {
            content += files[i].name.split('\\').pop() + ', ';
          }

          if (content !== '') {
            me.$elementFilestyle.find(':text').val(content.replace(/\, $/g, ''));
          }
        });

      if (window.navigator.userAgent.search(/firefox/i) > -1) {
        this.$elementFilestyle.find('button').click(function () {
          me.$element.click();
          return false;
        });
      }
    }
  };
  $.fn.filestyle = function(option, value) {
    var get = '',
      element = this.each(function () {
        if ($(this).attr('type') === 'file') {
          var $this = $(this),
            data = $this.data('filestyle'),
            options = $.extend({}, $.fn.filestyle.defaults, option, typeof option === 'object' && option);

          if (!data) {
            $this.data('filestyle', (data = new Filestyle(this, options)));
            data.constructor();
          }

          if (typeof option === 'string') {
            get = data[option](value);
          }
        }
      });

    if (typeof get !== undefined) {
      return get;
    } else {
      return element;
    }
  };
  $.fn.filestyle.defaults = {
    buttonText: 'Choose File',
    input: true,
    icon: true,
    classButton: 'btn',
    classInput: 'input-large',
    classIcon: 'icon-folder-open'
  };
  $.fn.filestyle.noConflict = function() {
    $.fn.filestyle = old;
    return this;
  };

  $('.filestyle').each(function () {
    var $this = $(this);

    $this.filestyle({
      buttonText: $this.attr('data-buttonText'),
      input: $this.attr('data-input') === 'false' ? false : true,
      icon: $this.attr('data-icon') === 'false' ? false : true,
      classButton: $this.attr('data-classButton'),
      classInput: $this.attr('data-classInput'),
      classIcon: $this.attr('data-classIcon')
    });
  });
})(window.jQuery);
