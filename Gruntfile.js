
let build = 'build';
let release = 'release';
module.exports = function (grunt) {
    var config = {
        shell: {
            client: {
                command: 'tsc -p ./src/client',
                options: {
                    failOnError: false
                }
            },
            server: {
                command: 'tsc -p ./src/server',
                options: {
                    failOnError: false
                }
            },
            test: {
                command: 'tsc -p ./src/test',
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

    grunt.registerTask('default', ['shell', 'stylus', 'copy']);

};