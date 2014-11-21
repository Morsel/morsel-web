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

    html: [ 'src/views/*.hbs' ],
    sass: ['src/sass/main.scss', 'src/sass/error-page.scss']
  },

  /* files just related to our public app */
  public_files: {
    atpl: [ 'src/app/public/**/*.tpl.html' ],
    common: {
      js: [
        'src/common/analytics/ga.js',
        'src/common/analytics/mixpanel.js',
        'src/common/analytics/rollbar.js',
        'src/common/api/feed.js',
        'src/common/api/items.js',
        'src/common/api/keywords.js',
        'src/common/api/morsels.js',
        'src/common/api/places.js',
        'src/common/api/uploads.js',
        'src/common/api/users.js',
        'src/common/api/util.js',
        'src/common/auth/afterLogin.js',
        'src/common/auth/auth.js',
        'src/common/comments/comments.js',
        'src/common/filters/reverse.js',
        'src/common/forms/baseErrors.js',
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
        'src/common/morsels/like.js',
        'src/common/social/facebookApi.js',
        'src/common/social/socialSharing.js',
        'src/common/filters/nameMatch.js',
        'src/common/places/placeList.js',
        'src/common/morsels/morsel.js',
        'src/common/morsels/morselActions.js',
        'src/common/morsels/morselBlock.js',
        'src/common/morsels/morselSummary.js',
        'src/common/text/truncate.js',
        'src/common/user/activityFeed.js',
        'src/common/user/cuisineUsers.js',
        'src/common/user/likeableFeed.js',
        'src/common/user/specialtyUsers.js',
        'src/common/user/userImage.js',
        'src/common/user/userList.js',
        'src/common/user/usersName.js',
        'src/common/util/headerScroll.js',
        'src/common/util/itunesLink.js',
        'src/common/util/viewMore.js'
      ],
      tpl: [
        'src/common/auth/apiError.tpl.html',
        'src/common/comments/comments.tpl.html',
        'src/common/forms/submitBtn.tpl.html',
        'src/common/forms/validatedCheckbox.tpl.html',
        'src/common/forms/validatedInput.tpl.html',
        'src/common/forms/validatedRadio.tpl.html',
        'src/common/forms/validatedSingleCheckbox.tpl.html',
        'src/common/forms/validatedTextarea.tpl.html',
        'src/common/itemActions/itemActionBar.tpl.html',
        'src/common/places/placeList.tpl.html',
        'src/common/social/socialSharing.tpl.html',
        'src/common/morsels/morsel.tpl.html',
        'src/common/morsels/morselActions.tpl.html',
        'src/common/morsels/morselBlock.tpl.html',
        'src/common/morsels/morselSummary.tpl.html',
        'src/common/morsels/morselFeedNav.tpl.html',
        'src/common/user/activityFeed.tpl.html',
        'src/common/user/likeableFeed.tpl.html',
        'src/common/user/userList.tpl.html',
        'src/common/user/userListOverlay.tpl.html',
        'src/common/util/404.tpl.html',
        'src/common/util/viewMore.tpl.html'
      ]
    },
    vendor_files: {
      js: [
        'vendor/angular/angular.js',
        'vendor/angular-bindonce/bindonce.min.js',
        'vendor/angular-bootstrap/ui-bootstrap-tpls.min.js',
        'vendor/angular-local-storage/angular-local-storage.js',
        'vendor/angular-moment/angular-moment.min.js',
        'vendor/angular-sanitize/angular-sanitize.min.js',
        'vendor/angular-scroll/angular-scroll.min.js',
        'vendor/angular-ui-router/release/angular-ui-router.js',
        'vendor/angular-ui-utils/modules/route/route.js',
        'vendor/animationFrame/AnimationFrame.js',
        'vendor/imagesloaded/imagesloaded.pkgd.min.js',
        'vendor/matchMedia/matchMedia.js',
        'vendor/matchMedia/matchMedia.addListener.js',
        'vendor/moment/moment.js',
        'vendor/lodash/dist/lodash.js',
        'vendor/restangular/dist/restangular.js'
      ],
      css: [
      ],
      assets: [
      ]
    }
  },

  /* files just related to our account app */
  account_files: {
    atpl: [ 'src/app/account/**/*.tpl.html' ],
    common: {
      js: [
        'src/common/analytics/ga.js',
        'src/common/analytics/mixpanel.js',
        'src/common/analytics/rollbar.js',
        'src/common/api/keywords.js',
        'src/common/api/places.js',
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
        'src/common/places/addPlace.js',
        'src/common/places/placeList.js',
        'src/common/social/addFacebook.js',
        'src/common/social/addTwitter.js',
        'src/common/social/facebookApi.js',
        'src/common/user/cuisinesSpecialties.js',
        'src/common/user/userImage.js',
        'src/common/user/usersName.js',
        'src/common/util/headerScroll.js'
      ],
      tpl: [
        'src/common/auth/apiError.tpl.html',
        'src/common/forms/checklist.tpl.html',
        'src/common/forms/submitBtn.tpl.html',
        'src/common/forms/validatedCheckbox.tpl.html',
        'src/common/forms/validatedInput.tpl.html',
        'src/common/forms/validatedRadio.tpl.html',
        'src/common/forms/validatedSingleCheckbox.tpl.html',
        'src/common/forms/validatedTextarea.tpl.html',
        'src/common/images/upload.tpl.html',
        'src/common/places/addPlace.tpl.html',
        'src/common/places/placeList.tpl.html',
        'src/common/social/addFacebook.tpl.html',
        'src/common/social/addTwitter.tpl.html',
        'src/common/user/duplicateEmailOverlay.tpl.html',
        'src/common/util/404.tpl.html',
        'src/common/user/cuisinesSpecialties.tpl.html'
      ]
    },
    vendor_files: {
      js: [
        /*upload shim needs to come before angular*/
        'vendor/ng-file-upload/angular-file-upload-shim.min.js',
        'vendor/angular/angular.js',
        'vendor/angular-bindonce/bindonce.min.js',
        'vendor/angular-bootstrap/ui-bootstrap-tpls.min.js',
        'vendor/angular-local-storage/angular-local-storage.js',
        'vendor/angular-moment/angular-moment.min.js',
        'vendor/angular-scroll/angular-scroll.min.js',
        'vendor/angular-ui-router/release/angular-ui-router.js',
        'vendor/angular-ui-utils/modules/route/route.js',
        'vendor/matchMedia/matchMedia.js',
        'vendor/matchMedia/matchMedia.addListener.js',
        'vendor/moment/moment.js',
        'vendor/lodash/dist/lodash.js',
        'vendor/ng-file-upload/angular-file-upload.min.js',
        'vendor/restangular/dist/restangular.js'
      ],
      css: [
      ],
      assets: [
      ]
    }
  },

  /* files just related to our login app */
  login_files: {
    atpl: [ 'src/app/login/**/*.tpl.html' ],
    common: {
      js: [
        'src/common/analytics/ga.js',
        'src/common/analytics/mixpanel.js',
        'src/common/analytics/rollbar.js',
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
        'src/common/social/connectFacebook.js',
        'src/common/social/connectTwitter.js',
        'src/common/social/facebookApi.js',
        'src/common/user/cuisinesSpecialties.js',
        'src/common/user/userImage.js'
      ],
      tpl: [
        'src/common/auth/apiError.tpl.html',
        'src/common/forms/checklist.tpl.html',
        'src/common/forms/submitBtn.tpl.html',
        'src/common/forms/validatedCheckbox.tpl.html',
        'src/common/forms/validatedInput.tpl.html',
        'src/common/forms/validatedRadio.tpl.html',
        'src/common/forms/validatedSingleCheckbox.tpl.html',
        'src/common/forms/validatedTextarea.tpl.html',
        'src/common/images/upload.tpl.html',
        'src/common/user/duplicateEmailOverlay.tpl.html',
        'src/common/util/404.tpl.html',
        'src/common/user/cuisinesSpecialties.tpl.html'
      ]
    },
    vendor_files: {
      js: [
        /*upload shim needs to come before angular*/
        'vendor/ng-file-upload/angular-file-upload-shim.min.js',
        'vendor/angular/angular.js',
        'vendor/angular-bootstrap/ui-bootstrap-tpls.min.js',
        'vendor/angular-local-storage/angular-local-storage.js',
        'vendor/angular-moment/angular-moment.min.js',
        'vendor/angular-scroll/angular-scroll.min.js',
        'vendor/angular-ui-router/release/angular-ui-router.js',
        'vendor/angular-ui-utils/modules/route/route.js',
        'vendor/matchMedia/matchMedia.js',
        'vendor/matchMedia/matchMedia.addListener.js',
        'vendor/moment/moment.js',
        'vendor/lodash/dist/lodash.js',
        'vendor/ng-file-upload/angular-file-upload.min.js',
        'vendor/restangular/dist/restangular.js'
      ],
      css: [
      ],
      assets: [
      ]
    }
  },

  /* files just related to our static app */
  static_files: {
    atpl: [ 'src/app/static/**/*.tpl.html' ],
    common: {
      js: [
        'src/common/analytics/mixpanel.js',
        'src/common/analytics/rollbar.js',
        'src/common/api/uploads.js',
        'src/common/api/users.js',
        'src/common/auth/auth.js',
        'src/common/user/userImage.js',
        'src/common/user/usersName.js',
        'src/common/util/headerScroll.js',
        'src/common/util/itunesLink.js'
      ],
      tpl: [
        'src/common/util/404.tpl.html'
      ]
    },
    vendor_files: {
      js: [
        'vendor/angular/angular.js',
        'vendor/angular-bootstrap/ui-bootstrap-tpls.min.js',
        'vendor/angular-local-storage/angular-local-storage.js',
        'vendor/angular-scroll/angular-scroll.min.js',
        'vendor/matchMedia/matchMedia.js',
        'vendor/matchMedia/matchMedia.addListener.js',
        'vendor/lodash/dist/lodash.js',
        'vendor/restangular/dist/restangular.js'
      ],
      css: [
      ],
      assets: [
      ]
    }
  },

  /* files just related to our add app */
  add_files: {
    atpl: [ 'src/app/add/**/*.tpl.html' ],
    common: {
      js: [
        'src/common/analytics/ga.js',
        'src/common/analytics/mixpanel.js',
        'src/common/analytics/rollbar.js',
        'src/common/api/items.js',
        'src/common/api/morsels.js',
        'src/common/api/places.js',
        'src/common/api/uploads.js',
        'src/common/api/users.js',
        'src/common/auth/auth.js',
        'src/common/filters/reverse.js',
        'src/common/forms/baseErrors.js',
        'src/common/forms/focusMe.js',
        'src/common/forms/formNameFix.js',
        'src/common/forms/handleErrors.js',
        'src/common/forms/submitBtn.js',
        'src/common/forms/validatedElement.js',
        'src/common/images/photoHelpers.js',
        'src/common/images/responsiveImages.js',
        'src/common/images/upload.js',
        'src/common/images/upload_new.js',
        'src/common/places/addPlace.js',
        'src/common/social/facebookApi.js',
        'src/common/user/userImage.js',
        'src/common/user/userList.js',
        'src/common/user/usersName.js',
        'src/common/util/flashDownload.js',
        'src/common/util/headerScroll.js',
        'src/common/util/viewMore.js',
        'src/common/util/xml2json.js'
      ],
      tpl: [
        'src/common/auth/apiError.tpl.html',
        'src/common/forms/submitBtn.tpl.html',
        'src/common/forms/validatedCheckbox.tpl.html',
        'src/common/forms/validatedInput.tpl.html',
        'src/common/forms/validatedRadio.tpl.html',
        'src/common/forms/validatedSingleCheckbox.tpl.html',
        'src/common/forms/validatedTextarea.tpl.html',
        'src/common/images/uploadNew.tpl.html',
        'src/common/places/addPlace.tpl.html',
        'src/common/user/userList.tpl.html',
        'src/common/user/userListOverlay.tpl.html',
        'src/common/util/404.tpl.html',
        'src/common/util/viewMore.tpl.html'
      ]
    },
    vendor_files: {
      js: [
        /*upload shim needs to come before angular*/
        'vendor/ng-file-upload/angular-file-upload-shim.min.js',
        'vendor/angular/angular.js',
        'vendor/angular-bindonce/bindonce.min.js',
        'vendor/angular-bootstrap/ui-bootstrap-tpls.min.js',
        'vendor/angular-local-storage/angular-local-storage.js',
        'vendor/angular-moment/angular-moment.min.js',
        'vendor/angular-sanitize/angular-sanitize.min.js',
        'vendor/angular-scroll/angular-scroll.min.js',
        'vendor/angular-ui-router/release/angular-ui-router.js',
        'vendor/angular-ui-utils/modules/route/route.js',
        'vendor/matchMedia/matchMedia.js',
        'vendor/matchMedia/matchMedia.addListener.js',
        'vendor/moment/moment.js',
        'vendor/lodash/dist/lodash.js',
        'vendor/ng-file-upload/angular-file-upload.min.js',
        'vendor/ng-sortable/dist/ng-sortable.min.js',
        'vendor/restangular/dist/restangular.js'
      ],
      css: [
      ],
      assets: [
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
      'vendor/angular-bindonce/bindonce.min.js',
      'vendor/angular-bootstrap/ui-bootstrap-tpls.min.js',
      'vendor/angular-local-storage/angular-local-storage.js',
      'vendor/angular-moment/angular-moment.min.js',
      'vendor/angular-sanitize/angular-sanitize.min.js',
      'vendor/angular-scroll/angular-scroll.min.js',
      'vendor/angular-ui-router/release/angular-ui-router.js',
      'vendor/angular-ui-utils/modules/route/route.js',
      'vendor/animationFrame/AnimationFrame.js',
      'vendor/imagesloaded/imagesloaded.pkgd.min.js',
      'vendor/matchMedia/matchMedia.js',
      'vendor/matchMedia/matchMedia.addListener.js',
      'vendor/moment/moment.js',
      'vendor/lodash/dist/lodash.js',
      'vendor/ng-file-upload/angular-file-upload.min.js',
      'vendor/ng-file-upload/angular-file-upload-shim.min.js',
      'vendor/ng-sortable/dist/ng-sortable.min.js',
      'vendor/restangular/dist/restangular.js'
    ],
    css: [
    ],
    assets: [
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