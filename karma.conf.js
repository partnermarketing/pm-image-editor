module.exports = function(config){
  config.set({

    basePath : './',

    files : [
      'bower_components/angular/angular.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'src/js/init.js',
      'src/js/classes/draggable.js',
      'src/js/classes/resizable.js',
      'src/js/classes/image-selection.js',
      'src/js/classes/editor-panel.js',
      'src/js/pm-image-editor.js',
      'spec/**/*.js'
    ],

    preprocessors: {
      'src/js/**/*.js': 'coverage'
    },

    singleRun: true,
    autoWatch : false,

    frameworks: ['jasmine'],

    browsers : ['PhantomJS'],

    plugins : [
            'karma-phantomjs-launcher',
            'karma-jasmine',
            'karma-coverage',
            'karma-junit-reporter'
    ],

    reporters: ['dots', 'junit', 'coverage'],

    junitReporter : {
      outputFile: 'spec/unit.xml',
      suite: 'unit'
    }
  });
};
