/* globals tinycolor */
/* jshint camelcase: false */

/*
 *  Bootstrap Color Picker Sliders - v3.0.1
 *
 *  Bootstrap 3 optimized responsive color selector with HSV, HSL, RGB and CIE-Lch (which supports human perceived lightness) selectors and color swatches.
 *  http://www.virtuosoft.eu/code/bootstrap-colorpickersliders/
 *
 *  Made by István Ujj-Mészáros
 *  Under Apache License v2.0 License
 *
 *  Requirements:  *
 *      TinyColor: https://github.com/bgrins/TinyColor/
 *
 *  Using color math algorithms from EasyRGB Web site:/
 *      http://www.easyrgb.com/index.php?X=MATH */

(function(){var r=/^[\s,#]+/,e=/\s+$/,t=0,a=Math,n=a.round,i=a.min,f=a.max,s=a.random;var o=function M(r,e){r=r?r:"";e=e||{};if(r instanceof M){return r}if(!(this instanceof M)){return new M(r,e)}var a=h(r);this._r=a.r,this._g=a.g,this._b=a.b,this._a=a.a,this._roundA=n(100*this._a)/100,this._format=e.format||a.format;this._gradientType=e.gradientType;if(this._r<1){this._r=n(this._r)}if(this._g<1){this._g=n(this._g)}if(this._b<1){this._b=n(this._b)}this._ok=a.ok;this._tc_id=t++};o.prototype={isDark:function(){return this.getBrightness()<128},isLight:function(){return!this.isDark()},isValid:function(){return this._ok},getFormat:function(){return this._format},getAlpha:function(){return this._a},getBrightness:function(){var r=this.toRgb();return(r.r*299+r.g*587+r.b*114)/1e3},setAlpha:function(r){this._a=y(r);this._roundA=n(100*this._a)/100;return this},toHsv:function(){var r=c(this._r,this._g,this._b);return{h:r.h*360,s:r.s,v:r.v,a:this._a}},toHsvString:function(){var r=c(this._r,this._g,this._b);var e=n(r.h*360),t=n(r.s*100),a=n(r.v*100);return this._a==1?"hsv("+e+", "+t+"%, "+a+"%)":"hsva("+e+", "+t+"%, "+a+"%, "+this._roundA+")"},toHsl:function(){var r=l(this._r,this._g,this._b);return{h:r.h*360,s:r.s,l:r.l,a:this._a}},toHslString:function(){var r=l(this._r,this._g,this._b);var e=n(r.h*360),t=n(r.s*100),a=n(r.l*100);return this._a==1?"hsl("+e+", "+t+"%, "+a+"%)":"hsla("+e+", "+t+"%, "+a+"%, "+this._roundA+")"},toHex:function(r){return d(this._r,this._g,this._b,r)},toHexString:function(r){return"#"+this.toHex(r)},toHex8:function(){return v(this._r,this._g,this._b,this._a)},toHex8String:function(){return"#"+this.toHex8()},toRgb:function(){return{r:n(this._r),g:n(this._g),b:n(this._b),a:this._a}},toRgbString:function(){return this._a==1?"rgb("+n(this._r)+", "+n(this._g)+", "+n(this._b)+")":"rgba("+n(this._r)+", "+n(this._g)+", "+n(this._b)+", "+this._roundA+")"},toPercentageRgb:function(){return{r:n(x(this._r,255)*100)+"%",g:n(x(this._g,255)*100)+"%",b:n(x(this._b,255)*100)+"%",a:this._a}},toPercentageRgbString:function(){return this._a==1?"rgb("+n(x(this._r,255)*100)+"%, "+n(x(this._g,255)*100)+"%, "+n(x(this._b,255)*100)+"%)":"rgba("+n(x(this._r,255)*100)+"%, "+n(x(this._g,255)*100)+"%, "+n(x(this._b,255)*100)+"%, "+this._roundA+")"},toName:function(){if(this._a===0){return"transparent"}if(this._a<1){return false}return _[d(this._r,this._g,this._b,true)]||false},toFilter:function(r){var e="#"+v(this._r,this._g,this._b,this._a);var t=e;var a=this._gradientType?"GradientType = 1, ":"";if(r){var n=o(r);t=n.toHex8String()}return"progid:DXImageTransform.Microsoft.gradient("+a+"startColorstr="+e+",endColorstr="+t+")"},toString:function(r){var e=!!r;r=r||this._format;var t=false;var a=this._a<1&&this._a>=0;var n=!e&&a&&(r==="hex"||r==="hex6"||r==="hex3"||r==="name");if(n){if(r==="name"&&this._a===0){return this.toName()}return this.toRgbString()}if(r==="rgb"){t=this.toRgbString()}if(r==="prgb"){t=this.toPercentageRgbString()}if(r==="hex"||r==="hex6"){t=this.toHexString()}if(r==="hex3"){t=this.toHexString(true)}if(r==="hex8"){t=this.toHex8String()}if(r==="name"){t=this.toName()}if(r==="hsl"){t=this.toHslString()}if(r==="hsv"){t=this.toHsvString()}return t||this.toHexString()}};o.fromRatio=function(r,e){if(typeof r=="object"){var t={};for(var a in r){if(r.hasOwnProperty(a)){if(a==="a"){t[a]=r[a]}else{t[a]=R(r[a])}}}r=t}return o(r,e)};function h(r){var e={r:0,g:0,b:0};var t=1;var a=false;var n=false;if(typeof r=="string"){r=q(r)}if(typeof r=="object"){if(r.hasOwnProperty("r")&&r.hasOwnProperty("g")&&r.hasOwnProperty("b")){e=u(r.r,r.g,r.b);a=true;n=String(r.r).substr(-1)==="%"?"prgb":"rgb"}else if(r.hasOwnProperty("h")&&r.hasOwnProperty("s")&&r.hasOwnProperty("v")){r.s=R(r.s);r.v=R(r.v);e=b(r.h,r.s,r.v);a=true;n="hsv"}else if(r.hasOwnProperty("h")&&r.hasOwnProperty("s")&&r.hasOwnProperty("l")){r.s=R(r.s);r.l=R(r.l);e=g(r.h,r.s,r.l);a=true;n="hsl"}if(r.hasOwnProperty("a")){t=r.a}}t=y(t);return{ok:a,format:r.format||n,r:i(255,f(e.r,0)),g:i(255,f(e.g,0)),b:i(255,f(e.b,0)),a:t}}function u(r,e,t){return{r:x(r,255)*255,g:x(e,255)*255,b:x(t,255)*255}}function l(r,e,t){r=x(r,255);e=x(e,255);t=x(t,255);var a=f(r,e,t),n=i(r,e,t);var s,o,h=(a+n)/2;if(a==n){s=o=0}else{var u=a-n;o=h>.5?u/(2-a-n):u/(a+n);switch(a){case r:s=(e-t)/u+(e<t?6:0);break;case e:s=(t-r)/u+2;break;case t:s=(r-e)/u+4;break}s/=6}return{h:s,s:o,l:h}}function g(r,e,t){var a,n,i;r=x(r,360);e=x(e,100);t=x(t,100);function f(r,e,t){if(t<0)t+=1;if(t>1)t-=1;if(t<1/6)return r+(e-r)*6*t;if(t<1/2)return e;if(t<2/3)return r+(e-r)*(2/3-t)*6;return r}if(e===0){a=n=i=t}else{var s=t<.5?t*(1+e):t+e-t*e;var o=2*t-s;a=f(o,s,r+1/3);n=f(o,s,r);i=f(o,s,r-1/3)}return{r:a*255,g:n*255,b:i*255}}function c(r,e,t){r=x(r,255);e=x(e,255);t=x(t,255);var a=f(r,e,t),n=i(r,e,t);var s,o,h=a;var u=a-n;o=a===0?0:u/a;if(a==n){s=0}else{switch(a){case r:s=(e-t)/u+(e<t?6:0);break;case e:s=(t-r)/u+2;break;case t:s=(r-e)/u+4;break}s/=6}return{h:s,s:o,v:h}}function b(r,e,t){r=x(r,360)*6;e=x(e,100);t=x(t,100);var n=a.floor(r),i=r-n,f=t*(1-e),s=t*(1-i*e),o=t*(1-(1-i)*e),h=n%6,u=[t,s,f,f,o,t][h],l=[o,t,t,s,f,f][h],g=[f,f,o,t,t,s][h];return{r:u*255,g:l*255,b:g*255}}function d(r,e,t,a){var i=[S(n(r).toString(16)),S(n(e).toString(16)),S(n(t).toString(16))];if(a&&i[0].charAt(0)==i[0].charAt(1)&&i[1].charAt(0)==i[1].charAt(1)&&i[2].charAt(0)==i[2].charAt(1)){return i[0].charAt(0)+i[1].charAt(0)+i[2].charAt(0)}return i.join("")}function v(r,e,t,a){var i=[S(F(a)),S(n(r).toString(16)),S(n(e).toString(16)),S(n(t).toString(16))];return i.join("")}o.equals=function(r,e){if(!r||!e){return false}return o(r).toRgbString()==o(e).toRgbString()};o.random=function(){return o.fromRatio({r:s(),g:s(),b:s()})};o.desaturate=function(r,e){e=e===0?0:e||10;var t=o(r).toHsl();t.s-=e/100;t.s=k(t.s);return o(t)};o.saturate=function(r,e){e=e===0?0:e||10;var t=o(r).toHsl();t.s+=e/100;t.s=k(t.s);return o(t)};o.greyscale=function(r){return o.desaturate(r,100)};o.lighten=function(r,e){e=e===0?0:e||10;var t=o(r).toHsl();t.l+=e/100;t.l=k(t.l);return o(t)};o.brighten=function(r,e){e=e===0?0:e||10;var t=o(r).toRgb();t.r=f(0,i(255,t.r-n(255*-(e/100))));t.g=f(0,i(255,t.g-n(255*-(e/100))));t.b=f(0,i(255,t.b-n(255*-(e/100))));return o(t)};o.darken=function(r,e){e=e===0?0:e||10;var t=o(r).toHsl();t.l-=e/100;t.l=k(t.l);return o(t)};o.complement=function(r){var e=o(r).toHsl();e.h=(e.h+180)%360;return o(e)};o.spin=function(r,e){var t=o(r).toHsl();var a=(n(t.h)+e)%360;t.h=a<0?360+a:a;return o(t)};o.mix=function(r,e,t){t=t===0?0:t||50;var a=o(r).toRgb();var n=o(e).toRgb();var i=t/100;var f=i*2-1;var s=n.a-a.a;var h;if(f*s==-1){h=f}else{h=(f+s)/(1+f*s)}h=(h+1)/2;var u=1-h;var l={r:n.r*h+a.r*u,g:n.g*h+a.g*u,b:n.b*h+a.b*u,a:n.a*i+a.a*(1-i)};return o(l)};o.triad=function(r){var e=o(r).toHsl();var t=e.h;return[o(r),o({h:(t+120)%360,s:e.s,l:e.l}),o({h:(t+240)%360,s:e.s,l:e.l})]};o.tetrad=function(r){var e=o(r).toHsl();var t=e.h;return[o(r),o({h:(t+90)%360,s:e.s,l:e.l}),o({h:(t+180)%360,s:e.s,l:e.l}),o({h:(t+270)%360,s:e.s,l:e.l})]};o.splitcomplement=function(r){var e=o(r).toHsl();var t=e.h;return[o(r),o({h:(t+72)%360,s:e.s,l:e.l}),o({h:(t+216)%360,s:e.s,l:e.l})]};o.analogous=function(r,e,t){e=e||6;t=t||30;var a=o(r).toHsl();var n=360/t;var i=[o(r)];for(a.h=(a.h-(n*e>>1)+720)%360;--e;){a.h=(a.h+n)%360;i.push(o(a))}return i};o.monochromatic=function(r,e){e=e||6;var t=o(r).toHsv();var a=t.h,n=t.s,i=t.v;var f=[];var s=1/e;while(e--){f.push(o({h:a,s:n,v:i}));i=(i+s)%1}return f};o.readability=function(r,e){var t=o(r);var a=o(e);var n=t.toRgb();var i=a.toRgb();var f=t.getBrightness();var s=a.getBrightness();var h=Math.max(n.r,i.r)-Math.min(n.r,i.r)+Math.max(n.g,i.g)-Math.min(n.g,i.g)+Math.max(n.b,i.b)-Math.min(n.b,i.b);return{brightness:Math.abs(f-s),color:h}};o.readable=function(r,e){var t=o.readability(r,e);return t.brightness>125&&t.color>500};o.mostReadable=function(r,e){var t=null;var a=0;var n=false;for(var i=0;i<e.length;i++){var f=o.readability(r,e[i]);var s=f.brightness>125&&f.color>500;var h=3*(f.brightness/125)+f.color/500;if(s&&!n||s&&n&&h>a||!s&&!n&&h>a){n=s;a=h;t=o(e[i])}}return t};var m=o.names={aliceblue:"f0f8ff",antiquewhite:"faebd7",aqua:"0ff",aquamarine:"7fffd4",azure:"f0ffff",beige:"f5f5dc",bisque:"ffe4c4",black:"000",blanchedalmond:"ffebcd",blue:"00f",blueviolet:"8a2be2",brown:"a52a2a",burlywood:"deb887",burntsienna:"ea7e5d",cadetblue:"5f9ea0",chartreuse:"7fff00",chocolate:"d2691e",coral:"ff7f50",cornflowerblue:"6495ed",cornsilk:"fff8dc",crimson:"dc143c",cyan:"0ff",darkblue:"00008b",darkcyan:"008b8b",darkgoldenrod:"b8860b",darkgray:"a9a9a9",darkgreen:"006400",darkgrey:"a9a9a9",darkkhaki:"bdb76b",darkmagenta:"8b008b",darkolivegreen:"556b2f",darkorange:"ff8c00",darkorchid:"9932cc",darkred:"8b0000",darksalmon:"e9967a",darkseagreen:"8fbc8f",darkslateblue:"483d8b",darkslategray:"2f4f4f",darkslategrey:"2f4f4f",darkturquoise:"00ced1",darkviolet:"9400d3",deeppink:"ff1493",deepskyblue:"00bfff",dimgray:"696969",dimgrey:"696969",dodgerblue:"1e90ff",firebrick:"b22222",floralwhite:"fffaf0",forestgreen:"228b22",fuchsia:"f0f",gainsboro:"dcdcdc",ghostwhite:"f8f8ff",gold:"ffd700",goldenrod:"daa520",gray:"808080",green:"008000",greenyellow:"adff2f",grey:"808080",honeydew:"f0fff0",hotpink:"ff69b4",indianred:"cd5c5c",indigo:"4b0082",ivory:"fffff0",khaki:"f0e68c",lavender:"e6e6fa",lavenderblush:"fff0f5",lawngreen:"7cfc00",lemonchiffon:"fffacd",lightblue:"add8e6",lightcoral:"f08080",lightcyan:"e0ffff",lightgoldenrodyellow:"fafad2",lightgray:"d3d3d3",lightgreen:"90ee90",lightgrey:"d3d3d3",lightpink:"ffb6c1",lightsalmon:"ffa07a",lightseagreen:"20b2aa",lightskyblue:"87cefa",lightslategray:"789",lightslategrey:"789",lightsteelblue:"b0c4de",lightyellow:"ffffe0",lime:"0f0",limegreen:"32cd32",linen:"faf0e6",magenta:"f0f",maroon:"800000",mediumaquamarine:"66cdaa",mediumblue:"0000cd",mediumorchid:"ba55d3",mediumpurple:"9370db",mediumseagreen:"3cb371",mediumslateblue:"7b68ee",mediumspringgreen:"00fa9a",mediumturquoise:"48d1cc",mediumvioletred:"c71585",midnightblue:"191970",mintcream:"f5fffa",mistyrose:"ffe4e1",moccasin:"ffe4b5",navajowhite:"ffdead",navy:"000080",oldlace:"fdf5e6",olive:"808000",olivedrab:"6b8e23",orange:"ffa500",orangered:"ff4500",orchid:"da70d6",palegoldenrod:"eee8aa",palegreen:"98fb98",paleturquoise:"afeeee",palevioletred:"db7093",papayawhip:"ffefd5",peachpuff:"ffdab9",peru:"cd853f",pink:"ffc0cb",plum:"dda0dd",powderblue:"b0e0e6",purple:"800080",red:"f00",rosybrown:"bc8f8f",royalblue:"4169e1",saddlebrown:"8b4513",salmon:"fa8072",sandybrown:"f4a460",seagreen:"2e8b57",seashell:"fff5ee",sienna:"a0522d",silver:"c0c0c0",skyblue:"87ceeb",slateblue:"6a5acd",slategray:"708090",slategrey:"708090",snow:"fffafa",springgreen:"00ff7f",steelblue:"4682b4",tan:"d2b48c",teal:"008080",thistle:"d8bfd8",tomato:"ff6347",turquoise:"40e0d0",violet:"ee82ee",wheat:"f5deb3",white:"fff",whitesmoke:"f5f5f5",yellow:"ff0",yellowgreen:"9acd32"};var _=o.hexNames=p(m);function p(r){var e={};for(var t in r){if(r.hasOwnProperty(t)){e[r[t]]=t}}return e}function y(r){r=parseFloat(r);if(isNaN(r)||r<0||r>1){r=1}return r}function x(r,e){if(H(r)){r="100%"}var t=A(r);r=i(e,f(0,parseFloat(r)));if(t){r=parseInt(r*e,10)/100}if(a.abs(r-e)<1e-6){return 1}return r%e/parseFloat(e)}function k(r){return i(1,f(0,r))}function w(r){return parseInt(r,16)}function H(r){return typeof r=="string"&&r.indexOf(".")!=-1&&parseFloat(r)===1}function A(r){return typeof r==="string"&&r.indexOf("%")!=-1}function S(r){return r.length==1?"0"+r:""+r}function R(r){if(r<=1){r=r*100+"%"}return r}function F(r){return Math.round(parseFloat(r)*255).toString(16)}function P(r){return w(r)/255}var O=function(){var r="[-\\+]?\\d+%?";var e="[-\\+]?\\d*\\.\\d+%?";var t="(?:"+e+")|(?:"+r+")";var a="[\\s|\\(]+("+t+")[,|\\s]+("+t+")[,|\\s]+("+t+")\\s*\\)?";var n="[\\s|\\(]+("+t+")[,|\\s]+("+t+")[,|\\s]+("+t+")[,|\\s]+("+t+")\\s*\\)?";return{rgb:new RegExp("rgb"+a),rgba:new RegExp("rgba"+n),hsl:new RegExp("hsl"+a),hsla:new RegExp("hsla"+n),hsv:new RegExp("hsv"+a),hex3:/^([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,hex6:/^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,hex8:/^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/}}();function q(t){t=t.replace(r,"").replace(e,"").toLowerCase();var a=false;if(m[t]){t=m[t];a=true}else if(t=="transparent"){return{r:0,g:0,b:0,a:0,format:"name"}}var n;if(n=O.rgb.exec(t)){return{r:n[1],g:n[2],b:n[3]}}if(n=O.rgba.exec(t)){return{r:n[1],g:n[2],b:n[3],a:n[4]}}if(n=O.hsl.exec(t)){return{h:n[1],s:n[2],l:n[3]}}if(n=O.hsla.exec(t)){return{h:n[1],s:n[2],l:n[3],a:n[4]}}if(n=O.hsv.exec(t)){return{h:n[1],s:n[2],v:n[3]}}if(n=O.hex8.exec(t)){return{a:P(n[1]),r:w(n[2]),g:w(n[3]),b:w(n[4]),format:a?"name":"hex8"}}if(n=O.hex6.exec(t)){return{r:w(n[1]),g:w(n[2]),b:w(n[3]),format:a?"name":"hex"}}if(n=O.hex3.exec(t)){return{r:w(n[1]+""+n[1]),g:w(n[2]+""+n[2]),b:w(n[3]+""+n[3]),format:a?"name":"hex"}}return false}if(typeof module!=="undefined"&&module.exports){module.exports=o}else if(typeof define==="function"&&define.amd){define(function(){return o})}else{window.tinycolor=o}})();
//# sourceMappingURL=tinycolor.min.map

(function($) {
  'use strict';

  $.fn.ColorPickerSliders = function(options) {
    return this.each(function() {
      var _inMoveHandler = false,
        _lastMoveHandlerRun = 0,
        _moveThrottleTimer = null,
        _throttleDelay = 70,
        alreadyinitialized = false,
        color = {
          tiny: null,
          hsla: null,
          rgba: null,
          hsv: null,
          cielch: null
        },
        connectedinput = false,
        dragTarget = false,
        groupingname = '',
        lastUpdateTime = 0,
        MAXLIGHT = 101,
        MAXVALIDCHROMA = 144,
        rendermode = false,
        triggerelement = $(this),
        triggerelementisinput = triggerelement.is('input'),
        visible = false,
        container, elements, popover_container, settings, swatches, updateAllElementsTimeout;

      function _bindControllerEvents() {
        $(document).on('colorpickersliders.changeswatches', function() {
          _renderSwatches();
        });
        $(document).on('touchend mouseup', function(e) {
          if (e.which > 1) {
            return;
          }

          if (dragTarget) {
            dragTarget = false;
            e.preventDefault();
          }
        });
        $(document).on('touchmove mousemove', function(e) {
          if (!dragTarget) {
            return;
          }

          if (new Date().getTime() - _lastMoveHandlerRun > _throttleDelay && !_inMoveHandler) {
            moveHandler(dragTarget, e);
          } else {
            setMoveHandlerTimer(dragTarget, e);
          }
        });
        /*
        container.on('contextmenu', function(ev) {
          ev.preventDefault();
          return false;
        });
        */
        elements.hsvpanel.sv.on('touchstart mousedown', function(e) {
          var percent;

          e.preventDefault();

          if (e.which > 1) {
            return;
          }

          dragTarget = 'hsvsv';
          percent = _updateHsvpanelMarkerPosition('sv', e);
          _updateColorsProperty('hsv', 's', percent.horizontal / 100);
          _updateColorsProperty('hsv', 'v', (100 - percent.vertical) / 100);
          _updateAllElements();
        });
        elements.hsvpanel.h.on('touchstart mousedown', function(e) {
          e.preventDefault();

          if (e.which > 1) {
            return;
          }

          dragTarget = 'hsvh';
          _updateColorsProperty('hsv', 'h', 3.6 * _updateHsvpanelMarkerPosition('h', e).vertical);
          _updateAllElements();
        });
        /*
        elements.hsvpanel.a.on('touchstart mousedown', function(e) {
          var percent;

          ev.preventDefault();

          if (ev.which > 1) {
            return;
          }

          dragTarget = 'hsva';
          percent = _updateHsvpanelMarkerPosition('a', ev);
          _updateColorsProperty('hsv', 'a', (100 - percent.vertical) / 100);
          _updateAllElements();
        });
        */
        elements.swatches.on('touchstart mousedown click', 'li span', function(e) {
          updateColor($(this).css('background-color'));
          e.preventDefault();
        });
        elements.pills.hsvpanel.on('click', function(e) {
          e.preventDefault();
          activateGroupHsvpanel();
        });
        elements.pills.swatches.on('click', function(e) {
          e.preventDefault();
          activateGroupSwatches();
        });

        if (!settings.flat) {
          popover_container.on('touchstart mousedown', '.popover', function(e) {
            e.preventDefault();
            e.stopPropagation();
            return false;
          });
        }
      }
      function _bindEvents() {
        triggerelement.on('colorpickersliders.updateColor', function(e, newcolor) {
          updateColor(newcolor);
        });
        triggerelement.on('colorpickersliders.show', function() {
          show();
        });
        triggerelement.on('colorpickersliders.hide', function() {
          hide();
        });

        if (!settings.flat && settings.trigger === 'focus') {
          if (typeof triggerelement.attr('tabindex') === 'undefined') {
            triggerelement.attr('tabindex', -1);
          }

          if (settings.preventtouchkeyboardonshow) {
            $(triggerelement)
              .prop('readonly', true).addClass('cp-preventtouchkeyboardonshow')
              .on('click', function(ev) {
                if (visible) {
                  $(triggerelement).prop('readonly', false);
                  ev.stopPropagation();
                }
              });
          }

          if (!triggerelementisinput) {
            $(triggerelement).on('click', function(ev) {
              show();

              ev.stopPropagation();
            });
          }

          $(triggerelement).on('focus', function(ev) {
            show();
            ev.stopPropagation();
          });
          $(triggerelement).on('blur', function(ev) {
            hide();

            if (settings.preventtouchkeyboardonshow) {
              $(triggerelement).prop('readonly', true);
            }

            ev.stopPropagation();
          });
        }

        if (connectedinput) {
          connectedinput.on('keyup change', function() {
            var $input = $(this);

            updateColor($input.val(), true);
          });
        }
      }
      function _buildComponent() {
        _initElements();
        _renderSwatches();
        _updateAllElements();
        _bindControllerEvents();
      }
      function _findActualColorsSwatch() {
        var found = false;

        $('span', elements.swatches).filter(function() {
          var swatchcolor = $(this).css('background-color');

          swatchcolor = tinycolor(swatchcolor);
          swatchcolor.alpha = Math.round(swatchcolor.alpha * 100) / 100;

          if (swatchcolor.toRgbString() === color.tiny.toRgbString()) {
            found = true;

            var currentswatch = $(this).parent();

            if (!currentswatch.is(elements.actualswatch)) {
              if (elements.actualswatch) {
                elements.actualswatch.removeClass('actual');
              }
              elements.actualswatch = currentswatch;
              currentswatch.addClass('actual');
            }
          }
        });

        if (!found) {
          if (elements.actualswatch) {
            elements.actualswatch.removeClass('actual');
            elements.actualswatch = false;
          }
        }

        if (elements.actualswatch) {
          elements.swatches_add.prop('disabled', true);
          elements.swatches_remove.prop('disabled', false);
        }
        else {
          elements.swatches_add.prop('disabled', false);
          elements.swatches_remove.prop('disabled', true);
        }
      }
      function _getControllerHtml() {
        var sliders = [],
            color_picker_html = '';

        if (settings.sliders) {

          if (settings.order.opacity !== false) {
            sliders[settings.order.opacity] = '<div class="cp-slider cp-opacity cp-transparency"><span>' + settings.labels.opacity + '</span><div class="cp-marker"></div></div>';
          }

          if (settings.order.hsl !== false) {
            sliders[settings.order.hsl] = '<div class="cp-slider cp-hslhue cp-transparency"><span>' + settings.labels.hslhue + '</span><div class="cp-marker"></div></div><div class="cp-slider cp-hslsaturation cp-transparency"><span>' + settings.labels.hslsaturation + '</span><div class="cp-marker"></div></div><div class="cp-slider cp-hsllightness cp-transparency"><span>' + settings.labels.hsllightness + '</span><div class="cp-marker"></div></div>';
          }

          if (settings.order.rgb !== false) {
            sliders[settings.order.rgb] = '<div class="cp-slider cp-rgbred cp-transparency"><span>' + settings.labels.rgbred + '</span><div class="cp-marker"></div></div><div class="cp-slider cp-rgbgreen cp-transparency"><span>' + settings.labels.rgbgreen + '</span><div class="cp-marker"></div></div><div class="cp-slider cp-rgbblue cp-transparency"><span>' + settings.labels.rgbblue + '</span><div class="cp-marker"></div></div>';
          }

          if (settings.order.cie !== false) {
            sliders[settings.order.cie] = '<div class="cp-slider cp-cielightness cp-transparency"><span>' + settings.labels.cielightness + '</span><div class="cp-marker"></div></div><div class="cp-slider cp-ciechroma cp-transparency"><span>' + settings.labels.ciechroma + '</span><div class="cp-marker"></div></div><div class="cp-slider cp-ciehue cp-transparency"><span>' + settings.labels.ciehue + '</span><div class="cp-marker"></div></div>';
          }

          if (settings.order.preview !== false) {
            sliders[settings.order.preview] = '<div class="cp-preview cp-transparency"><input type="text" readonly="readonly"></div>';
          }

        }

        if (settings.grouping) {
          if (!!settings.hsvpanel + !!(settings.sliders && sliders.length > 0) + !!settings.swatches > 1) {
            color_picker_html += '<ul class="cp-pills">';
          }
          else {
            color_picker_html += '<ul class="cp-pills hidden">';
          }

          if (settings.hsvpanel) {
            color_picker_html += '<li><a href="#" class="cp-pill-hsvpanel">Custom</a></li>';
          }
          if (settings.sliders && sliders.length > 0) {
            color_picker_html += '<li><a href="#" class="cp-pill-sliders">Sliders</a></li>';
          }
          if (settings.swatches) {
            color_picker_html += '<li><a href="#" class="cp-pill-swatches">Palettes</a></li>';
          }

          color_picker_html += '</ul>';
        }

        if (settings.hsvpanel) {
          color_picker_html += '<div class="cp-hsvpanel">' +
              '<div class="cp-hsvpanel-sv"><span></span><div class="cp-marker-point"></div></div>' +
              '<div class="cp-hsvpanel-h"><span></span><div class="cp-hsvmarker-vertical"></div></div>' +
              //'<div class="cp-hsvpanel-a cp-transparency"><span></span><div class="cp-hsvmarker-vertical"></div></div>' +
              '</div>';
        }

        if (settings.sliders) {
          color_picker_html += '<div class="cp-sliders">';

          for (var i = 0; i < sliders.length; i++) {
            if (typeof sliders[i] === 'undefined') {
              continue;
            }

            color_picker_html += sliders[i];
          }

          color_picker_html += '</div>';

        }

        if (settings.swatches) {
          color_picker_html += '<div class="cp-swatches clearfix"><ul></ul></div>';
        }

        return color_picker_html;
      }
      function _initColor() {
        if (triggerelementisinput) {
          color.tiny = tinycolor(triggerelement.val());

          if (!color.tiny.isValid()) {
            color.tiny = tinycolor(settings.color);
          }
        }
        else {
          color.tiny = tinycolor(settings.color);
        }

        color.hsla = color.tiny.toHsl();
        color.rgba = color.tiny.toRgb();
        color.hsv = color.tiny.toHsv();
        color.cielch = $.fn.ColorPickerSliders.rgb2lch(color.rgba);
      }
      function _initConnectedElements() {
        if (settings.connectedinput instanceof jQuery) {
          settings.connectedinput.add(triggerelement);
        }
        else if (settings.connectedinput === false) {
          settings.connectedinput = triggerelement;
        }
        else {
          settings.connectedinput = $(settings.connectedinput).add(triggerelement);
        }
      }
      function _initConnectedinput() {
        if (settings.connectedinput) {
          if (settings.connectedinput instanceof jQuery) {
            connectedinput = settings.connectedinput;
          }
          else {
            connectedinput = $(settings.connectedinput);
          }
        }
      }
      function _initElements() {
        elements = {
          actualswatch: false,
          swatchescontainer: $('.cp-swatches', container),
          swatches: $('.cp-swatches ul', container),
          swatches_add: $('.cp-swatches button.add', container),
          swatches_remove: $('.cp-swatches button.remove', container),
          swatches_reset: $('.cp-swatches button.reset', container),
          all_sliders: $('.cp-sliders, .cp-preview input', container),
          hsvpanel: {
            sv: $('.cp-hsvpanel-sv', container),
            sv_marker: $('.cp-hsvpanel-sv .cp-marker-point', container),
            h: $('.cp-hsvpanel-h', container),
            h_marker: $('.cp-hsvpanel-h .cp-hsvmarker-vertical', container),
            a: $('.cp-hsvpanel-a span', container),
            a_marker: $('.cp-hsvpanel-a .cp-hsvmarker-vertical', container)
          },
          sliders: {
            hue: $('.cp-hslhue span', container),
            hue_marker: $('.cp-hslhue .cp-marker', container),
            saturation: $('.cp-hslsaturation span', container),
            saturation_marker: $('.cp-hslsaturation .cp-marker', container),
            lightness: $('.cp-hsllightness span', container),
            lightness_marker: $('.cp-hsllightness .cp-marker', container),
            opacity: $('.cp-opacity span', container),
            opacity_marker: $('.cp-opacity .cp-marker', container),
            red: $('.cp-rgbred span', container),
            red_marker: $('.cp-rgbred .cp-marker', container),
            green: $('.cp-rgbgreen span', container),
            green_marker: $('.cp-rgbgreen .cp-marker', container),
            blue: $('.cp-rgbblue span', container),
            blue_marker: $('.cp-rgbblue .cp-marker', container),
            cielightness: $('.cp-cielightness span', container),
            cielightness_marker: $('.cp-cielightness .cp-marker', container),
            ciechroma: $('.cp-ciechroma span', container),
            ciechroma_marker: $('.cp-ciechroma .cp-marker', container),
            ciehue: $('.cp-ciehue span', container),
            ciehue_marker: $('.cp-ciehue .cp-marker', container),
            preview: $('.cp-preview input', container)
          },
          all_pills: $('.cp-pills', container),
          pills: {
            hsvpanel: $('.cp-pill-hsvpanel', container),
            sliders: $('.cp-pill-sliders', container),
            swatches: $('.cp-pill-swatches', container)
          }
        };

        elements.swatches_add.hide();
        elements.swatches_remove.hide();
        elements.swatches_reset.hide();
      }
      function _initSettings() {
        if (typeof options === 'undefined') {
          options = {};
        }

        settings = $.extend({
          color: 'hsl(342, 52%, 70%)',
          size: 'default', // sm | default | lg
          placement: 'auto',
          trigger: 'focus', // focus | manual
          preventtouchkeyboardonshow: true, // makes the input readonly and needs a second click to be editable
          title: '',
          hsvpanel: false,
          sliders: true,
          grouping: true,
          swatches: ['FFFFFF', 'C0C0C0', '808080', '000000', 'FF0000', '800000', 'FFFF00', '808000', '00FF00', '008000', '00FFFF', '008080', '0000FF', '000080', 'FF00FF', '800080'],
          connectedinput: false, // can be a jquery object or a selector
          updateinterval: 30, // update interval of the sliders while in drag (ms)
          previewontriggerelement: true,
          previewcontrasttreshold: 15,
          previewformat: 'rgb', // rgb | hsl | hex
          erroneousciecolormarkers: true,
          invalidcolorsopacity: 1, // everything below 1 causes slightly slower responses
          finercierangeedges: true, // can be disabled for faster responses
          titleswatchesadd: 'Add color to swatches',
          titleswatchesremove: 'Remove color from swatches',
          titleswatchesreset: 'Reset to default swatches',
          order: {},
          labels: {},
          onchange: function() {
          }
        }, options);

        if (options.hasOwnProperty('order')) {
          settings.order = $.extend({
            opacity: false,
            hsl: false,
            rgb: false,
            cie: false,
            preview: false
          }, options.order);
        } else {
          settings.order = {
            opacity: 0,
            hsl: 1,
            rgb: 2,
            cie: 3, // cie sliders can increase response time of all sliders!
            preview: 4
          };
        }

        if (!options.hasOwnProperty('labels')) {
          options.labels = {};
        }

        settings.labels = $.extend({
          hslhue: 'HSL-Hue',
          hslsaturation: 'HSL-Saturation',
          hsllightness: 'HSL-Lightness',
          rgbred: 'RGB-Red',
          rgbgreen: 'RGB-Green',
          rgbblue: 'RGB-Blue',
          cielightness: 'CIE-Lightness',
          ciechroma: 'CIE-Chroma',
          ciehue: 'CIE-hue',
          opacity: 'Opacity',
          preview: 'Preview'
        }, options.labels);
      }
      function _parseCustomSwatches() {
        swatches = [];

        for (var i = 0; i < settings.swatches.length; i++) {
          var color = tinycolor(settings.swatches[i]);

          if (color.isValid()) {
            swatches.push(color.toRgbString());
          }
        }
      }
      function _renderHsvh() {
        elements.hsvpanel.h_marker.css('top', color.hsv.h / 360 * 100 + '%');
      }
      function _renderHsva() {
        setGradient(elements.hsvpanel.a, $.fn.ColorPickerSliders.getScaledGradientStops(color.hsla, 'a', 1, 0, 2), true);

        elements.hsvpanel.a_marker.css('top', 100 - color.hsv.a * 100 + '%');
      }
      function _renderHsvsv() {
        elements.hsvpanel.sv.css('background', tinycolor('hsv(' + color.hsv.h + ',100%,100%)').toRgbString());
        elements.hsvpanel.sv_marker.css('left', color.hsv.s * 100 + '%').css('top', 100 - color.hsv.v * 100 + '%');
      }
      function _renderSwatches() {
        if (!settings.swatches) {
          return;
        }

        _parseCustomSwatches();

        if (swatches instanceof Array) {
          elements.swatches.html('');

          for (var i = 0; i < swatches.length; i++) {
            var color = tinycolor(swatches[i]);

            if (color.isValid()) {
              var span = $('<span></span>').css('background-color', color.toRgbString());
              var button = $('<div class="btn btn-default cp-swatch"></div>');

              button.append(span);

              elements.swatches.append($('<li></li>').append(button));
            }
          }
        }

        _findActualColorsSwatch();
      }
      function _updateAllElements(disableinputupdate) {
        clearTimeout(updateAllElementsTimeout);

        Date.now = Date.now || function() {
          return +new Date();
        };

        if (Date.now() - lastUpdateTime < settings.updateinterval) {
          _updateAllElementsTimer(disableinputupdate);
          return;
        }

        if (typeof disableinputupdate === 'undefined') {
          disableinputupdate = false;
        }

        lastUpdateTime = Date.now();

        if (settings.hsvpanel !== false && (!settings.grouping || getLastlyUsedGroup() === 'hsvpanel')) {
          _renderHsvsv();
          _renderHsvh();
          //_renderHsva();
        }

        if (!disableinputupdate) {
          _updateConnectedInput();
        }

        if ((100 - color.cielch.l) * color.cielch.a < settings.previewcontrasttreshold) {
          elements.all_sliders.css('color', '#000');
          if (triggerelementisinput && settings.previewontriggerelement) {
            triggerelement.css('background', color.tiny.toRgbString()).css('color', '#000');
          }
        } else {
          elements.all_sliders.css('color', '#fff');
          if (triggerelementisinput && settings.previewontriggerelement) {
            triggerelement.css('background', color.tiny.toRgbString()).css('color', '#fff');
          }
        }

        if (settings.swatches && (!settings.grouping || getLastlyUsedGroup() === 'swatches')) {
          _findActualColorsSwatch();
        }

        settings.onchange(container, color);

        triggerelement.data('color', color);
      }
      function _updateAllElementsTimer(disableinputupdate) {
        updateAllElementsTimeout = setTimeout(function() {
          _updateAllElements(disableinputupdate);
        }, settings.updateinterval);
      }
      function _updateColorsProperty(format, property, value) {
        switch (format) {
        case 'hsv':
          color.hsv[property] = value;
          color.tiny = tinycolor({h: color.hsv.h, s: color.hsv.s, v: color.hsv.v, a: color.hsv.a});
          color.rgba = color.tiny.toRgb();
          color.hsla = color.tiny.toHsl();
          color.cielch = $.fn.ColorPickerSliders.rgb2lch(color.rgba);

          break;

        case 'hsla':
          color.hsla[property] = value;
          color.tiny = tinycolor({h: color.hsla.h, s: color.hsla.s, l: color.hsla.l, a: color.hsla.a});
          color.rgba = color.tiny.toRgb();
          color.hsv = color.tiny.toHsv();
          color.cielch = $.fn.ColorPickerSliders.rgb2lch(color.rgba);

          container.removeClass('cp-unconvertible-cie-color');

          break;

        case 'rgba':
          color.rgba[property] = value;
          color.tiny = tinycolor({r: color.rgba.r, g: color.rgba.g, b: color.rgba.b, a: color.hsla.a});
          color.hsla = color.tiny.toHsl();
          color.hsv = color.tiny.toHsv();
          color.cielch = $.fn.ColorPickerSliders.rgb2lch(color.rgba);

          container.removeClass('cp-unconvertible-cie-color');

          break;

        case 'cielch':
          color.cielch[property] = value;
          color.rgba = $.fn.ColorPickerSliders.lch2rgb(color.cielch);
          color.tiny = tinycolor(color.rgba);
          color.hsla = color.tiny.toHsl();
          color.hsv = color.tiny.toHsv();

          if (settings.erroneousciecolormarkers) {
            if (color.rgba.isok) {
              container.removeClass('cp-unconvertible-cie-color');
            }
            else {
              container.addClass('cp-unconvertible-cie-color');
            }
          }

          break;
        }
      }
      function _updateConnectedInput() {
        if (connectedinput) {
          connectedinput.each(function(index, element) {
            var $element = $(element),
                format = $element.data('color-format') || settings.previewformat;

            switch (format) {
              case 'hex':
                if (color.hsla.a < 1) {
                  $element.val(color.tiny.toRgbString());
                }
                else {
                  $element.val(color.tiny.toHexString());
                }
                break;
              case 'hsl':
                $element.val(color.tiny.toHslString());
                break;
              case 'rgb':
                /* falls through */
              default:
                $element.val(color.tiny.toRgbString());
                break;
            }

            settings.onchange(container, $element.val());
          });
        }
      }
      function _updateHsvpanelMarkerPosition(marker, ev) {
        var percents = $.fn.ColorPickerSliders.calculateEventPositionPercentage(ev, elements.hsvpanel.sv, true);

        elements.hsvpanel[marker + '_marker'].data('position', percents);

        return percents;
      }
      function _updateMarkerPosition(slidername, ev) {
        var percent = $.fn.ColorPickerSliders.calculateEventPositionPercentage(ev, elements.sliders[slidername]);

        elements.sliders[slidername + '_marker'].data('position', percent);

        return percent;
      }
      function _updateTriggerelementColor() {
        if (triggerelementisinput && settings.previewontriggerelement) {
          if ((100 - color.cielch.l) * color.cielch.a < settings.previewcontrasttreshold) {
            triggerelement.css('background', color.tiny.toRgbString()).css('color', '#000');
          }
          else {
            triggerelement.css('background', color.tiny.toRgbString()).css('color', '#fff');
          }
        }
      }
      function getConfig(name) {
        try {
          var r = JSON.parse(localStorage.getItem('cp-userdata-' + name));

          return r;
        }
        catch (err) {
          return null;
        }
      }
      function getLastlyUsedGroup() {
        return getConfig('config_activepill' + getUsedGroupName());
      }
      function getUsedGroupName() {
        if (groupingname !== '') {
          return groupingname;
        }

        if (elements.pills.hsvpanel.length === 0) {
          groupingname += '_hsvpanel_';
        }
        if (elements.pills.sliders.length === 0) {
          groupingname += '_sliders_';
        }
        if (elements.pills.swatches.length === 0) {
          groupingname += '_swatches_';
        }

        return groupingname;
      }
      function hide() {
        visible = false;
        hidePopover();
      }
      function hidePopover() {
        popover_container.remove();
        popover_container = null;

        triggerelement.popover('destroy');
      }
      function init() {
        if (alreadyinitialized) {
          return;
        }

        alreadyinitialized = true;
        rendermode = $.fn.ColorPickerSliders.detectWhichGradientIsSupported();

        if (rendermode === 'filter') {
          rendermode = false;
        }

        if (!rendermode && $.fn.ColorPickerSliders.svgSupported()) {
          rendermode = 'svg';
        }

        _initSettings();

        if ((!settings.order.hasOwnProperty('preview') || settings.order.preview === false) && !rendermode) {
          settings.order.preview = 10;
        }

        _initConnectedElements();
        _initColor();
        _initConnectedinput();
        _updateTriggerelementColor();
        _updateConnectedInput();
        _bindEvents();
      }
      function setLastlyUsedGroup(value) {
        return setConfig('config_activepill' + getUsedGroupName(), value);
      }
      function activateLastlyUsedGroup() {
        switch (getLastlyUsedGroup()) {
        case 'hsvpanel':
          activateGroupHsvpanel();
          break;
        case 'sliders':
          activateGroupSliders();
          break;
        case 'swatches':
          activateGroupSwatches();
          break;
        default:
          if (elements.pills.hsvpanel.length) {
            activateGroupHsvpanel();
            break;
          }
          else if (elements.pills.sliders.length) {
            activateGroupSliders();
            break;
          }
          else if (elements.pills.swatches.length) {
            activateGroupSwatches();
            break;
          }
        }
      }
      function activateGroupHsvpanel() {
        if (elements.pills.hsvpanel.length === 0) {
          return false;
        }

        $('a', elements.all_pills).removeClass('active');
        elements.pills.hsvpanel.addClass('active');

        container.removeClass('sliders-active swatches-active').addClass('hsvpanel-active');

        setLastlyUsedGroup('hsvpanel');

        _updateAllElements(true);

        show(true);

        return true;
      }
      function activateGroupSliders() {
        if (elements.pills.sliders.length === 0) {
          return false;
        }

        $('a', elements.all_pills).removeClass('active');
        elements.pills.sliders.addClass('active');

        container.removeClass('hsvpanel-active swatches-active').addClass('sliders-active');

        setLastlyUsedGroup('sliders');

        _updateAllElements(true);

        show(true);

        return true;
      }
      function activateGroupSwatches() {
        if (elements.pills.swatches.length === 0) {
          return false;
        }

        $('a', elements.all_pills).removeClass('active');
        elements.pills.swatches.addClass('active');

        container.removeClass('hsvpanel-active sliders-active').addClass('swatches-active');

        setLastlyUsedGroup('swatches');

        _updateAllElements(true);

        show(true);

        return true;
      }
      function moveHandler(dragTarget, ev) {
        var percent;

        if (_inMoveHandler) {
          setMoveHandlerTimer(dragTarget, ev);
          return;
        }

        _inMoveHandler = true;
        _lastMoveHandlerRun = new Date().getTime();

        if (dragTarget === 'hsvsv') {
          percent = _updateHsvpanelMarkerPosition('sv', ev);
        }
        else if (dragTarget === 'hsvh') {
          percent = _updateHsvpanelMarkerPosition('h', ev);
        }
        else if (dragTarget === 'hsva') {
          percent = _updateHsvpanelMarkerPosition('a', ev);
        }
        else {
          percent = _updateMarkerPosition(dragTarget, ev);
        }

        switch (dragTarget) {
        case 'hsvsv':
          _updateColorsProperty('hsv', 's', percent.horizontal / 100);
          _updateColorsProperty('hsv', 'v', (100 - percent.vertical) / 100);
          break;
        case 'hsvh':
          _updateColorsProperty('hsv', 'h', 3.6 * percent.vertical);
          break;
        case 'hsva':
          _updateColorsProperty('hsv', 'a', (100 - percent.vertical) / 100);
          break;
        case 'hue':
          _updateColorsProperty('hsla', 'h', 3.6 * percent);
          break;
        case 'saturation':
          _updateColorsProperty('hsla', 's', percent / 100);
          break;
        case 'lightness':
          _updateColorsProperty('hsla', 'l', percent / 100);
          break;
        case 'opacity':
          _updateColorsProperty('hsla', 'a', percent / 100);
          break;
        case 'red':
          _updateColorsProperty('rgba', 'r', 2.55 * percent);
          break;
        case 'green':
          _updateColorsProperty('rgba', 'g', 2.55 * percent);
          break;
        case 'blue':
          _updateColorsProperty('rgba', 'b', 2.55 * percent);
          break;
        case 'cielightness':
          _updateColorsProperty('cielch', 'l', (MAXLIGHT / 100) * percent);
          break;
        case 'ciechroma':
          _updateColorsProperty('cielch', 'c', (MAXVALIDCHROMA / 100) * percent);
          break;
        case 'ciehue':
          _updateColorsProperty('cielch', 'h', 3.6 * percent);
          break;
        }

        _updateAllElements();

        ev.preventDefault();
        _inMoveHandler = false;
      }
      function setConfig(name, value) {
        try {
          localStorage.setItem('cp-userdata-' + name, JSON.stringify(value));
        } catch (err) {}
      }
      function setGradient(element, gradientstops, vertical) {
        if (typeof vertical === 'undefined') {
          vertical = false;
        }

        gradientstops.sort(function(a, b) {
          return a.position - b.position;
        });

        switch (rendermode) {
          case 'noprefix':
            $.fn.ColorPickerSliders.renderNoprefix(element, gradientstops, vertical);
            break;
          case 'webkit':
            $.fn.ColorPickerSliders.renderWebkit(element, gradientstops, vertical);
            break;
          case 'ms':
            $.fn.ColorPickerSliders.renderMs(element, gradientstops, vertical);
            break;
          case 'svg': // can not repeat, radial can be only a covering ellipse (maybe there is a workaround, need more investigation)
            $.fn.ColorPickerSliders.renderSVG(element, gradientstops, vertical);
            break;
          case 'oldwebkit':   // can not repeat, no percent size with radial gradient (and no ellipse)
            $.fn.ColorPickerSliders.renderOldwebkit(element, gradientstops, vertical);
            break;
        }
      }
      function setMoveHandlerTimer(dragTarget, ev) {
        clearTimeout(_moveThrottleTimer);
        _moveThrottleTimer = setTimeout(function() {
          moveHandler(dragTarget, ev);
        }, _throttleDelay);
      }
      function show(disableLastlyUsedGroupUpdate) {
        if (settings.flat) {
          return;
        }

        if (visible) {
          // repositions the popover
          triggerelement.popover('hide');
          triggerelement.popover('show');
          _bindControllerEvents();
          return;
        }

        showPopover(disableLastlyUsedGroupUpdate);

        visible = true;
      }
      function showPopover(disableLastlyUsedGroupUpdate) {
        if (popover_container instanceof jQuery) {
          return;
        }

        if (typeof disableLastlyUsedGroupUpdate === 'undefined') {
          disableLastlyUsedGroupUpdate = false;
        }

        popover_container = $('<div class="cp-popover-container"></div>').appendTo('body');

        container = $('<div class="cp-container"></div>').appendTo(popover_container);
        container.html(_getControllerHtml());

        switch (settings.size) {
        case 'sm':
          container.addClass('cp-container-sm');
          break;
        case 'lg':
          container.addClass('cp-container-lg');
          break;
        }

        _buildComponent();

        if (!disableLastlyUsedGroupUpdate) {
          activateLastlyUsedGroup();
        }

        triggerelement.popover({
          html: true,
          animation: false,
          trigger: 'manual',
          title: settings.title,
          placement: settings.placement,
          container: popover_container,
          content: function() {
            return container;
          }
        });

        triggerelement.popover('show');
      }
      function updateColor(newcolor, disableinputupdate) {
        var updatedcolor = tinycolor(newcolor);

        if (updatedcolor.isValid()) {
          color.tiny = updatedcolor;
          color.hsla = updatedcolor.toHsl();
          color.rgba = updatedcolor.toRgb();
          color.hsv = updatedcolor.toHsv();
          color.cielch = $.fn.ColorPickerSliders.rgb2lch(color.rgba);

          if (!disableinputupdate) {
            _updateConnectedInput();
          }

          _updateTriggerelementColor();

          return true;
        }
        else {
          return false;
        }
      }

      init();
    });
  };
  $.fn.ColorPickerSliders.base64encode = function(data) {
    var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
        ac = 0,
        enc = '',
        tmp_arr = [];

    if (!data) {
      return data;
    }

    do {
      o1 = data.charCodeAt(i++);
      o2 = data.charCodeAt(i++);
      o3 = data.charCodeAt(i++);

      bits = o1 << 16 | o2 << 8 | o3;

      h1 = bits >> 18 & 0x3f;
      h2 = bits >> 12 & 0x3f;
      h3 = bits >> 6 & 0x3f;
      h4 = bits & 0x3f;

      tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
    } while (i < data.length);

    enc = tmp_arr.join('');

    var r = data.length % 3;

    return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);
  };
  $.fn.ColorPickerSliders.calculateEventPositionPercentage = function(ev, containerElement, both) {
    if (typeof (both) === 'undefined') {
      both = false;
    }

    var c = $.fn.ColorPickerSliders.getEventCoordinates(ev);

    var xsize = containerElement.width(),
        offsetX = c.pageX - containerElement.offset().left;

    var horizontal = offsetX / xsize * 100;

    if (horizontal < 0) {
      horizontal = 0;
    }

    if (horizontal > 100) {
      horizontal = 100;
    }

    if (both) {
      var ysize = containerElement.height(),
          offsetY = c.pageY - containerElement.offset().top;

      var vertical = offsetY / ysize * 100;

      if (vertical < 0) {
        vertical = 0;
      }

      if (vertical > 100) {
        vertical = 100;
      }

      return {
        horizontal: horizontal,
        vertical: vertical
      };
    }

    return horizontal;
  };
  $.fn.ColorPickerSliders.csscolor = function(color, invalidcolorsopacity) {
    if (typeof invalidcolorsopacity === 'undefined') {
      invalidcolorsopacity = 1;
    }

    var $return = false,
        tmpcolor = $.extend({}, color);

    if (tmpcolor.hasOwnProperty('c')) {
      // CIE-LCh
      tmpcolor = $.fn.ColorPickerSliders.lch2rgb(tmpcolor, invalidcolorsopacity);
    }

    if (tmpcolor.hasOwnProperty('h')) {
      // HSL
      $return = 'hsla(' + tmpcolor.h + ',' + tmpcolor.s * 100 + '%,' + tmpcolor.l * 100 + '%,' + tmpcolor.a + ')';
    }

    if (tmpcolor.hasOwnProperty('r')) {
      // RGB
      if (tmpcolor.a < 1) {
        $return = 'rgba(' + Math.round(tmpcolor.r) + ',' + Math.round(tmpcolor.g) + ',' + Math.round(tmpcolor.b) + ',' + tmpcolor.a + ')';
      }
      else {
        $return = 'rgb(' + Math.round(tmpcolor.r) + ',' + Math.round(tmpcolor.g) + ',' + Math.round(tmpcolor.b) + ')';
      }
    }

    return $return;
  };
  $.fn.ColorPickerSliders.CIELab2CIELCH = function(CIELab) {
    var CIELCH = {};

    CIELCH.l = CIELab.l;
    CIELCH.c = Math.sqrt(Math.pow(CIELab.a, 2) + Math.pow(CIELab.b, 2));

    CIELCH.h = Math.atan2(CIELab.b, CIELab.a);  //Quadrant by signs

    if (CIELCH.h > 0) {
      CIELCH.h = (CIELCH.h / Math.PI) * 180;
    }
    else {
      CIELCH.h = 360 - (Math.abs(CIELCH.h) / Math.PI) * 180;
    }

    return CIELCH;
  };
  $.fn.ColorPickerSliders.CIELab2XYZ = function(CIELab) {
    var XYZ = {};

    XYZ.y = (CIELab.l + 16) / 116;
    XYZ.x = CIELab.a / 500 + XYZ.y;
    XYZ.z = XYZ.y - CIELab.b / 200;

    if (Math.pow(XYZ.y, 3) > 0.008856) {
      XYZ.y = Math.pow(XYZ.y, 3);
    }
    else {
      XYZ.y = (XYZ.y - 0.137931034) / 7.787;
    }

    if (Math.pow(XYZ.x, 3) > 0.008856) {
      XYZ.x = Math.pow(XYZ.x, 3);
    }
    else {
      XYZ.x = (XYZ.x - 0.137931034) / 7.787;
    }

    if (Math.pow(XYZ.z, 3) > 0.008856) {
      XYZ.z = Math.pow(XYZ.z, 3);
    }
    else {
      XYZ.z = (XYZ.z - 0.137931034) / 7.787;
    }

    // Observer = 2°, Illuminant = D65
    XYZ.x = 95.047 * XYZ.x;
    XYZ.y = 100.000 * XYZ.y;
    XYZ.z = 108.883 * XYZ.z;

    return XYZ;
  };
  $.fn.ColorPickerSliders.CIELCH2CIELab = function(CIELCH) {
    var CIELab = {};

    CIELab.l = CIELCH.l;
    CIELab.a = Math.cos(CIELCH.h * 0.01745329251) * CIELCH.c;
    CIELab.b = Math.sin(CIELCH.h * 0.01745329251) * CIELCH.c;

    return CIELab;
  };
  $.fn.ColorPickerSliders.detectWhichGradientIsSupported = function() {
    var testelement = document.createElement('detectGradientSupport').style;

    try {
      testelement.backgroundImage = 'linear-gradient(to top left, #9f9, white)';
      if (testelement.backgroundImage.indexOf('gradient') !== -1) {
        return 'noprefix';
      }

      testelement.backgroundImage = '-webkit-linear-gradient(left top, #9f9, white)';
      if (testelement.backgroundImage.indexOf('gradient') !== -1) {
        return 'webkit';
      }

      testelement.backgroundImage = '-ms-linear-gradient(left top, #9f9, white)';
      if (testelement.backgroundImage.indexOf('gradient') !== -1) {
        return 'ms';
      }

      testelement.backgroundImage = '-webkit-gradient(linear, left top, right bottom, from(#9f9), to(white))';
      if (testelement.backgroundImage.indexOf('gradient') !== -1) {
        return 'oldwebkit';
      }
    }
    catch (err) {
      try {
        testelement.filter = 'progid:DXImageTransform.Microsoft.gradient(startColorstr="#ffffff",endColorstr="#000000",GradientType=0)';
        if (testelement.filter.indexOf('DXImageTransform') !== -1) {
          return 'filter';
        }
      }
      catch (err) {
      }
    }

    return false;
  };
  $.fn.ColorPickerSliders.getEventCoordinates = function(ev) {
    if (typeof ev.pageX !== 'undefined') {
      return {
        pageX: ev.originalEvent.pageX,
        pageY: ev.originalEvent.pageY
      };
    }
    else if (typeof ev.originalEvent.touches !== 'undefined') {
      return {
        pageX: ev.originalEvent.touches[0].pageX,
        pageY: ev.originalEvent.touches[0].pageY
      };
    }
  };
  $.fn.ColorPickerSliders.getGradientStopsCSSString = function(gradientstops) {
    var gradientstring = '',
        oldwebkit = '',
        svgstoppoints = '';

    for (var i = 0; i < gradientstops.length; i++) {
      var el = gradientstops[i];

      gradientstring += ',' + el.color + ' ' + el.position + '%';
      oldwebkit += ',color-stop(' + el.position + '%,' + el.color + ')';

      var svgcolor = tinycolor(el.color);

      svgstoppoints += '<stop ' + 'stop-color="' + svgcolor.toHexString() + '" stop-opacity="' + svgcolor.toRgb().a + '"' + ' offset="' + el.position / 100 + '"/>';
    }

    return {
      noprefix: gradientstring,
      oldwebkit: oldwebkit,
      svg: svgstoppoints
    };
  };
  $.fn.ColorPickerSliders.getScaledGradientStops = function(color, scalableproperty, minvalue, maxvalue, steps, invalidcolorsopacity, minposition, maxposition) {
    if (typeof invalidcolorsopacity === 'undefined') {
      invalidcolorsopacity = 1;
    }

    if (typeof minposition === 'undefined') {
      minposition = 0;
    }

    if (typeof maxposition === 'undefined') {
      maxposition = 100;
    }

    var gradientStops = [],
        diff = maxvalue - minvalue,
        isok = true;

    for (var i = 0; i < steps; ++i) {
      var currentstage = i / (steps - 1),
          modifiedcolor = $.fn.ColorPickerSliders.modifyColor(color, scalableproperty, currentstage * diff + minvalue),
          csscolor;

      if (invalidcolorsopacity < 1) {
        var stagergb = $.fn.ColorPickerSliders.lch2rgb(modifiedcolor, invalidcolorsopacity);

        isok = stagergb.isok;
        csscolor = $.fn.ColorPickerSliders.csscolor(stagergb, invalidcolorsopacity);
      }
      else {
        csscolor = $.fn.ColorPickerSliders.csscolor(modifiedcolor, invalidcolorsopacity);
      }

      gradientStops[i] = {
        color: csscolor,
        position: currentstage * (maxposition - minposition) + minposition,
        isok: isok,
        rawcolor: modifiedcolor
      };
    }

    return gradientStops;
  };
  $.fn.ColorPickerSliders.isGoodRgb = function(rgb) {
    // the default acceptable values are out of 0..255 due to
    // rounding errors with yellow and blue colors (258, -1)
    var maxacceptable = 258;
    var minacceptable = -1;

    if (rgb.r > maxacceptable || rgb.g > maxacceptable || rgb.b > maxacceptable || rgb.r < minacceptable || rgb.g < minacceptable || rgb.b < minacceptable) {
      return false;
    }
    else {
      rgb.r = Math.min(255, rgb.r);
      rgb.g = Math.min(255, rgb.g);
      rgb.b = Math.min(255, rgb.b);
      rgb.r = Math.max(0, rgb.r);
      rgb.g = Math.max(0, rgb.g);
      rgb.b = Math.max(0, rgb.b);

      return true;
    }
  };
  $.fn.ColorPickerSliders.lch2rgb = function(lch, invalidcolorsopacity) {
    if (typeof invalidcolorsopacity === 'undefined') {
      invalidcolorsopacity = 1;
    }

    var rgb = $.fn.ColorPickerSliders.XYZ2rgb($.fn.ColorPickerSliders.CIELab2XYZ($.fn.ColorPickerSliders.CIELCH2CIELab(lch)));

    if ($.fn.ColorPickerSliders.isGoodRgb(rgb)) {
      if (lch.hasOwnProperty('a')) {
        rgb.a = lch.a;
      }

      rgb.isok = true;

      return rgb;
    }

    var tmp = $.extend({}, lch),
        lastbadchroma = tmp.c,
        lastgoodchroma = -1,
        loops = 0;

    do {
      ++loops;

      tmp.c = lastgoodchroma + ((lastbadchroma - lastgoodchroma) / 2);

      rgb = $.fn.ColorPickerSliders.XYZ2rgb($.fn.ColorPickerSliders.CIELab2XYZ($.fn.ColorPickerSliders.CIELCH2CIELab(tmp)));

      if ($.fn.ColorPickerSliders.isGoodRgb(rgb)) {
        lastgoodchroma = tmp.c;
      }
      else {
        lastbadchroma = tmp.c;
      }
    } while (Math.abs(lastbadchroma - lastgoodchroma) > 0.9 && loops < 100);

    if (lch.hasOwnProperty('a')) {
      rgb.a = lch.a;
    }

    rgb.r = Math.max(0, rgb.r);
    rgb.g = Math.max(0, rgb.g);
    rgb.b = Math.max(0, rgb.b);

    rgb.r = Math.min(255, rgb.r);
    rgb.g = Math.min(255, rgb.g);
    rgb.b = Math.min(255, rgb.b);

    if (invalidcolorsopacity < 1) {
      if (rgb.hasOwnProperty('a')) {
        rgb.a = rgb.a * invalidcolorsopacity;
      }
      else {
        rgb.a = invalidcolorsopacity;
      }
    }

    rgb.isok = false;

    return rgb;
  };
  $.fn.ColorPickerSliders.modifyColor = function(color, property, value) {
    var modifiedcolor = $.extend({}, color);

    if (!color.hasOwnProperty(property)) {
      throw('Missing color property: ' + property);
    }

    modifiedcolor[property] = value;

    return modifiedcolor;
  };
  $.fn.ColorPickerSliders.renderMs = function(element, gradientstops, vertical) {
    if (typeof vertical === 'undefined') {
      vertical = false;
    }

    var css,
        stoppoints = $.fn.ColorPickerSliders.getGradientStopsCSSString(gradientstops).noprefix;

    if (!vertical) {
      css = '-ms-linear-gradient(to right';
    }
    else {
      css = '-ms-linear-gradient(to bottom';
    }

    css += stoppoints + ')';

    element.css('background-image', css);
  };
  $.fn.ColorPickerSliders.renderNoprefix = function(element, gradientstops, vertical) {
    if (typeof vertical === 'undefined') {
      vertical = false;
    }

    var css,
        stoppoints = $.fn.ColorPickerSliders.getGradientStopsCSSString(gradientstops).noprefix;

    if (!vertical) {
      css = 'linear-gradient(to right';
    }
    else {
      css = 'linear-gradient(to bottom';
    }

    css += stoppoints + ')';

    element.css('background-image', css);
  };
  $.fn.ColorPickerSliders.renderOldwebkit = function(element, gradientstops, vertical) {
    if (typeof vertical === 'undefined') {
      vertical = false;
    }

    var css,
        stoppoints = $.fn.ColorPickerSliders.getGradientStopsCSSString(gradientstops).oldwebkit;

    if (!vertical) {
      css = '-webkit-gradient(linear, 0% 0%, 100% 0%';
    }
    else {
      css = '-webkit-gradient(linear, 0% 0%, 0 100%';
    }
    css += stoppoints + ')';

    element.css('background-image', css);
  };
  $.fn.ColorPickerSliders.renderSVG = function(element, gradientstops, vertical) {
    if (typeof vertical === 'undefined') {
      vertical = false;
    }

    var svg = '',
        svgstoppoints = $.fn.ColorPickerSliders.getGradientStopsCSSString(gradientstops).svg;

    if (!vertical) {
      svg = '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 1 1" preserveAspectRatio="none"><linearGradient id="vsgg" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="100%" y2="0">';
    }
    else {
      svg = '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 1 1" preserveAspectRatio="none"><linearGradient id="vsgg" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="100%">';
    }

    svg += svgstoppoints;
    svg += '</linearGradient><rect x="0" y="0" width="1" height="1" fill="url(#vsgg)" /></svg>';
    svg = 'url(data:image/svg+xml;base64,' + $.fn.ColorPickerSliders.base64encode(svg) + ')';

    element.css('background-image', svg);
  };
  $.fn.ColorPickerSliders.renderWebkit = function(element, gradientstops, vertical) {
    if (typeof vertical === 'undefined') {
      vertical = false;
    }

    var css,
        stoppoints = $.fn.ColorPickerSliders.getGradientStopsCSSString(gradientstops).noprefix;

    if (!vertical) {
      css = '-webkit-linear-gradient(left';
    }
    else {
      css = '-webkit-linear-gradient(top';
    }

    css += stoppoints + ')';

    element.css('background-image', css);
  };
  $.fn.ColorPickerSliders.rgb2lch = function(rgb) {
    var lch = $.fn.ColorPickerSliders.CIELab2CIELCH($.fn.ColorPickerSliders.XYZ2CIELab($.fn.ColorPickerSliders.rgb2XYZ(rgb)));

    if (rgb.hasOwnProperty('a')) {
      lch.a = rgb.a;
    }

    return lch;
  };
  $.fn.ColorPickerSliders.rgb2XYZ = function(rgb) {
    var XYZ = {};

    var r = (rgb.r / 255);
    var g = (rgb.g / 255);
    var b = (rgb.b / 255);

    if (r > 0.04045) {
      r = Math.pow(((r + 0.055) / 1.055), 2.4);
    }
    else {
      r = r / 12.92;
    }

    if (g > 0.04045) {
      g = Math.pow(((g + 0.055) / 1.055), 2.4);
    }
    else {
      g = g / 12.92;
    }

    if (b > 0.04045) {
      b = Math.pow(((b + 0.055) / 1.055), 2.4);
    }
    else {
      b = b / 12.92;
    }

    r = r * 100;
    g = g * 100;
    b = b * 100;

    // Observer = 2°, Illuminant = D65
    XYZ.x = r * 0.4124 + g * 0.3576 + b * 0.1805;
    XYZ.y = r * 0.2126 + g * 0.7152 + b * 0.0722;
    XYZ.z = r * 0.0193 + g * 0.1192 + b * 0.9505;

    return XYZ;
  };
  $.fn.ColorPickerSliders.svgSupported = function() {
    return !!document.createElementNS && !!document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect;
  };
  $.fn.ColorPickerSliders.XYZ2CIELab = function(XYZ) {
    var CIELab = {};

    // Observer = 2°, Illuminant = D65
    var X = XYZ.x / 95.047;
    var Y = XYZ.y / 100.000;
    var Z = XYZ.z / 108.883;

    if (X > 0.008856) {
      X = Math.pow(X, 0.333333333);
    }
    else {
      X = 7.787 * X + 0.137931034;
    }

    if (Y > 0.008856) {
      Y = Math.pow(Y, 0.333333333);
    }
    else {
      Y = 7.787 * Y + 0.137931034;
    }

    if (Z > 0.008856) {
      Z = Math.pow(Z, 0.333333333);
    }
    else {
      Z = 7.787 * Z + 0.137931034;
    }

    CIELab.l = (116 * Y) - 16;
    CIELab.a = 500 * (X - Y);
    CIELab.b = 200 * (Y - Z);

    return CIELab;
  };
  $.fn.ColorPickerSliders.XYZ2rgb = function(XYZ) {
    var rgb = {};

    // Observer = 2°, Illuminant = D65
    XYZ.x = XYZ.x / 100;        // X from 0 to 95.047
    XYZ.y = XYZ.y / 100;        // Y from 0 to 100.000
    XYZ.z = XYZ.z / 100;        // Z from 0 to 108.883

    rgb.r = XYZ.x * 3.2406 + XYZ.y * -1.5372 + XYZ.z * -0.4986;
    rgb.g = XYZ.x * -0.9689 + XYZ.y * 1.8758 + XYZ.z * 0.0415;
    rgb.b = XYZ.x * 0.0557 + XYZ.y * -0.2040 + XYZ.z * 1.0570;

    if (rgb.r > 0.0031308) {
      rgb.r = 1.055 * (Math.pow(rgb.r, 0.41666667)) - 0.055;
    }
    else {
      rgb.r = 12.92 * rgb.r;
    }

    if (rgb.g > 0.0031308) {
      rgb.g = 1.055 * (Math.pow(rgb.g, 0.41666667)) - 0.055;
    }
    else {
      rgb.g = 12.92 * rgb.g;
    }

    if (rgb.b > 0.0031308) {
      rgb.b = 1.055 * (Math.pow(rgb.b, 0.41666667)) - 0.055;
    }
    else {
      rgb.b = 12.92 * rgb.b;
    }

    rgb.r = Math.round(rgb.r * 255);
    rgb.g = Math.round(rgb.g * 255);
    rgb.b = Math.round(rgb.b * 255);

    return rgb;
  };
})(jQuery);
