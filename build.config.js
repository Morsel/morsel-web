/**
 * This file/module contains all configuration for the build process.
 */
module.exports = {
  /**
   * The `build_dir` folder is where our projects are compiled during
   * development and the `compile_dir` folder is where our app resides once it's
   * completely built.
   */
  build_dir: 'build',
  compile_dir: 'bin',
  build_deploy_dir: '../morsel-deploy-dev',
  build_dir_name: 'Morsel - Dev',
  compile_deploy_dir: '../morsel-deploy-prod',
  compile_dir_name: 'Morsel',
  serverconfig_dir: 'server-config',
  styleguide_dir: 'style-guide',
  //for copying style guide into a public spot
  styleguidepublic_dir: '../morsel-style-guide/',
  blog_dir: 'blog/src',
  blog_deploy_dir: 'blog',

  dev_repo: 'git@heroku.com:eatmorsel-dev.git',
  staging_repo: 'git@heroku.com:eatmorsel-staging.git',
  prod_repo: 'git@heroku.com:eatmorsel.git',

  /**
   * This is a collection of file patterns that refer to our app code (the
   * stuff in `src/`). These file paths are used in the configuration of
   * build tasks. `js` is all project javascript, less tests. `ctpl` contains
   * our reusable components' (`src/common`) template HTML files, while
   * `atpl` contains the same, but for our app's code. `html` is just our
   * main HTML file, `sass` is our main stylesheet, and `unit` contains our
   * app's unit tests.
   */
  app_files: {
    js: [ 'src/**/*.js', '!src/**/*.spec.js', '!src/assets/**/*.js' ],
    jsunit: [ 'src/**/*.spec.js' ],

    atpl: [ 'src/app/**/*.tpl.html' ],
    ctpl: [ 'src/common/**/*.tpl.html' ],

    html: [ 'src/index.html' ],
    sass: 'src/sass/main.scss'
  },

  /**
   * This is a collection of files used during testing only.
   */
  test_files: {
    js: [
      'vendor/angular-mocks/angular-mocks.js'
    ]
  },

  /**
   * This is the same as `app_files`, except it contains patterns that
   * reference vendor code (`vendor/`) that we need to place into the build
   * process somewhere. While the `app_files` property ensures all
   * standardized files are collected for compilation, it is the user's job
   * to ensure non-standardized (i.e. vendor-related) files are handled
   * appropriately in `vendor_files.js`.
   *
   * The `vendor_files.js` property holds files to be automatically
   * concatenated and minified with our project source files.
   *
   * The `vendor_files.css` property holds any CSS files to be automatically
   * included in our app.
   *
   * The `vendor_files.assets` property holds any assets to be copied along
   * with our app's assets. This structure is flattened, so it is not
   * recommended that you use wildcards.
   */
  vendor_files: {
    js: [
      'vendor/angular/angular.js',
      'vendor/angular-bootstrap/ui-bootstrap.min.js',
      'vendor/angular-bootstrap/ui-bootstrap-tpls.min.js',
      'vendor/angular-moment/angular-moment.min.js',
      'vendor/angular-swipe/dist/angular-swipe.min.js',
      'vendor/angular-touch/angular-touch.min.js',
      'vendor/angular-touch/angular-touch.min.js.map',
      'vendor/angular-ui-router/release/angular-ui-router.js',
      'vendor/angular-ui-utils/modules/route/route.js',
      'vendor/bower-angular-placeholders/angular-placeholders.js',
      'vendor/hamsterjs/hamster.js',
      'vendor/moment/moment.js',
      'vendor/lodash/dist/lodash.js',
      'vendor/ng-file-upload/angular-file-upload.js',
      'vendor/ng-file-upload/angular-file-upload-shim.js',
      'vendor/ngInfiniteScroll/build/ng-infinite-scroll.js',
      'vendor/ngstorage/ngStorage.js',
      'vendor/restangular/dist/restangular.js'
    ],
    css: [
    ],
    assets: [
      'vendor/sass-bootstrap/dist/fonts/glyphicons-halflings-regular.eot',
      'vendor/sass-bootstrap/dist/fonts/glyphicons-halflings-regular.svg',
      'vendor/sass-bootstrap/dist/fonts/glyphicons-halflings-regular.ttf',
      'vendor/sass-bootstrap/dist/fonts/glyphicons-halflings-regular.woff'
    ]
  },

  /*
   * A list of all the files that we could potentially update regardint the style guide
  */

  styleguide_files: [
    'style-guide/source/**/*.mustache',
    'style-guide/source/**/*.json',
    'style-guide/source/**/*.js',
    'style-guide/source/**/*.scss',
    'style-guide/source/**/*.png',
    'style-guide/source/**/*.jpg',
    'style-guide/source/**/*.gif'
  ]
};
