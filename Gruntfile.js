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
								'src/**/*.js', 'src/fragments/end.js-fragment' ]
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
				clean : {
					raw : "dist/beta-raw.js",
					closure : "dist/beta-closure.js",
					browserstack : [ "./browserstack.json", "BrowserStackLocal" ],
					jsdoc : ['./jsdoc.conf.json']
				},
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
					options : {
						es5 : false,
						es3 : true,
						smarttabs: true
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
						compilerFile : process.env.CLOSURE_PATH + "/compiler.jar",
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
							template : "node_modules/grunt-betajs-docs-compile",
							configure : "./jsdoc.conf.json",
							tutorials: "./docsrc/tutorials",
							recurse: true
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
				},
				shell : {
					browserstack : {
						command : 'browserstack-runner',
						options : {
							stdout : true,
							stderr : true
						}
					}
				},
				template : {
					"readme" : {
						options : {
							data: {
								indent: "",
								framework: grunt.file.readJSON('package.json')
							}
						},
						files : {
							"README.md" : ["readme.tpl"]
						}
					},
					"jsdoc": {
						options: {
							data: {
								data: {
									"tags": {
										"allowUnknownTags": true
									},
									"plugins": ["plugins/markdown"],
									"templates": {
										"cleverLinks": false,
										"monospaceLinks": false,
										"dateFormat": "ddd MMM Do YYYY",
										"outputSourceFiles": true,
										"outputSourcePath": true,
										"systemName": "BetaJS",
										"footer": "",
										"copyright": "BetaJS (c) - MIT License",
										"navType": "vertical",
										"theme": "cerulean",
										"linenums": true,
										"collapseSymbols": false,
										"inverseNav": true,
										"highlightTutorialCode": true,
										"protocol": "fred://",
										"singleTutorials": true
									},
									"markdown": {
										"parser": "gfm",
										"hardwrap": true
									}
								}
							}
						},
						files : {
							"jsdoc.conf.json": ["json.tpl"]
						}
					},
					"browserstack-desktop" : {
						options : {
							data: {
								data: {
									"test_path" : "tests/tests.html",
									"test_framework" : "qunit",
									"timeout": 10 * 60,
									"browsers": [
						              	'firefox_latest',
									    'firefox_4',
						                'chrome_latest',
							            'chrome_14',
						                'safari_latest',
							            'safari_4',
						                'opera_latest', 
									    'opera_12_15',
						                'ie_11',
						                'ie_10',
						                'ie_9',
						                'ie_8',
						                'ie_7',
						                'ie_6'
						            ]
								}
							}
						},
						files : {
							"browserstack.json" : ["json.tpl"]
						}
					},
					"browserstack-mobile" : {
						options : {
							data: {
								data: {
									"test_path" : "tests/tests.html",
									"test_framework" : "qunit",
									"timeout": 10 * 60,
									"browsers": [
									    {"os": "ios", "os_version": "8.0"}, 
									    {"os": "ios", "os_version": "7.0"},
									    {"os": "android", "os_version": "4.4"},
									    {"os": "android", "os_version": "4.0"}
						            ]
								}
							}
						},
						files : {
							"browserstack.json" : ["json.tpl"]
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
	grunt.loadNpmTasks('grunt-shell');
	grunt.loadNpmTasks('grunt-template');

	grunt.registerTask('default', [ 'revision-count', 'concat:dist_raw',
			'preprocess', 'clean:raw', 'concat:dist_scoped', 'uglify' ]);
	grunt.registerTask('docs', ['template:jsdoc', 'jsdoc', 'clean:jsdoc']);
	grunt.registerTask('qunit', [ 'node-qunit' ]);
	grunt.registerTask('lint', [ 'jshint:source', 'jshint:dist',
			'jshint:tests', 'jshint:gruntfile' ]);
	grunt.registerTask('check', [ 'lint', 'qunit' ]);
	grunt.registerTask('dependencies', [ 'wget:dependencies' ]);
	grunt.registerTask('closure', [ 'closureCompiler', 'clean:closure' ]);
	grunt.registerTask('browserstack-desktop', [ 'template:browserstack-desktop', 'shell:browserstack', 'clean:browserstack' ]);
	grunt.registerTask('browserstack-mobile', [ 'template:browserstack-mobile', 'shell:browserstack', 'clean:browserstack' ]);
	grunt.registerTask('readme', [ 'template:readme' ]);

};