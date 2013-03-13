module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
        options: {
      	  banner: '/*!\n' +
      	          '  <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
      	          '  Copyright (c) Oliver Friedmann & Victor Lingenthal\n' +
      	          '  MIT Software License.\n' +
      	          '*/\n'
        },
      build: {
        dest: 'dist/beta.js',
        src: [
              'src/base/base.js',
              'src/base/types.js',
              'src/base/objs.js',
              'src/base/ids.js',
              'src/base/class.js',
              'src/base/classes.js',
              'src/base/lists.js',
              'src/base/iterators.js',
              'src/base/events.js'
        ]
      }
    },
    uglify: {
      options: {
    	  banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>, ' +
    	          'Copyright (c) Oliver Friedmann & Victor Lingenthal, ' +
    	          'MIT Software License. ' +
    	          '*/'
      },
	  dist: {
	    files: {
	      'dist/beta.min.js': ['dist/beta.js']
	    }
	  }
	}    
  });
  
  grunt.loadNpmTasks('grunt-contrib-concat');  
  grunt.loadNpmTasks('grunt-contrib-uglify');  

  grunt.registerTask('default', ['concat', 'uglify']);

};