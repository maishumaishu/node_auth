
// let build = 'build';
let release = 'release';
let debug = 'debug';
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
        less: {
            client: {
                options: {
                    compress: false,
                },
                files: [{
                    expand: true,
                    cwd: 'src/client',
                    src: ['**/*.less'],
                    dest: `${debug}/client`,
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
                        dest: `${debug}/client`
                    }
                ]
            }
        }
    };


    grunt.initConfig(config);

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-shell');

    grunt.registerTask('default', ['shell', 'stylus', 'copy']);

};