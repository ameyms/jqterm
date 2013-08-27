module.exports = function(grunt) {

    var release = grunt.option('release'),
        dev = release?'':'-pre';

    grunt.initConfig({
        pkg: grunt.file.readJSON('term.jquery.json'),
        uglify: {
            options: {
    			     // the banner is inserted at the top of the output
                     banner: '/*! <%= pkg.title %> v<%= pkg.version %>'+dev+'\n(c) <%= grunt.template.today("yyyy") %> Amey Sakhadeo\n<%= pkg.licenses[0].type %> License: <%= pkg.licenses[0].url %> */\n',
                     preserveComments : 'some'
                 },
                 dist: {
                    files: {
                     'dist/jquery.term.min.js': ['src/**/*.js']
                 }
             }
         },

         jshint: {
            files: ['src/**/*.js', 'test/**/*.js'],
        	// configure JSHint (documented at http://www.jshint.com/docs/)
        	options: {

        		globals: {
                 jQuery: true,
                 console: true,
                 module: true
                }
            }
        },
        cssmin: {
            add_banner: {
                options: {
                    banner: '/*! <%= pkg.title %> v<%= pkg.version %>'+dev+'\n(c) <%= grunt.template.today("yyyy") %> Amey Sakhadeo\n<%= pkg.licenses[0].type %> License: <%= pkg.licenses[0].url %> */'
                },
                files: {
                    'dist/jquery.term.min.css': ['src/**/*.css']
                }
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    //grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    //grunt.registerTask('test', ['jshint', 'qunit']);

    grunt.registerTask('default', ['jshint']);
    grunt.registerTask('build', ['jshint','uglify', 'cssmin']);
};
