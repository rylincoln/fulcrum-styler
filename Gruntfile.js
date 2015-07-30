module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({
    clean: [
      '_site/css',
      '_site/data',
      '_site/img',
      '_site/js',
      '_site/ui',
      '_site/iframe.html'
    ],
    copy: {
      site: {
        files: [{
          cwd: 'assets/libs/bootstrap-editable/img/',
          dest: '_site/img/',
          expand: true,
          src: [
            '**/*'
          ]
        },{
          cwd: 'assets/libs/bootstrap-slider/img/',
          dest: '_site/img/',
          expand: true,
          src: [
            '**/*'
          ]
        },{
          cwd: 'data/',
          dest: '_site/data/',
          expand: true,
          src: [
            '**/*'
          ]
        },{
          cwd: 'img/',
          dest: '_site/img/',
          expand: true,
          src: [
            '**/*'
          ]
        },{
          cwd: 'ui/',
          dest: '_site/ui/',
          expand: true,
          src: [
            '**/*'
          ]
        }]
      }
    },
    cssmin: {
      site: {
        files: {
          '_site/css/app.min.css': [
            'assets/libs/alertify/css/alertify-core.css',
            'assets/libs/alertify/css/alertify-bootstrap.css',
            'assets/libs/bootstrap-editable/css/bootstrap-editable.css',
            'assets/libs/bootstrap-select/css/bootstrap-select.css',
            'assets/libs/bootstrap-colorpickersliders/bootstrap.colorpickersliders.css',
            'assets/libs/bootstrap-slider/css/bootstrap-slider.css',
            'assets/libs/typeahead/typeahead.css',
            'css/app.css'
          ]
        }
      }
    },
    htmlmin: {
      site: {
        files: {
          '_site/iframe.html': 'iframe.min.html',
          '_site/index.html': 'index.min.html'
        },
        options: {
          collapseBooleanAttributes: true,
          collapseWhitespace: true,
          removeAttributeQuotes: true,
          removeComments: true,
          removeCommentsFromCDATA: true,
          removeRedundantAttributes: true
        }
      }
    },
    pkg: require('./package.json'),
    uglify: {
      site: {
        options: {
          beautify: false
        },
        files: {
          '_site/js/app.min.js': [
            'assets/libs/alertify/js/alertify.js',
            'assets/libs/bootstrap-colorpickersliders/bootstrap.colorpickersliders.js',
            'assets/libs/bootstrap-editable/js/bootstrap-editable.js',
            'assets/libs/bootstrap-editable/js/bootstrap-filestyle.js',
            'assets/libs/bootstrap-select/js/bootstrap-select.js',
            'assets/libs/bootstrap-slider/js/bootstrap-slider.js',
            'assets/libs/jquery-nestable/js/jquery-nestable.js',
            'assets/libs/moment.js',
            'assets/libs/typeahead/typeahead.js',
            'js/app.js'
          ]
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.registerTask('default', ['clean', 'htmlmin', 'copy', 'cssmin', 'uglify']);
};
