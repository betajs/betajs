module.banner = '/*!\n<%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\nCopyright (c) <%= pkg.contributors %>\n<%= pkg.license %> Software License.\n*/\n';

module.exports = function(grunt) {

	grunt.initConfig({
		pkg : grunt.file.readJSON('package.json'),
		concat : {
			options : {
				banner : module.banner
			},
			dist : {
				dest : 'dist/beta.js',
				src : [
					'src/base/base.js', 
					'src/base/types.js',
					'src/base/strings.js',
					'src/base/functions.js',
					'src/base/async.js',
					'src/base/scopes.js', 
					'src/base/ids.js', 
					'src/base/tokens.js',
					'src/base/objs.js',
					'src/base/class.js',
					'src/base/exceptions.js',
					'src/base/lists.js',
					'src/base/iterators.js', 
					'src/base/events.js',
					'src/base/classes.js',
					'src/base/properties.js',
					'src/base/collections.js',
					'src/base/comparators.js',
					'src/base/sort.js',
					'src/base/locales.js',
					'src/base/time.js',
					'src/base/timers.js',
					'src/base/templates.js',
					'src/base/javascript.js',
					'src/base/states.js', 
					'src/base/parser.js',
					'src/base/trees.js',
					'src/base/channels.js',
					'src/base/rmi.js',
					'src/base/promise.js',
					'src/base/structures.js',
					'src/base/keyvalue.js',
					'src/net/*.js',
				]
			},
		},
		uglify : {
			options : {
				banner : module.banner
			},
			dist : {
				files : {
					'dist/beta.min.js' : [ 'dist/beta.js' ],					
				}
			}
		},
		shell: {
			qunit: {
		    	command: 'qunit -c BetaJS:./dist/beta.js -t ./tests/*/*',
		    	options: {
                	stdout: true,
                	stderr: true,
            	},
            	src: [
            		"src/*/*.js",
            		"tests/*/*.js"
            	]
			},
			lint: {
		    	command: "jsl +recurse --process ./src/*.js",
		    	options: {
                	stdout: true,
                	stderr: true,
            	},
            	src: [
            		"src/*/*.js"
            	]
			}
		},
	});

	grunt.loadNpmTasks('grunt-newer');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-shell');	

	grunt.registerTask('default', ['newer:concat', 'newer:uglify']);
	grunt.registerTask('qunit', ['shell:qunit']);
	grunt.registerTask('lint', ['shell:lint']);	
	grunt.registerTask('check', ['lint', 'qunit']);

};