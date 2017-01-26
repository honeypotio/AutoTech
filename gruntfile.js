module.exports = function (grunt) {
  grunt.initConfig({
    babel: {
      options: {
        sourceMap: true,
        presets: ['es2015'],
      },
      dist: {
        files: [{
          expand: true,
          cwd: './src/',
          src: '**/*.js',
          dest: './babel/'
        }]
      }
    },
    browserify: {
      app: {
        files: [{
          src: ['./babel/**/index.js'],
          dest: './public/main.js'
        }],
        options: {
          ignore: './public/main.js',
          external: [
            'd3'
          ]
        }
      },
      vendor: {
        files: [{
          src: ['.'],
          dest: './public/vendor.js',
        }],
        options: {
          alias: [
            'd3'
          ],
          external: null
        }
      }
    },
    watch: {
      default: {
        files: ['./src/**/*.js'],
        tasks: ['babel', 'browserify:app']
      },
      options: {
        spawn: false
      }
    }
  });

  grunt.registerTask('build', ['babel', 'browserify'], function() {
    cleanBabelFolder();

    grunt.loadNpmTasks('grunt-babel');
    grunt.loadNpmTasks('grunt-browserify');

    grunt.task.run('babel', 'browserify:vendor', 'browserify:app');
  });

  grunt.registerTask('watch', ['babel', 'browserify', 'watch'], function() {
    grunt.loadNpmTasks('grunt-babel');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.task.run('babel', 'browserify:vendor', 'browserify:app', 'watch:default');
  });

  function cleanBabelFolder(){
    grunt.file.delete('./babel/');
  }
}
