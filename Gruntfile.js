
let build = 'build';
let release = 'release';
module.exports = function (grunt) {
    var config = {
        ts: {
            // server: {
            //     src: ['src/server/**/*.ts'],
            //     dest: `${build}/server`,
            //     options: {
            //         target: 'es6',
            //         module: 'commonjs',
            //         removeComments: true,
            //         declaration: false,
            //         sourceMap: false,
            //         references: [
            //             "src/server/**/*.ts",
            //         ],
            //     }
            // },
            client: {
                src: ['src/client/**/*.ts'],
                dest: `${build}/client`,
                options: {
                    target: 'es6',
                    module: 'amd',
                    removeComments: true,
                    declaration: false,
                    sourceMap: false,
                }
            },
            test: {
                src: ['src/test/**/*.ts'],
                dest: `${build}`,
                options: {
                    target: 'es6',
                    module: 'commonjs',
                    removeComments: true,
                    declaration: false,
                    sourceMap: false,
                    references: [
                        "src/test/**/*.ts"
                    ],
                }
            },
            // server_release: {
            //     src: ['src/server/**/*.ts'],
            //     dest: `${release}/server`,
            //     options: {
            //         target: 'es6',
            //         module: 'commonjs',
            //         removeComments: true,
            //         declaration: false,
            //         sourceMap: false,
            //         references: [
            //             "src/server/**/*.ts",
            //         ],
            //     }
            // }
        },
        shell: {
            ts: {
                command: 'tsc -p ./src/server',
                options: {
                    failOnError: false
                }
            },
        },
        stylus: {
            app: {
                options: {
                    compress: false,
                },
                files: [{
                    expand: true,
                    cwd: 'src/client/css/',
                    src: ['**/*.styl'],
                    dest: `${build}/client/css`,
                    ext: '.css'
                }]
            },
        },
        copy: {
            client: {
                files: [
                    {
                        expand: true, cwd: 'src/client',
                        src: ['**/*.html', '**/*.js', '**/*.css', 'font/*.*'],
                        dest: `${build}/client`
                    },
                    {
                        expand: true, cwd: `${build}/client`,
                        src: ['**/*.html', '**/*.js', '**/*.css', 'font/*.*'],
                        dest: `${release}/client`
                    }
                ]
            }
        }
    };


    grunt.initConfig(config);

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-stylus');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-ts');

    grunt.registerTask('default', ['ts', 'shell', 'stylus', 'copy']);

};