module.exports = function(grunt) {

	var pkg = grunt.file.readJSON('package.json');
	var gruntHelper = require('betajs-compile');
	var dist = 'beta';

	gruntHelper.init(pkg, grunt)
	
    /* Compilation */    
	.scopedclosurerevisionTask(null, "src/**/*.js", "dist/" + dist + "-noscoped.js", {
		"module": "global:BetaJS"
    }, null, true)	
    .concatTask('concat-scoped', [require.resolve('betajs-scoped'), 'dist/' + dist + '-noscoped.js'], 'dist/' + dist + '.js')
    .uglifyTask('uglify-noscoped', 'dist/' + dist + '-noscoped.js', 'dist/' + dist + '-noscoped.min.js')
    .uglifyTask('uglify-scoped', 'dist/' + dist + '.js', 'dist/' + dist + '.min.js')
	.jsbeautifyTask(null, "src/**/*.js")

    /* Testing */
    .qunitjsTask(null, ['dist/' + dist + '.js', 'tests/'])
    .closureTask(null, [require.resolve('betajs-scoped'), "./dist/" + dist + "-noscoped.js"])
    .browserqunitTask(null, "tests/tests.html")
    .browserstackTask(null, 'tests/tests.html', {desktop: true, mobile: true})
    .lintTask(null, ['./src/**/*.js', './dist/' + dist + '-noscoped.js', './dist/' + dist + '.js', './Gruntfile.js', './tests/**/*.js', "./benchmarks/**/*.js"])
    .benchmarkTask("benchmark-general", ['benchmarks/common/init.js', 'benchmarks/general/*.js'])
    .benchmarkTask("benchmark-compare", ['benchmarks/common/init.js', 'benchmarks/compare/*.js'])
    
    /* External Configurations */
    .codeclimateTask()
    .travisTask(null, "4.0")
    
    /* Markdown Files */
	.readmeTask()
    .licenseTask()
    .packageTask()
	.autoincreasepackageTask(null, "package-source.json")
	.githookTask(null, "pre-commit", "check")
    
    /* Documentation */
    .docsTask();

    gruntHelper.config.shell.tsbuild = {
		command: "tsc --outDir src/tsbuild src/**/*.ts"
	};

	grunt.initConfig(gruntHelper.config);

	grunt.registerTask('default', ['autoincreasepackage', 'package', 'githook', 'readme', 'license', 'codeclimate', 'travis', "jsbeautify", 'shell:tsbuild', 'scopedclosurerevision', 'concat-scoped', 'uglify-noscoped', 'uglify-scoped']);
	grunt.registerTask('check', ['lint', 'qunitjs']);

};