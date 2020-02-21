'use strict';
module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        /**
         * Set banner
         */
        banner: '/**\n' +
            '<%= pkg.name %> - <%= pkg.version %>\n' +
            '<%= pkg.author %>\n' +
            '<%= pkg.homepage %>\n' +
            'Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>\n' +
            'License: <%= pkg.license %>\n' +
            '*/\n',
        notify: {
            sass: {
                options: {
                    title: '<%= pkg.name %>',
                    message: 'Sass Compiler finished'
                }
            },
            js: {
                options: {
                    title: '<%= pkg.name %>',
                    message: 'JS Compiler finished'
                }
            },
            concat: {
                options: {
                    title: '<%= pkg.name %>',
                    message: 'CONCAT finished'
                }
            }
        },
        dist_dir:'assets/',
        /**
         * JSHint
         * @github.com/gruntjs/grunt-contrib-jshint
         */
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: [
                'build/js/**/*.js',
                '!<%= dist_dir %>/js/<%= pkg.name %>.js',
            ]
        },
        /**
         * Concatenate
         * @github.com/gruntjs/grunt-contrib-concat
         */
        concat: {
            options: {
                stripBanners: true,
                banner: '<%= banner %>'
                + '// Make sure jQuery has been loaded\n'
                + 'if (typeof jQuery === \'undefined\') {\n'
                + '    throw new Error(\'<%= pkg.name %> requires jQuery\')\n'
                + '}\n\n'
            },
            js: {
                src: ['build/js/**/*.js'],
                dest: '<%= dist_dir %>/js/<%= pkg.name %>.js'
            },
        },
        /**
         * Minify
         * @github.com/gruntjs/grunt-contrib-uglify
         */
        uglify: {
            // Minify js files in js/src/
            dist: {
                src: ['<%= concat.js.dest %>'],
                dest: '<%= dist_dir %>/js/<%= pkg.name %>.min.js'
            },
        },
        sass: {
            // Development options
            dev: {
                options: {
                    style: 'expanded',
                },
                files: {
                    '<%= dist_dir %>/css/<%= pkg.name %>.css': [
                        'build/sass/app.scss'
                    ]
                }
            },
            dist: {
                options: {
                    style: 'compressed',
                    compass: false,
                    sourcemap: false
                },
                files: {
                    '<%= dist_dir %>/css/<%= pkg.name %>.min.css': [
                        'build/sass/app.scss'
                    ]
                }
            }
        },
        /**
         * Minify .svg
         * @github.com/sindresorhus/grunt-svgmin
         */
        svgmin: {
            options: {
                plugins: [{
                    // Prevent removing the viewBox attr. Previously caused issues in IE9+.
                    removeViewBox: false
                }]
            },
            dist: {
                files: [{
                    expand: true, // Enable dynamic expansion.
                    cwd: 'build/img/', // Src matches are relative to this path.
                    src: ['**/*.svg'], // Actual pattern(s) to match.
                    dest: '<%= dist_dir %>/img/', // Destination path prefix.
                }],
            }
        },

        /**
         * Compress .jpg/.png
         * @github.com/gruntjs/grunt-image
         */
        // Optimize images
        image: {
            dynamic: {
                files: [
                    {
                        expand: true,
                        cwd: 'build/img/',
                        src: ['**/*.{png,jpg,gif,svg,jpeg}'],
                        dest: '<%= dist_dir %>/img/'
                    }
                ]
            }
        },


        /**
         * Convert .svg to .png
         * @github.com/dbushell/grunt-svg2png
         */
        svg2png: {
            dist: {
                files: [{
                    src: ['build/img/**/*.svg'],
                }],
            }
        },
        watch: {
            options: {
                livereload: true//Default port 35729
            },
            sass: {
                files: [
                    'build/sass/**/*.scss'
                ],
                tasks: ['sass:dev']
            },
            js: {
                files: [
                    'build/js/**/*.js'
                ],
                tasks: ['jshint', 'concat:js', 'uglify']
            },
            html: {
                files: [
                    '**/*.html'
                ]
            }
        },
        clean: {
            build: ['build/img/*']
        }
    });

    // Load tasks
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-notify');
    grunt.loadNpmTasks('grunt-image');
    grunt.loadNpmTasks('grunt-svgmin');
    grunt.loadNpmTasks('grunt-svg2png');

    /**
     * Default Task
     * run `grunt`
     */
    grunt.registerTask('default', [
        'clean',
        'sass:dev',
        'uglify'
    ]);

    /**
     * Development tast
     * run `grunt dev`
     */
    grunt.registerTask('dev', [
        'watch'
    ]);

    /**
     * Production tast, use for deploying
     * run `grunt production`
     */
    grunt.registerTask('production', [
        'clear',
        'jshint',           // JShint
        'concat:js',        // Concatenate main JS files
        'uglify',           // Minifiy concatenated JS file
        'sass:dist',        // Compile Sass with distribution settings
        'svg2png',          // Convert svg files to png
        'svgmin',           // Compress svg files
        'image',         // Compress jpg/jpeg + png files
    ]);

    /**
     * Image Tasks
     * run `grunt images`
     */
    grunt.registerTask('images', [
        'svg2png',          // Convert svg files to png
        'svgmin',           // Compress svg files
        'image',         // Compress jpg/jpeg + png files
    ]);
};