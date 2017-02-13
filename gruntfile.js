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
    sass: {
      dist: {
        options: {
          style: 'compressed',
          sourcemap: 'none'
        },
        files: [{
          expand: true,
          cwd: 'styles',
          src: ['main.scss'],
          dest: 'public/styles',
          ext: '.css'
        }]
      }
    },
    watch: {
      default: {
        files: ['./src/**/*.js', './styles/**/*.scss'],
        tasks: ['babel', 'browserify:app', 'sass']
      },
      options: {
        spawn: false
      }
    }
  });

  grunt.registerTask('build', ['babel', 'browserify', 'sass'], function() {
    cleanBabelFolder();

    grunt.loadNpmTasks('grunt-babel');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-sass');

    grunt.task.run('babel', 'browserify:vendor', 'browserify:app', 'sass');
  });

  grunt.registerTask('watch', ['babel', 'browserify', 'sass', 'watch'], function() {
    grunt.loadNpmTasks('grunt-babel');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.task.run('babel', 'browserify:vendor', 'browserify:app', 'sass', 'watch:default');
  });

  function cleanBabelFolder(){
    grunt.file.delete('./babel/');
  }
}
