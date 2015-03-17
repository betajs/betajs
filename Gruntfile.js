module.banner = '/*!\n<%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\nCopyright (c) <%= pkg.contributors %>\n<%= pkg.license %> Software License.\n*/\n';

module.exports = function(grunt) {

	grunt.initConfig({
		pkg : grunt.file.readJSON('package.json'),
		'revision-count': {
		    options: {
		      property: 'revisioncount',
		      ref: 'HEAD'
		    }
		},
		concat : {
			options : {
				banner : module.banner
			},
			dist_raw : {
				dest : 'dist/beta-raw.js',
				src : [
					'src/fragments/begin.js-fragment',
					'src/base/types.js',
					'src/base/functions.js',
					'src/base/ids.js', 
					'src/base/tokens.js',
					'src/base/objs.js',
					'src/base/strings.js',
					'src/base/locales.js',
					'src/base/structures.js',
					'src/base/time.js',
					'src/base/async.js',
					'src/base/promise.js',
					'src/base/javascript.js',
					'src/base/class.js',					
					'src/base/exceptions.js',
					'src/base/templates.js',
					'src/base/parser.js',
					'src/base/timers.js',
					'src/base/iterators.js', 
					'src/base/lists.js',
					'src/base/events.js',
					'src/base/properties.js',
					'src/base/comparators.js',
					'src/base/sort.js',
					'src/base/trees.js',
					'src/base/classes.js',
					'src/base/collections.js',
					'src/base/channels.js',
					'src/base/keyvalue.js',					
					'src/base/states.js', 
					'src/base/rmi.js',					
					'src/net/*.js',
					'src/fragments/end.js-fragment'
				]
			},
			dist_scoped: {
				dest : 'dist/beta.js',
				src : [
				    'vendors/scoped.js',
				    'dist/beta-noscoped.js'
				]
			}
		},
		preprocess : {
			options: {
			    context : {
			    	MAJOR_VERSION: '<%= revisioncount %>',
			    	MINOR_VERSION: (new Date()).getTime()
			    }
			},
			dist : {
			    src : 'dist/beta-raw.js',
			    dest : 'dist/beta-noscoped.js'
			}
		},	
		clean: ["dist/beta-raw.js"],
		uglify : {
			options : {
				banner : module.banner
			},
			dist : {
				files : {
					'dist/beta-noscoped.min.js' : [ 'dist/beta-noscoped.js' ],
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
			},
			lintfinal: {
		    	command: "jsl --process ./dist/beta.js",
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
	grunt.loadNpmTasks('grunt-git-revision-count');
	grunt.loadNpmTasks('grunt-preprocess');
	grunt.loadNpmTasks('grunt-contrib-clean');	
	

	grunt.registerTask('default', ['revision-count', 'concat:dist_raw', 'preprocess', 'clean', 'concat:dist_scoped', 'uglify']);
	grunt.registerTask('qunit', ['shell:qunit']);
	grunt.registerTask('lint', ['shell:lint', 'shell:lintfinal']);	
	grunt.registerTask('check', ['lint', 'qunit']);

};