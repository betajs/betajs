module.banner = '/*!\n<%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\nCopyright (c) <%= pkg.contributors %>\n<%= pkg.license %> Software License.\n*/\n';

module.exports = function(grunt) {

	grunt
			.initConfig({
				pkg : grunt.file.readJSON('package.json'),
				'revision-count' : {
					options : {
						property : 'revisioncount',
						ref : 'HEAD'
					}
				},
				concat : {
					options : {
						banner : module.banner
					},
					dist_raw : {
						dest : 'dist/beta-raw.js',
						src : [ 'src/fragments/begin.js-fragment',
								'src/base/types.js', 'src/base/functions.js',
								'src/base/ids.js', 'src/base/tokens.js',
								'src/base/objs.js', 'src/base/strings.js',
								'src/base/locales.js',
								'src/base/structures.js', 'src/base/time.js',
								'src/base/async.js', 'src/base/promise.js',
								'src/base/javascript.js', 'src/base/class.js',
								'src/base/exceptions.js',
								'src/base/templates.js', 'src/base/parser.js',
								'src/base/timers.js', 'src/base/iterators.js',
								'src/base/lists.js', 'src/base/events.js',
								'src/base/properties.js',
								'src/base/comparators.js', 'src/base/sort.js',
								'src/base/trees.js', 'src/base/classes.js',
								'src/base/collections.js',
								'src/base/channels.js', 'src/base/keyvalue.js',
								'src/base/states.js', 'src/base/rmi.js',
								'src/net/*.js', 'src/fragments/end.js-fragment' ]
					},
					dist_scoped : {
						dest : 'dist/beta.js',
						src : [ 'vendors/scoped.js', 'dist/beta-noscoped.js' ]
					}
				},
				preprocess : {
					options : {
						context : {
							MAJOR_VERSION : '<%= revisioncount %>',
							MINOR_VERSION : (new Date()).getTime()
						}
					},
					dist : {
						src : 'dist/beta-raw.js',
						dest : 'dist/beta-noscoped.js'
					}
				},
				clean : [ "dist/beta-raw.js", "dist/beta-closure.js" ],
				uglify : {
					options : {
						banner : module.banner
					},
					dist : {
						files : {
							'dist/beta-noscoped.min.js' : [ 'dist/beta-noscoped.js' ],
							'dist/beta.min.js' : [ 'dist/beta.js' ]
						}
					}
				},
				jshint : {
					options: {
						es5: false,
						es3: true
					},
					source : [ "./src/base/*.js", "./src/net/*.js" ],
					dist : [ "./dist/beta-noscoped.js", "./dist/beta.js" ],
					gruntfile : [ "./Gruntfile.js" ],
					tests : [ "./tests/base/*.js" ]
				},
				wget : {
					dependencies : {
						options : {
							overwrite : true
						},
						files : {
							"./vendors/scoped.js" : "https://raw.githubusercontent.com/betajs/betajs-scoped/master/dist/scoped.js"
						}
					}
				},
				closureCompiler : {
					options : {
						compilerFile : process.env.CLOSURE_PATH+"/compiler.jar",
						compilerOpts : {
							compilation_level : 'ADVANCED_OPTIMIZATIONS',
							warning_level : 'verbose',
							externs : [ "./src/fragments/closure.js-fragment" ]
						}
					},
					dist : {
						src : "./dist/beta.js",
						dest : "./dist/beta-closure.js"
					}
				},
				jsdoc : {
					dist : {
						src : [ './README.md', './src/base/*.js' ],
						options : {
							destination : 'docs',
							template : "node_modules/grunt-jsdoc/node_modules/ink-docstrap/template",
							configure : "./jsdoc.conf.json"
						}
					}
				},
				'node-qunit' : {
					dist : {
						code : './dist/beta.js',
						tests : grunt.file.expand("./tests/base/*.js"),
						done : function(err, res) {
							publishResults("node", res, this.async());
						}
					}
				}
			});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-git-revision-count');
	grunt.loadNpmTasks('grunt-preprocess');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-wget');
	grunt.loadNpmTasks('grunt-closure-tools');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-node-qunit');
	grunt.loadNpmTasks('grunt-jsdoc');

	grunt.registerTask('default', [ 'revision-count', 'concat:dist_raw',
			'preprocess', 'clean', 'concat:dist_scoped', 'uglify' ]);
	grunt.registerTask('qunit', [ 'node-qunit' ]);
	grunt.registerTask('lint', [ 'jshint:source', 'jshint:dist',
			'jshint:tests', 'jshint:gruntfile' ]);
	grunt.registerTask('check', [ 'lint', 'qunit' ]);
	grunt.registerTask('dependencies', [ 'wget:dependencies' ]);
	grunt.registerTask('closure', [ 'closureCompiler', 'clean' ]);

};