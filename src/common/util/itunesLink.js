angular.module( 'Morsel.common.iTunesLink', [] )

.directive('mrslItunesLink', function () {
  return {
    replace: true,
    template: '<a href="http://mrsl.co/app_download_site" target="_blank" class="itunes-link"><img src="/assets/images/utility/Download_on_the_App_Store_Badge_US-UK_135x40.svg" /></a>'
  };
});