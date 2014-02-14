angular.module('templates-app', ['about/about.tpl.html', 'add-morsel/add-morsel.tpl.html', 'dashboard/dashboard.tpl.html', 'feed/feed.tpl.html', 'feed/post/morsel/morsel.tpl.html', 'feed/post/post.tpl.html', 'home/home.tpl.html', 'join/join.tpl.html', 'login/login.tpl.html', 'myfeed/myfeed.tpl.html', 'post-detail/post-detail.tpl.html', 'profile/profile.tpl.html']);

angular.module("about/about.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("about/about.tpl.html",
    "<div class=\"row-fluid\">\n" +
    "  <h1 class=\"page-header\">\n" +
    "    About Morsel!!!!\n" +
    "  </h1>\n" +
    "</div>\n" +
    "\n" +
    "");
}]);

angular.module("add-morsel/add-morsel.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("add-morsel/add-morsel.tpl.html",
    "<form name=\"form\" method=\"post\" ng-submit=\"submit()\" novalidate>\n" +
    "  <div ng-repeat=\"(inputName, inputErrors) in serverErrors\">\n" +
    "    <p ng-repeat=\"inputError in inputErrors\">{{inputName}} {{inputError}}</p>\n" +
    "  </div>\n" +
    "\n" +
    "  <label for=\"description\">Description</label>\n" +
    "  <input type=\"text\" id=\"description\" placeholder=\"This is a description of my morsel\" ng-model=\"description\" autofocus />\n" +
    "\n" +
    "  <label for=\"photo\">Photo</label>\n" +
    "  <input type=\"file\" id=\"photo\" ng-file-select=\"onFileSelect($files)\">\n" +
    "\n" +
    "  <input type=\"submit\" value=\"Add Morsel\" ng-disabled=\"form.$invalid\"  />\n" +
    "</form>\n" +
    "\n" +
    "<div class=\"upload-div\">\n" +
    "  <div ng-show=\"dropSupported\" class=\"drop-box\" ng-file-drop=\"onFileSelect($files);\" ng-file-drop-available=\"dropSupported=true\" style=\"height:200px;width:200px;background-color:gray\">or drop files here</div>\n" +
    "  <div ng-show=\"!dropSupported\">HTML5 Drop File is not supported on this browser</div>\n" +
    "\n" +
    "  <div ng-show=\"selectedFile != null\">\n" +
    "    <div class=\"sel-file\" >\n" +
    "      <img ng-show=\"dataUrl\" ng-src=\"{{dataUrl}}\">\n" +
    "      <span class=\"progress\" ng-show=\"progress >= 0\">           \n" +
    "        <div style=\"width:{{progress}}%\">{{progress}}%</div>\n" +
    "      </span>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>");
}]);

angular.module("dashboard/dashboard.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("dashboard/dashboard.tpl.html",
    "<h1>This is a user's dashboard</h1>\n" +
    "\n" +
    "");
}]);

angular.module("feed/feed.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("feed/feed.tpl.html",
    "<li ng-repeat=\"post in posts\" class=\"post\">\n" +
    "  <div post=\"post\"></div>\n" +
    "</li>");
}]);

angular.module("feed/post/morsel/morsel.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("feed/post/morsel/morsel.tpl.html",
    "<div bg-image=\"{{morsel.photos._640x640}}\" class=\"bg-image\">\n" +
    "  <i morsel-like></i>\n" +
    "  <p class=\"morsel-description\">{{morsel.description}}</p>\n" +
    "</div>");
}]);

angular.module("feed/post/post.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("feed/post/post.tpl.html",
    "<h3 class=\"post-title\">title: {{post.title}}</h3>\n" +
    "<div user-image username=\"post.creator.username\" user-photos=\"post.creator.photos\" class=\"profile-pic-l\"></div>\n" +
    "<div class=\"morsels\" ng-click=\"showPostDetails()\">\n" +
    "  <div ng-repeat=\"morsel in post.morsels\" class=\"morsel\">\n" +
    "    <div morsel=\"morsel\"></div>\n" +
    "  </div>\n" +
    "</div>");
}]);

angular.module("home/home.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("home/home.tpl.html",
    "<div class=\"home-page\">\n" +
    "  <h1>Welcome to Morsel {{welcomeUserName}}</h1>\n" +
    "</div>\n" +
    "");
}]);

angular.module("join/join.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("join/join.tpl.html",
    "<form name=\"form\" method=\"post\" ng-submit=\"join()\" novalidate>\n" +
    "  <div ng-repeat=\"(inputName, inputErrors) in serverErrors\">\n" +
    "    <p ng-repeat=\"inputError in inputErrors\">{{inputName}} {{inputError}}</p>\n" +
    "  </div>\n" +
    "\n" +
    "  <label for=\"first-name\">First Name</label>\n" +
    "  <input type=\"text\" name=\"first_name\" id=\"first-name\" placeholder=\"John\" ng-model=\"first_name\" autofocus />\n" +
    "\n" +
    "  <label for=\"last-name\">Last Name</label>\n" +
    "  <input type=\"text\" name=\"last_name\" id=\"last-name\" placeholder=\"Smith\" ng-model=\"last_name\" />\n" +
    "\n" +
    "  <label for=\"title\">Title</label>\n" +
    "  <input type=\"text\" name=\"title\" id=\"title\" placeholder=\"Executive Chef at McDonalds\" ng-model=\"title\" />\n" +
    "\n" +
    "    <label for=\"username\">Username</label>\n" +
    "  <input type=\"text\" name=\"username\" id=\"username\" placeholder=\"slimychef923\" ng-model=\"username\" />\n" +
    "\n" +
    "  <label for=\"email\">Email</label>\n" +
    "  <input type=\"email\" ng-model=\"email\" name=\"email\" id=\"email\" placeholder=\"Email\" required />\n" +
    "  <span ng-show=\"form.email.$dirty && form.email.$error.email\">Email is invalid</span>\n" +
    "\n" +
    "  <label for=\"password\">Password</label>\n" +
    "  <input type=\"password\" name=\"password\" id=\"password\" ng-model=\"password\" required match=\"verification\" />\n" +
    "  <span ng-show=\"form.password.$dirty && form.password.$error.required\">Please enter a password</span>\n" +
    "\n" +
    "  <label for=\"verification\">Repeat password</label>\n" +
    "  <input type=\"password\" name=\"verification\" id=\"verification\" ng-model=\"verification\" required match=\"password\" />\n" +
    "  <span ng-show=\"form.verification.$dirty && form.verification.$error.required\">Please repeat your password</span>\n" +
    "  <span ng-show=\"form.verification.$dirty && form.verification.$error.match && !form.verification.$error.required\">Passwords don't match</span>\n" +
    "\n" +
    "  <label for=\"bio\">Bio</label>\n" +
    "  <textarea ng-model=\"bio\" name=\"bio\" id=\"bio\" placeholder=\"Tell us a little about yourself\"></textarea>\n" +
    "\n" +
    "  <label for=\"photo\">Photo</label>\n" +
    "  <input type=\"file\" id=\"photo\" ng-file-select=\"onFileSelect($files)\">\n" +
    "\n" +
    "  <input type=\"submit\" value=\"Sign up\" ng-disabled=\"form.$invalid\"  />\n" +
    "</form>\n" +
    "\n" +
    "<div class=\"upload-div\">\n" +
    "  <div ng-show=\"dropSupported\" class=\"drop-box\" ng-file-drop=\"onFileSelect($files);\" ng-file-drop-available=\"dropSupported=true\" style=\"height:200px;width:200px;background-color:gray\">or drop files here</div>\n" +
    "  <div ng-show=\"!dropSupported\">HTML5 Drop File is not supported on this browser</div>\n" +
    "\n" +
    "  <div ng-show=\"selectedFile != null\">\n" +
    "    <div class=\"sel-file\" >\n" +
    "      <img ng-show=\"dataUrl\" ng-src=\"{{dataUrl}}\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>");
}]);

angular.module("login/login.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("login/login.tpl.html",
    "<form name=\"form\" method=\"post\" ng-controller=\"LoginCtrl\" ng-submit=\"login()\" novalidate>\n" +
    "  <span ng-repeat=\"serverError in serverErrors\">{{serverError.msg}}</span>\n" +
    "\n" +
    "  <label for=\"email\">Email</label>\n" +
    "  <input type=\"email\" ng-model=\"email\" name=\"email\" id=\"email\" placeholder=\"Email\" required />\n" +
    "  <span ng-show=\"form.email.$dirty && form.email.$error.email\">Email is invalid</span>\n" +
    "\n" +
    "  <label for=\"password\">Password</label>\n" +
    "  <input type=\"password\" name=\"password\" id=\"password\" ng-model=\"password\" required />\n" +
    "  <span ng-show=\"form.password.$dirty && form.password.$error.required\">Please enter a password</span>\n" +
    "\n" +
    "  <input type=\"submit\" value=\"Log In\" ng-disabled=\"form.$invalid\" />\n" +
    "</form>");
}]);

angular.module("myfeed/myfeed.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("myfeed/myfeed.tpl.html",
    "<div>\n" +
    "  <h1>{{welcomeUserName}}'s feed</h1>\n" +
    "  <ul feed posts=\"posts\" class=\"feed\"></ul>\n" +
    "</div>\n" +
    "");
}]);

angular.module("post-detail/post-detail.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("post-detail/post-detail.tpl.html",
    "<div morsel-swipe=\"{{post.morsels.length > 1}}\" morsel-swipe-index=\"{{postMorselNumber}}\" class=\"post-detail\">\n" +
    "  <div class=\"post-header\">\n" +
    "    <div class=\"container\">\n" +
    "      <h1>{{post.title}}</h1>\n" +
    "      <morselIndicatorTop></morselIndicatorTop>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <div class=\"container post-container\">\n" +
    "    <div class=\"post-info\">\n" +
    "      <h1>{{post.title}}</h1>\n" +
    "      <div class=\"user-info user-info-xs\">\n" +
    "        <div user-image username=\"post.creator.username\" user-photos=\"post.creator.photos\" class=\"profile-pic-xs\"></div>\n" +
    "        <div>\n" +
    "          <h2>{{post.creator.first_name}} {{post.creator.last_name}}</h2>\n" +
    "          <morselPostedAt></morselPostedAt>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "    <div class=\"morsels-wrap\">\n" +
    "      <morselControls></morselControls>\n" +
    "      <morselIndicatorBottom></morselIndicatorBottom>\n" +
    "      <ul morsels class=\"morsels\">\n" +
    "        <li ng-repeat=\"morsel in post.morsels | orderBy:'sort_order'\" class=\"morsel\">\n" +
    "          <i morsel-like></i>\n" +
    "          <div ng-if=\"morsel.photos\" class=\"morsel-img\" href=\"{{morsel.photos._640x640}}\" style=\"background-image: url({{morsel.photos._640x640}});\"></div>\n" +
    "          <div ng-if=\"morsel.description\" ng-class=\"{'morsel-content': true, 'text-morsel': !morsel.photos }\">\n" +
    "            <p>{{morsel.description}}</p>\n" +
    "          </div>\n" +
    "        </li>\n" +
    "      </ul>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <div class=\"blur-bg\" style=\"background-image: url(https://morsel-staging.s3.amazonaws.com/morsel-photos/17/_640x640_3f39252d-656a-4670-8e19-ae1f8409c285.jpg);\"></div>\n" +
    "</div>");
}]);

angular.module("profile/profile.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("profile/profile.tpl.html",
    "<div class=\"profile\">\n" +
    "  <div class=\"user-info\">\n" +
    "    <div user-image username=\"user.username\" user-photos=\"user.photos\" class=\"profile-pic-m\"></div>\n" +
    "    <div>\n" +
    "      <h1>{{user.first_name}} {{user.last_name}}</h1>\n" +
    "      <span><i class=\"glyphicon glyphicon-heart\"></i>{{user.like_count}}</span>\n" +
    "      <span><i class=\"morsel-icon\"></i>{{user.morsel_count}}</span>\n" +
    "      <p>{{user.bio}}</p>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <ul feed posts=\"user.posts\" class=\"feed\"></ul>\n" +
    "</div>");
}]);
