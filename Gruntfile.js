module.exports = function(grunt) {

	var pkg = grunt.file.readJSON('package.json');
	var gruntHelper = require("betajs-compile/grunt.js");
	
	gruntHelper.init(pkg, grunt)

	
    /* Compilation */    
    .concatTask("concat-raw", ['src/fragments/begin.js-fragment', 'src/**/*.js', 'src/fragments/end.js-fragment'], "dist/beta-raw.js")
    .preprocessrevisionTask(null, "dist/beta-raw.js", "dist/beta-noscoped.js")
    .concatTask("concat-scoped", ['vendors/scoped.js', 'dist/beta-noscoped.js'], 'dist/beta.js')
    .uglifyTask("uglify-noscoped", "dist/beta-noscoped.js", "dist/beta-noscoped.min.js")
    .uglifyTask("uglify-scoped", "dist/beta.js", "dist/beta.min.js")

    /* Testing */
    .qunitTask(null, "./dist/beta.js", grunt.file.expand("./tests/*/*.js"))
    .closureTask(null, "dist/beta.js")
    .browserstackTask(null, "tests/tests.html", {desktop: true, mobile: false})
    .browserstackTask(null, "tests/tests.html", {desktop: false, mobile: true})
    .lintTask(null, ["./src/**/*.js", "./dist/beta-noscoped.js", "./dist/beta.js", "./Gruntfile.js", "./tests/**/*.js"])
    
    /* External Configurations */
    .codeclimateTask()
    .travisTask()
    
    /* Dependencies */
    .dependenciesTask(null, { github: ["betajs/betajs-scoped/dist/scoped.js"] })

    /* Markdown Files */
	.readmeTask()
    .licenseTask()
    
    /* Documentation */
    .docsTask();

	grunt.initConfig(gruntHelper.config);	

	grunt.registerTask('default', ['concat-raw', 'preprocessrevision', 'concat-scoped', 'uglify-noscoped', 'uglify-scoped']);
	grunt.registerTask('check', ['lint', 'qunit']);

};