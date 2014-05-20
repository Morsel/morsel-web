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

  dev_server_port: '5000',

  /* for storing all the favicons and touch icons and nonsense */
  favicon_dir: '/assets/images/icons/morsel',

  //for any data the server might need
  server_data_dir: 'data',

  //for temp stuff for the initial launch
  static_launch_dir: 'launch',

  //seo files that need to render at root
  seo_dir: 'seo',

  /**
   * This is a collection of file patterns that refer to all of our apps' code (the
   * stuff in `src/`). These file paths are used in the configuration of
   * build tasks. `js` is all project javascript, less tests. `ctpl` contains
   * our reusable components' (`src/common`) template HTML files, while
   * `atpl` contains the same, but for our app's code. `html` is just our
   * main HTML template, `sass` is our main stylesheet, and `unit` contains our
   * app's unit tests.
   */
  app_files: {
    js: [ 'src/**/*.js', '!src/**/*.spec.js', '!src/assets/**/*.js' ],
    jsunit: [ 'src/**/*.spec.js' ],

    atpl: [ 'src/app/**/*.tpl.html' ],
    ctpl: [ 'src/common/**/*.tpl.html' ],

    html: [ 'src/views/*.mustache' ],
    sass: ['src/sass/main.scss', 'src/sass/error-page.scss']
  },

  /* files just related to our public app */
  public_files: {
    atpl: [ 'src/app/public/**/*.tpl.html' ],
    common: {
      js: [
        'src/common/analytics/mixpanel.js',
        'src/common/api/feed.js',
        'src/common/api/items.js',
        'src/common/api/keywords.js',
        'src/common/api/morsels.js',
        'src/common/api/uploads.js',
        'src/common/api/users.js',
        'src/common/auth/afterLogin.js',
        'src/common/auth/auth.js',
        'src/common/comments/comments.js',
        'src/common/filters/reverse.js',
        'src/common/forms/baseErrors.js',
        'src/common/forms/checklist.js',
        'src/common/forms/formNameFix.js',
        'src/common/forms/handleErrors.js',
        'src/common/forms/submitBtn.js',
        'src/common/forms/validatedElement.js',
        'src/common/images/photoHelpers.js',
        'src/common/images/responsiveImages.js',
        'src/common/itemActions/actionBar.js',
        'src/common/itemActions/follow.js',
        'src/common/itemActions/followedUsers.js',
        'src/common/itemActions/followers.js',
        'src/common/itemActions/like.js',
        'src/common/social/socialSharing.js',
        'src/common/swipe/carousel.js',
        'src/common/swipe/immersiveSwipe.js',
        'src/common/swipe/storySwipe.js',
        'src/common/text/textLimit.js',
        'src/common/user/cuisineUsers.js',
        'src/common/user/specialtyUsers.js',
        'src/common/user/userImage.js'
      ],
      tpl: [
        'src/common/auth/apiError.tpl.html',
        'src/common/comments/comments.tpl.html',
        'src/common/forms/checklist.tpl.html',
        'src/common/forms/submitBtn.tpl.html',
        'src/common/forms/validatedCheckbox.tpl.html',
        'src/common/forms/validatedInput.tpl.html',
        'src/common/forms/validatedRadio.tpl.html',
        'src/common/forms/validatedTextarea.tpl.html',
        'src/common/itemActions/itemActionBar.tpl.html',
        'src/common/social/socialSharing.tpl.html',
        'src/common/swipe/itemThumbnails.tpl.html',
        'src/common/text/textLimit.tpl.html',
        'src/common/text/textOverlay.tpl.html',
        'src/common/user/activityFeed.tpl.html',
        'src/common/user/userActivityOverlay.tpl.html',
        'src/common/user/userList.tpl.html'
      ]
    },
    vendor_files: {
      js: [
        'vendor/angular/angular.js',
        'vendor/angular-bootstrap/ui-bootstrap-tpls.min.js',
        /*'vendor/angular-carousel/dist/angular-carousel.min.js',*///until I figure out how to turn off conditionally
        'vendor/angular-moment/angular-moment.min.js',
        'vendor/angular-swipe/dist/angular-swipe.min.js',
        'vendor/angular-touch/angular-touch.js',
        'vendor/angular-ui-router/release/angular-ui-router.js',
        'vendor/angular-ui-utils/modules/route/route.js',
        'vendor/animationFrame/AnimationFrame.js',
        'vendor/hamsterjs/hamster.js',
        'vendor/moment/moment.js',
        'vendor/lodash/dist/lodash.js',
        'vendor/ng-file-upload/angular-file-upload.js',
        'vendor/ng-file-upload/angular-file-upload-shim.js',
        'vendor/ngstorage/ngStorage.js',
        'vendor/restangular/dist/restangular.js'
      ],
      css: [
        'vendor/angular-carousel/dist/angular-carousel.min.css'
      ],
      assets: [
        'vendor/sass-bootstrap/dist/fonts/glyphicons-halflings-regular.eot',
        'vendor/sass-bootstrap/dist/fonts/glyphicons-halflings-regular.svg',
        'vendor/sass-bootstrap/dist/fonts/glyphicons-halflings-regular.ttf',
        'vendor/sass-bootstrap/dist/fonts/glyphicons-halflings-regular.woff'
      ]
    }
  },

  /* files just related to our account app */
  account_files: {
    atpl: [ 'src/app/account/**/*.tpl.html' ],
    common: {
      js: [
        'src/common/analytics/mixpanel.js',
        'src/common/api/keywords.js',
        'src/common/api/uploads.js',
        'src/common/api/users.js',
        'src/common/auth/afterLogin.js',
        'src/common/auth/auth.js',
        'src/common/forms/baseErrors.js',
        'src/common/forms/checklist.js',
        'src/common/forms/formNameFix.js',
        'src/common/forms/handleErrors.js',
        'src/common/forms/submitBtn.js',
        'src/common/forms/validatedElement.js',
        'src/common/images/photoHelpers.js',
        'src/common/images/upload.js',
        'src/common/user/userImage.js'
      ],
      tpl: [
        'src/common/auth/apiError.tpl.html',
        'src/common/forms/checklist.tpl.html',
        'src/common/forms/submitBtn.tpl.html',
        'src/common/forms/validatedCheckbox.tpl.html',
        'src/common/forms/validatedInput.tpl.html',
        'src/common/forms/validatedRadio.tpl.html',
        'src/common/forms/validatedTextarea.tpl.html',
        'src/common/images/upload.tpl.html',
        'src/common/user/duplicateEmailOverlay.tpl.html'
      ]
    },
    vendor_files: {
      js: [
        'vendor/angular/angular.js',
        'vendor/angular-bootstrap/ui-bootstrap-tpls.min.js',
        'vendor/angular-moment/angular-moment.min.js',
        'vendor/angular-touch/angular-touch.js',
        'vendor/angular-ui-router/release/angular-ui-router.js',
        'vendor/angular-ui-utils/modules/route/route.js',
        'vendor/moment/moment.js',
        'vendor/lodash/dist/lodash.js',
        'vendor/ng-file-upload/angular-file-upload.js',
        'vendor/ng-file-upload/angular-file-upload-shim.js',
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
    }
  },

  /* files just related to our login app */
  login_files: {
    atpl: [ 'src/app/login/**/*.tpl.html' ],
    common: {
      js: [
        'src/common/analytics/mixpanel.js',
        'src/common/api/uploads.js',
        'src/common/api/users.js',
        'src/common/auth/afterLogin.js',
        'src/common/auth/auth.js',
        'src/common/forms/baseErrors.js',
        'src/common/forms/formNameFix.js',
        'src/common/forms/handleErrors.js',
        'src/common/forms/submitBtn.js',
        'src/common/forms/validatedElement.js',
        'src/common/images/photoHelpers.js',
        'src/common/images/upload.js',
        'src/common/social/connectFacebook.js',
        'src/common/user/userImage.js'
      ],
      tpl: [
        'src/common/auth/apiError.tpl.html',
        'src/common/forms/submitBtn.tpl.html',
        'src/common/forms/validatedCheckbox.tpl.html',
        'src/common/forms/validatedInput.tpl.html',
        'src/common/forms/validatedRadio.tpl.html',
        'src/common/forms/validatedTextarea.tpl.html',
        'src/common/images/upload.tpl.html',
        'src/common/user/duplicateEmailOverlay.tpl.html'
      ]
    },
    vendor_files: {
      js: [
        'vendor/angular/angular.js',
        'vendor/angular-bootstrap/ui-bootstrap-tpls.min.js',
        'vendor/angular-moment/angular-moment.min.js',
        'vendor/angular-touch/angular-touch.js',
        'vendor/angular-ui-router/release/angular-ui-router.js',
        'vendor/angular-ui-utils/modules/route/route.js',
        'vendor/moment/moment.js',
        'vendor/lodash/dist/lodash.js',
        'vendor/ng-file-upload/angular-file-upload.js',
        'vendor/ng-file-upload/angular-file-upload-shim.js',
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
    }
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
      'vendor/angular-bootstrap/ui-bootstrap-tpls.min.js',
      /*'vendor/angular-carousel/dist/angular-carousel.min.js',*///until I figure out how to turn off conditionally
      'vendor/angular-moment/angular-moment.min.js',
      'vendor/angular-swipe/dist/angular-swipe.min.js',
      'vendor/angular-touch/angular-touch.js',
      'vendor/angular-ui-router/release/angular-ui-router.js',
      'vendor/angular-ui-utils/modules/route/route.js',
      'vendor/animationFrame/AnimationFrame.js',
      'vendor/hamsterjs/hamster.js',
      'vendor/moment/moment.js',
      'vendor/lodash/dist/lodash.js',
      'vendor/ng-file-upload/angular-file-upload.js',
      'vendor/ng-file-upload/angular-file-upload-shim.js',
      'vendor/ngstorage/ngStorage.js',
      'vendor/restangular/dist/restangular.js'
    ],
    css: [
      'vendor/angular-carousel/dist/angular-carousel.min.css'
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