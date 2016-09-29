module.exports = function(grunt) {

	var pkg = grunt.file.readJSON('package.json');
	var gruntHelper = require('betajs-compile/grunt.js');
	var dist = 'beta';

	gruntHelper.init(pkg, grunt)
	
	
    /* Compilation */    
	.scopedclosurerevisionTask(null, "src/**/*.js", "dist/" + dist + "-noscoped.js", {
		"module": "global:BetaJS"
    }, null, true)	
    .concatTask('concat-scoped', ['vendors/scoped.js', 'dist/' + dist + '-noscoped.js'], 'dist/' + dist + '.js')
    .uglifyTask('uglify-noscoped', 'dist/' + dist + '-noscoped.js', 'dist/' + dist + '-noscoped.min.js')
    .uglifyTask('uglify-scoped', 'dist/' + dist + '.js', 'dist/' + dist + '.min.js')

    /* Testing */
    .qunitTask(null, './dist/' + dist + '.js', grunt.file.expand('./tests/*/*.js'))
    .closureTask(null, ["./vendors/scoped.js", "./dist/" + dist + "-noscoped.js"])
    .browserqunitTask(null, "tests/tests.html")
    .browserstackTask(null, 'tests/tests.html', {desktop: true, mobile: false})
    .browserstackTask(null, 'tests/tests.html', {desktop: false, mobile: true})
    .lintTask(null, ['./src/**/*.js', './dist/' + dist + '-noscoped.js', './dist/' + dist + '.js', './Gruntfile.js', './tests/**/*.js', "./benchmarks/**/*.js"])
    .benchmarkTask("benchmark-general", ['benchmarks/common/init.js', 'benchmarks/general/*.js'])
    .benchmarkTask("benchmark-compare", ['benchmarks/common/init.js', 'benchmarks/compare/*.js'])
    
    /* External Configurations */
    .codeclimateTask()
    .travisTask()
    
    /* Dependencies */
    .dependenciesTask(null, { github: ['betajs/betajs-scoped/dist/scoped.js'] })

    /* Markdown Files */
	.readmeTask()
    .licenseTask()
    .packageTask()
    
    /* Documentation */
    .docsTask();
	
	grunt.initConfig(gruntHelper.config);	

	grunt.registerTask('default', ['package', 'readme', 'license', 'codeclimate', 'travis', 'scopedclosurerevision', 'concat-scoped', 'uglify-noscoped', 'uglify-scoped']);
	grunt.registerTask('check', ['lint', 'qunit']);

};