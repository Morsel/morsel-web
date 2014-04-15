module.exports = function ( grunt ) {
  
  /** 
   * Load required Grunt tasks. These are installed based on the versions listed
   * in `package.json` when you do `npm install` in this directory.
   */
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-ngmin');
  grunt.loadNpmTasks('grunt-html2js');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-prompt');

  //for our prompt
  var semver = require('semver');
  var currentVersion = require('./package.json').version;

  /**
   * Load in our build configuration file.
   */
  var userConfig = require( './build.config.js' );

  /**
   * This is the configuration object Grunt uses to give each plugin its 
   * instructions.
   */
  var taskConfig = {
    /**
     * We read in our `package.json` file so we can access the package name and
     * version. It's already there, so we don't repeat ourselves here.
     */
    pkg: grunt.file.readJSON("package.json"),

    /**
     * The banner is the comment that is placed at the top of our compiled 
     * source files. It is first processed as a Grunt template, where the `<%=`
     * pairs are evaluated based on this very configuration object.
     */
    meta: {
      banner: 
        '/**\n' +
        ' * <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
        ' * <%= pkg.homepage %>\n' +
        ' *\n' +
        ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
        /*' * Licensed <%= pkg.licenses.type %> <<%= pkg.licenses.url %>>\n' +*/
        ' */\n'
    },

    /**
     * Increments the version number, etc.
     */
    bump: {
      options: {
        files: [
          "package.json", 
          "bower.json"
        ],
        commit: false,
        createTag: false,
        push: false
      }
    },

    /**
     * The directories to delete when `grunt clean` is executed.
     */
    clean: [ 
      '<%= build_dir %>', 
      '<%= compile_dir %>'
    ],

    /**
     * The `copy` task just copies files from A to B. We use it here to copy
     * our project assets (images, fonts, etc.) and javascripts into
     * `build_dir`, and then to copy the assets to `compile_dir`.
     */
    copy: {
      build_app_assets: {
        files: [
          { 
            src: [ '**' ],
            dest: '<%= build_dir %>/assets/',
            cwd: 'src/assets',
            expand: true
          }
       ]
      },
      build_vendor_assets: {
        files: [
          { 
            src: [ '<%= vendor_files.assets %>' ],
            dest: '<%= build_dir %>/assets/vendor',
            cwd: '.',
            expand: true,
            flatten: true
          }
       ]
      },
      build_appjs: {
        files: [
          {
            src: [ '<%= app_files.js %>' ],
            dest: '<%= build_dir %>/',
            cwd: '.',
            expand: true
          }
        ]
      },
      build_vendorjs: {
        files: [
          {
            src: [ '<%= vendor_files.js %>' ],
            dest: '<%= build_dir %>/',
            cwd: '.',
            expand: true
          }
        ]
      },
      //copy our package.json for deployment
      build_package_json: {
        files: [
          {
            src: [ 'package.json' ],
            dest: '<%= build_dir %>/',
            cwd: '.',
            expand: true
          }
        ]
      },
      //copy the site's built css file into the style guide folder
      build_style_guide_css: {
        files: [
          {
            src: [ '<%= build_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.css'],
            dest: '<%= styleguide_dir %>/public/css/site-style.css',
            cwd: '.'
          }
        ]
      },
      //copy the site's images into the style guide folder
      build_style_guide_images: {
        files: [
          {
            src: [ '**'],
            dest: '<%= styleguide_dir %>/public/css/images',
            cwd: '<%= build_dir %>/assets/images',
            expand: true
          }
        ]
      },
      //copy the whole style guide over into the other folder
      build_style_guide: {
        files: [
          {
            src: [ '**', '!WHAR_INDEX'],
            dest: '<%= styleguidepublic_dir %>',
            cwd: '<%= styleguide_dir %>/public/',
            expand: true
          }
        ]
      },
      build_deploy: {
        files: [
          {
            src: [ '**' ],
            dest: '<%= build_deploy_dir %>',
            cwd: '<%= build_dir %>',
            expand: true
          }
        ]
      },
      compile_assets: {
        files: [
          {
            src: [ '**', '!*.css' ],
            dest: '<%= compile_dir %>/assets',
            cwd: '<%= build_dir %>/assets',
            expand: true
          }
        ]
      },
      compile_deploy: {
        files: [
          {
            src: [ '**' ],
            dest: '<%= compile_deploy_dir %>',
            cwd: '<%= compile_dir %>',
            expand: true
          }
        ]
      },
      blog: {
        files: [
          {
            src: [ '*.php', '*.txt', 'screenshot.png', 'images/*', 'xml/*' ],
            dest: '<%= blog_deploy_dir %>/ellen',
            cwd: '<%= blog_dir %>',
            expand: true
          }
        ]
      },
      build_server_data: {
        files: [
          {
            src: [ '<%= server_data_dir %>/*' ],
            dest: '<%= build_dir %>',
            cwd: '.',
            expand: true
          }
        ]
      },
      build_seo: {
        files: [
          {
            src: [ '<%= seo_dir %>/*' ],
            dest: '<%= build_dir %>',
            cwd: '.',
            expand: true
          }
        ]
      },
      build_static_launch: {
        files: [
          { 
            src: [ '**' ],
            dest: '<%= build_dir %>/launch/',
            cwd: '<%= static_launch_dir %>',
            expand: true
          }
        ]
      },
      compile_server_data: {
        files: [
          {
            src: [ '<%= server_data_dir %>/*' ],
            dest: '<%= compile_dir %>',
            cwd: '.',
            expand: true
          }
        ]
      },
      compile_seo: {
        files: [
          {
            src: [ '<%= seo_dir %>/*' ],
            dest: '<%= compile_dir %>',
            cwd: '.',
            expand: true
          }
        ]
      },
      compile_static_launch: {
        files: [
          { 
            src: [ '**' ],
            dest: '<%= compile_dir %>/launch/',
            cwd: '<%= static_launch_dir %>',
            expand: true
          }
        ]
      }
    },

    /**
     * `grunt concat` concatenates multiple source files into a single file.
     */
    concat: {
      /**
       * The `build_css` target concatenates compiled CSS and vendor CSS
       * together.
       */
      build_css: {
        src: [
          '<%= vendor_files.css %>',
          '<%= build_dir %>/assets/main.css'
        ],
        dest: '<%= build_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.css'
      },
      compile_css: {
        src: [
          '<%= vendor_files.css %>',
          '<%= compile_dir %>/assets/main.css'
        ],
        dest: '<%= compile_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.css'
      },
      /**
       * The `compile_js` target is the concatenation of our application source
       * code and all specified vendor source code into a single file.
       */
      compile_js: {
        options: {
          banner: '<%= meta.banner %>'
        },
        src: [ 
          '<%= vendor_files.js %>', 
          'module.prefix', 
          '<%= build_dir %>/src/**/*.js', 
          '<%= html2js.app.dest %>', 
          '<%= html2js.common.dest %>', 
          'module.suffix' 
        ],
        dest: '<%= compile_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.js'
      }
    },

    /**
     * `ng-min` annotates the sources before minifying. That is, it allows us
     * to code without the array syntax.
     */
    ngmin: {
      compile: {
        files: [
          {
            src: [ 'assets/<%= pkg.name %>-<%= pkg.version %>.js' ],
            cwd: '<%= compile_dir %>',
            dest: '<%= compile_dir %>',
            expand: true
          }
        ]
      }
    },

    /**
     * Minify the sources!
     */
    uglify: {
      compile: {
        options: {
          banner: '<%= meta.banner %>'
        },
        files: {
          '<%= concat.compile_js.dest %>': '<%= concat.compile_js.dest %>'
        }
      }
    },

    /**
     * `compass` handles our SCSS compilation and uglification automatically.
     * Only our `main.scss` file is included in compilation; all other files
     * must be imported from this file.
     */
    compass: {
      build: {
        options: {
          sassDir: 'src/sass',
          cssDir: '<%= build_dir %>/assets',
          trace: true,
          outputStyle: 'expanded',
          debugInfo: true,
          assetCacheBuster: false,
          imagesDir: '<%= build_dir %>/assets/images',
          relativeAssets: true
        }
      },
      compile: {
        options: {
          sassDir: 'src/sass',
          cssDir: '<%= compile_dir %>/assets',
          trace: false,
          outputStyle: 'compressed',
          debugInfo: false,
          assetCacheBuster: true,
          imagesDir: '<%= compile_dir %>/assets/images',
          relativeAssets: true
        }
      }
    },

    /**
     * `jshint` defines the rules of our linter as well as which files we
     * should check. This file, all javascript sources, and all our unit tests
     * are linted based on the policies listed in `options`. But we can also
     * specify exclusionary patterns by prefixing them with an exclamation
     * point (!); this is useful when code comes from a third party but is
     * nonetheless inside `src/`.
     */
    jshint: {
      src: [ 
        '<%= app_files.js %>'
      ],
      test: [
        '<%= app_files.jsunit %>'
      ],
      gruntfile: [
        'Gruntfile.js'
      ],
      options: {
        curly: true,
        immed: true,
        newcap: true,
        noarg: true,
        sub: true,
        boss: true,
        eqnull: true
      },
      globals: {}
    },

    /**
     * HTML2JS is a Grunt plugin that takes all of your template files and
     * places them into JavaScript files as strings that are added to
     * AngularJS's template cache. This means that the templates too become
     * part of the initial payload as one JavaScript file. Neat!
     */
    html2js: {
      /**
       * These are the templates from `src/app`.
       */
      app: {
        options: {
          base: 'src/app'
        },
        src: [ '<%= app_files.atpl %>' ],
        dest: '<%= build_dir %>/templates-app.js'
      },

      /**
       * These are the templates from `src/common`.
       */
      common: {
        options: {
          base: 'src/common'
        },
        src: [ '<%= app_files.ctpl %>' ],
        dest: '<%= build_dir %>/templates-common.js'
      }
    },

    /**
     * The Karma configurations.
     */
    karma: {
      options: {
        configFile: '<%= build_dir %>/karma-unit.js'
      },
      unit: {
        port: 9019,
        //runnerPort: 9101,
        background: true
      },
      continuous: {
        singleRun: true
      }
    },

    /**
     * The `index` task compiles the `index.html` file as a Grunt template. CSS
     * and JS files co-exist here but they get split apart later.
     */
    index: {

      /**
       * During development, we don't want to have wait for compilation,
       * concatenation, minification, etc. So to avoid these steps, we simply
       * add all script files directly to the `<head>` of `index.html`. The
       * `src` property contains the list of included files.
       */
      build: {
        dir: '<%= build_dir %>',
        src: [
          '<%= vendor_files.js %>',
          '<%= build_dir %>/src/**/*.js',
          '<%= html2js.common.dest %>',
          '<%= html2js.app.dest %>',
          '<%= vendor_files.css %>',
          '<%= build_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.css'
        ]
      },

      /**
       * When it is time to have a completely compiled application, we can
       * alter the above to include only a single JavaScript and a single CSS
       * file. Now we're back!
       */
      compile: {
        dir: '<%= compile_dir %>',
        src: [
          '<%= concat.compile_js.dest %>',
          '<%= compile_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.css'
        ]
      }
    },

    /**
     * The `appserver` task compiles the `server.js` file as a Grunt template.
     */
    appserver: {

      build: {
        dir: '<%= build_dir %>',
        src: [
          'appserver.tpl.js',
          'Procfile'
        ]
      },

      compile: {
        dir: '<%= compile_dir %>',
        src: [
          'appserver.tpl.js',
          'Procfile'
        ]
      }
    },

    /**
     * This task compiles the karma template so that changes to its file array
     * don't have to be managed manually.
     */
    karmaconfig: {
      unit: {
        dir: '<%= build_dir %>',
        src: [ 
          '<%= vendor_files.js %>',
          '<%= html2js.app.dest %>',
          '<%= html2js.common.dest %>',
          '<%= test_files.js %>'
        ]
      }
    },

    /**
     * And for rapid development, we have a watch set up that checks to see if
     * any of the files listed below change, and then to execute the listed 
     * tasks when they do. This just saves us from having to type "grunt" into
     * the command-line every time we want to see what we're working on; we can
     * instead just leave "grunt watch" running in a background terminal. Set it
     * and forget it, as Ron Popeil used to tell us.
     *
     * But we don't need the same thing to happen for all the files. 
     */
    delta: {
      /**
       * By default, we want the Live Reload to work for all tasks; this is
       * overridden in some tasks (like this file) where browser resources are
       * unaffected. It runs by default on port 35729, which your browser
       * plugin should auto-detect.
       */
      options: {
        livereload: true
      },

      /**
       * When the Gruntfile changes, we just want to lint it. In fact, when
       * your Gruntfile changes, it will automatically be reloaded!
       */
      gruntfile: {
        files: 'Gruntfile.js',
        tasks: [ 'jshint:gruntfile' ],
        options: {
          livereload: false
        }
      },

      /**
       * When our JavaScript source files change, we want to run lint them and
       * run our unit tests.
       */
      jssrc: {
        files: [ 
          '<%= app_files.js %>'
        ],
        tasks: [ 'jshint:src', 'karma:unit:run', 'copy:build_appjs' ]
      },

      /**
       * When assets are changed, copy them. Note that this will *not* copy new
       * files, so this is probably not very useful.
       */
      assets: {
        files: [ 
          'src/assets/**/*'
        ],
        tasks: [ 'copy:build_assets' ]
      },

      /**
       * When index.html changes, we need to compile it.
       */
      html: {
        files: [ '<%= app_files.html %>' ],
        tasks: [ 'index:build' ]
      },

      /**
       * When our templates change, we only rewrite the template cache.
       */
      tpls: {
        files: [ 
          '<%= app_files.atpl %>', 
          '<%= app_files.ctpl %>'
        ],
        tasks: [ 'html2js' ]
      },

      /**
       * When the CSS files change, we need to compile and minify them.
       */
      compass: {
        files: [ 'src/**/*.scss' ],
        tasks: [ 'compass:build', 'concat:build_css', 'style' ]
      },

      /**
       * When a JavaScript unit test file changes, we only want to lint it and
       * run the unit tests. We don't want to do any live reloading.
       */
      jsunit: {
        files: [
          '<%= app_files.jsunit %>'
        ],
        tasks: [ 'jshint:test', 'karma:unit:run' ],
        options: {
          livereload: false
        }
      },

      /**
       * When a style guide file changes, rebuild the style guide
       */
      style: {
        files: [
          '<%= styleguide_files %>'
        ],
        tasks: [ 'style' ]
      }
    },

    /*
     * Used to execute shell commands
     */
    shell: {
      dev_deploy_init: {
        command: 'sh <%= serverconfig_dir %>/server_init.sh <%= build_deploy_dir %> <%= dev_repo %> push_dev',
        options: {
          stdout: true
        }
      },
      dev_deploy_push: {
        command: [
          'git add .',
          'git commit -a -m "automatically pushed to dev"',
          'git push push_dev master -f'
        ].join('&&'),
        options: {
          stdout: true,
          execOptions: {
            cwd: '<%= build_deploy_dir %>'
          }
        }
      },
      style: {
        command: [
          'compass compile',
          'php builder/builder.php -g'
        ].join('&&'),
        options: {
          stdout: true,
          execOptions: {
            cwd: 'style-guide'
          }
        }
      },
      styletoheroku: {
        command: [
          'git add .',
          'git commit -a -m "automatically pushed style guide"',
          'git push heroku master'
        ].join('&&'),
        options: {
          stdout: true,
          execOptions: {
            cwd: '<%= styleguidepublic_dir %>'
          }
        }
      },
      blog: {
        command: [
          'compass compile',
          'zip -r ellen ellen'
        ].join('&&'),
        options: {
          stdout: true,
          execOptions: {
            cwd: '<%= blog_deploy_dir %>'
          }
        }
      },
      blog_deploy_push: {
        command: [
          'scp -r ellen morsel_wp1@insights.eatmorsel.com:/home/morsel_wp1/insights.eatmorsel.com/wp-content/themes/'
        ].join('&&'),
        options: {
          stdout: true,
          execOptions: {
            cwd: '<%= blog_deploy_dir %>'
          }
        }
      },
      staging_deploy_init: {
        command: 'sh <%= serverconfig_dir %>/server_init.sh <%= compile_deploy_dir %> <%= staging_repo %> push_staging',
        options: {
          stdout: true
        }
      },
      staging_deploy_push: {
        command: [
          'git add .',
          'git commit -a -m "automatically pushed to staging"',
          'git push push_staging master -f'
        ].join('&&'),
        options: {
          stdout: true,
          execOptions: {
            cwd: '<%= compile_deploy_dir %>'
          }
        }
      },
      production_deploy_init: {
        command: 'sh <%= serverconfig_dir %>/server_init.sh <%= compile_deploy_dir %> <%= prod_repo %> push_prod',
        options: {
          stdout: true
        }
      },
      production_deploy_push: {
        command: [
          'git add .',
          'git commit -a -m "automatically pushed to production"',
          'git push push_prod master -f'
        ].join('&&'),
        options: {
          stdout: true,
          execOptions: {
            cwd: '<%= compile_deploy_dir %>'
          }
        }
      },
      //silly that this has to be done like this
      bump_to_version: {
        command: 'grunt bump --setversion=<%= bump.version %>',
        options: {
          stdout: true
        }
      }
    },

    concurrent: {
      dev: {
        tasks: ['nodemon:dev', 'delta'],
        options: {
          logConcurrentOutput: true
        }
      }
    },
    nodemon: {
      dev: {
        script: 'server.js',
        options: {
          env: {
            PORT: '<%= dev_server_port %>'
          },
          cwd: '<%= build_dir %>'
        }
      },
      prod: {
        script: 'server.js',
        options: {
          env: {
            PORT: '<%= dev_server_port %>'
          },
          cwd: '<%= compile_dir %>'
        }
      }
    },

    prompt: {
      bump: {
        options: {
          questions: [
            {
              config:  'bump.type',
              type:    'list',
              message: 'Bump version from ' + '<%= pkg.version %>'.cyan + ' to:',
              choices: [
                {
                  value: 'build',
                  name:  'Build:  '.yellow + ('<%= pkg.version %>' + '-?').yellow +
                    ' Unstable, betas, and release candidates.'
                },
                {
                  value: 'patch',
                  name:  'Patch:  '.yellow + semver.inc(currentVersion, 'patch').yellow +
                    '   Backwards-compatible bug fixes.'
                },
                {
                  value: 'minor',
                  name:  'Minor:  '.yellow + semver.inc(currentVersion, 'minor').yellow +
                    '   Add functionality in a backwards-compatible manner.'
                },
                {
                  value: 'major',
                  name:  'Major:  '.yellow + semver.inc(currentVersion, 'major').yellow +
                    '   Incompatible API changes.'
                },
                {
                  value: 'custom',
                  name:  'Custom: ?.?.?'.yellow +
                    '   Specify version...'
                }
              ]
            },
            {
              config:   'bump.version',
              type:     'input',
              message:  'What specific version would you like',
              when:     function (answers) {
                return answers['bump.type'] === 'custom';
              },
              validate: function (value) {
                var valid = semver.valid(value) && true;
                return valid || 'Must be a valid semver, such as 1.2.3-rc1. See ' +
                  'http://semver.org/'.blue.underline + ' for more details.';
              }
            }
          ]
        }
      }
    }
  };

  grunt.initConfig( grunt.util._.extend( taskConfig, userConfig ) );

  /**
   * In order to make it safe to just compile or copy *only* what was changed,
   * we need to ensure we are starting from a clean, fresh build. So we rename
   * the `watch` task to `delta` (that's why the configuration var above is
   * `delta`) and then add a new task called `watch` that does a clean build
   * before watching for changes.
   * 
   * The `watch` task is what should be run while you develop/test
   */
  grunt.renameTask( 'watch', 'delta' );
  grunt.registerTask( 'watch', [ 'build-no-style', 'karma:unit', 'concurrent:dev' ] );

  /**
   * The default task is to build and compile.
   */
  grunt.registerTask( 'default', [ 'build', 'compile' ] );

  /**
   * The `build` task gets your app ready to run for development and testing.
   */
  grunt.registerTask( 'build', [ 'build-no-style', 'style']);

  /**
   * The `dev-server` task runs development code on local server
   */
  grunt.registerTask( 'dev-server', [ 'nodemon:dev']);

  /**
   * The `prod-server` task runs production-ready code on the local server
   */
  grunt.registerTask( 'prod-server', [ 'nodemon:prod']);

  /**
   * The `style` task builds the style guide locally
   */
  grunt.registerTask( 'style', [ 'shell:style', 'copy:build_style_guide_css', 'copy:build_style_guide_images', 'copy:build_style_guide' ]);

  /**
   * The `build-no-style` task builds without the style guide
   */
  grunt.registerTask( 'build-no-style', [
    'clean', 'html2js', 'jshint', 'copy:build_app_assets', 'compass:build',
    'concat:build_css', 'copy:build_vendor_assets',
    'copy:build_appjs', 'copy:build_vendorjs', 'copy:build_package_json', 'index:build', 'karmaconfig',
    'karma:continuous', 'copy:build_server_data', 'copy:build_seo', 'copy:build_static_launch', 'appserver:build'
  ]);

  /**
   * The `blog` task builds the blog
   */
  grunt.registerTask( 'blog', [ 'copy:blog', 'shell:blog' ]);
 
  /**
   * The `compile` task gets your app ready for deployment by concatenating and
   * minifying your code.
   */
  grunt.registerTask( 'compile', [ 'copy:compile_assets', 'compass:compile', 'concat:compile_css', 'concat:compile_js', 'ngmin', 'uglify', 'index:compile', 'copy:compile_server_data', 'copy:compile_seo', 'copy:compile_static_launch', 'appserver:compile'
  ]);

  /**
   * The `prompt-bump` task asks you if you want to bump versions before pushing
   */
  grunt.registerTask( 'prompt-bump', [
    'prompt:bump',
    'bump_prompt_react'
  ]);

  /*
   * PUSHING TO SERVERS
   */

  /**
   * The `push-style` task pushes the style guide to heroku (style.eatmorsel.com)
   */
  grunt.registerTask( 'push-style', [ 'shell:styletoheroku' ]);

  /**
   * The `push-dev` task pushes the site to heroku (dev.eatmorsel.com)
   */
  grunt.registerTask( 'push-dev', [ 'shell:dev_deploy_init', 'appserver:build', 'copy:build_deploy', 'shell:dev_deploy_push' ]);

  /**
   * The `push-staging` task pushes the site to heroku (staging.eatmorsel.com)
   */
  grunt.registerTask( 'push-staging', [ 'shell:staging_deploy_init', 'appserver:compile', 'copy:compile_deploy', 'shell:staging_deploy_push' ]);

  /**
   * The `push-production` task pushes the site to heroku (staging.eatmorsel.com)
   */
  grunt.registerTask( 'push-production', [ 'shell:production_deploy_init', 'appserver:compile', 'copy:compile_deploy', 'shell:production_deploy_push' ]);

  /**
   * The `push-blog` task pushes the blog to insights.eatmorsel.com over ssh
   */
  grunt.registerTask( 'push-blog', [ 'shell:blog_deploy_push' ]);

  /**
   * A utility function to get all app JavaScript sources.
   */
  function filterForJS ( files ) {
    return files.filter( function ( file ) {
      return file.match( /\.js$/ );
    });
  }

  /**
   * A utility function to get all app CSS sources.
   */
  function filterForCSS ( files ) {
    return files.filter( function ( file ) {
      return file.match( /\.css$/ );
    });
  }

  /** 
   * The index.html template includes the stylesheet and javascript sources
   * based on dynamic names calculated in this Gruntfile. This task assembles
   * the list into variables for the template to use and then runs the
   * compilation.
   */
  grunt.registerMultiTask( 'index', 'Process index.mustache template', function () {
    var dirRE = new RegExp( '^('+grunt.config('build_dir')+'|'+grunt.config('compile_dir')+')\/', 'g' );
    var jsFiles = filterForJS( this.filesSrc ).map( function ( file ) {
      return '/'+file.replace( dirRE, '' );
    });
    var cssFiles = filterForCSS( this.filesSrc ).map( function ( file ) {
      return '/'+file.replace( dirRE, '' );
    });

    grunt.file.copy('src/views/index.mustache', this.data.dir + '/views/index.mustache', { 
      process: function ( contents, path ) {
        return grunt.template.process( contents, {
          data: {
            scripts: jsFiles,
            styles: cssFiles,
            version: grunt.config( 'pkg.version' ),
            favicon_dir: grunt.config('favicon_dir')
          }
        });
      }
    });

    grunt.file.copy('src/views/404.mustache', this.data.dir + '/views/404.mustache', { 
      process: function ( contents, path ) {
        return grunt.template.process( contents, {
          data: {
            scripts: jsFiles,
            styles: cssFiles,
            version: grunt.config( 'pkg.version' ),
            favicon_dir: grunt.config('favicon_dir')
          }
        });
      }
    });

    grunt.file.copy('src/views/claim.mustache', this.data.dir + '/views/claim.mustache', { 
      process: function ( contents, path ) {
        return grunt.template.process( contents, {
          data: {
            scripts: jsFiles,
            styles: cssFiles,
            version: grunt.config( 'pkg.version' ),
            favicon_dir: grunt.config('favicon_dir')
          }
        });
      }
    });

    grunt.file.copy('src/views/unsubscribe.mustache', this.data.dir + '/views/unsubscribe.mustache', { 
      process: function ( contents, path ) {
        return grunt.template.process( contents, {
          data: {
            scripts: jsFiles,
            styles: cssFiles,
            version: grunt.config( 'pkg.version' ),
            favicon_dir: grunt.config('favicon_dir')
          }
        });
      }
    });

    grunt.file.copy('src/views/partials/ga.mustache', this.data.dir + '/views/partials/ga.mustache', { 
      process: function ( contents, path ) {
        return grunt.template.process( contents, {
          data: {
            scripts: jsFiles,
            styles: cssFiles,
            version: grunt.config( 'pkg.version' ),
            favicon_dir: grunt.config('favicon_dir')
          }
        });
      }
    });

    grunt.file.copy('src/views/partials/mixpanel.mustache', this.data.dir + '/views/partials/mixpanel.mustache', { 
      process: function ( contents, path ) {
        return grunt.template.process( contents, {
          data: {
            scripts: jsFiles,
            styles: cssFiles,
            version: grunt.config( 'pkg.version' ),
            favicon_dir: grunt.config('favicon_dir')
          }
        });
      }
    });
  });

  /**
   * In order to avoid having to specify manually the files needed for karma to
   * run, we use grunt to manage the list for us. The `karma/*` files are
   * compiled as grunt templates for use by Karma. Yay!
   */
  grunt.registerMultiTask( 'karmaconfig', 'Process karma config templates', function () {
    var jsFiles = filterForJS( this.filesSrc );
    
    grunt.file.copy( 'karma/karma-unit.tpl.js', grunt.config( 'build_dir' ) + '/karma-unit.js', { 
      process: function ( contents, path ) {
        return grunt.template.process( contents, {
          data: {
            scripts: jsFiles,
            buildDir: grunt.config('build_dir')
          }
        });
      }
    });

    grunt.file.copy( 'karma/karma-config.tpl.js', grunt.config( 'build_dir' ) + '/karma-config.js', { 
      process: function ( contents, path ) {
        return grunt.template.process( contents, {
          data: {
            version: grunt.config( 'pkg.version' )
          }
        });
      }
    });
  });

  /** 
   * The server.js template includes the node/express server that's generated
   * based on dynamic names calculated in this Gruntfile. This task assembles
   * the list into variables for the template to use and then runs the
   * compilation.
   */
  grunt.registerMultiTask( 'appserver', 'Process server files', function () {
    var dirRE = new RegExp( '^('+grunt.config('build_dir')+'|'+grunt.config('compile_dir')+')\/', 'g' );

    grunt.file.copy(grunt.config( 'serverconfig_dir' ) + '/server.tpl.js', this.data.dir + '/server.js', { 
      process: function ( contents, path ) {
        return grunt.template.process( contents, {
          //don't need to pass anything at the moment
          data: {
            version: grunt.config( 'pkg.version' )
          }
        });
      }
    });

    grunt.file.copy(grunt.config( 'serverconfig_dir' ) + '/Procfile', this.data.dir + '/Procfile', { 
      process: function ( contents, path ) {
        return grunt.template.process( contents, {
          //don't need to pass anything at the moment
          data: {
          }
        });
      }
    });
  });

  /*
   * 'bump_prompt_react' decides what kind of bump needs to happen
   */
  grunt.registerTask( 'bump_prompt_react', function () {
    if(grunt.config('bump.type') === 'custom') {
      grunt.task.run(['shell:bump_to_version']);
    } else {
      grunt.task.run(['bump:'+grunt.config('bump.type')]);
    }
  });

};