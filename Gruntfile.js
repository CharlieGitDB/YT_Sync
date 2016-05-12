module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            build: {
                src: 'script.js',
                dest: 'popcornsyncext/script.min.js'
            }
        },
        watch: {
    			scripts: {
    				files: ['script.js'],
    				tasks: ['uglify'],
    				options: {
    					spawn: false
    				}
    			}
    		}
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Default task(s).
    grunt.registerTask('default', ['uglify', 'watch']);

};
