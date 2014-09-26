angular.module( 'Morsel.common.flashDownload', [] )

.directive('mrslFlashDownload', function () {
  return {
    replace: true,
    template: '<a href="http://www.adobe.com/go/getflashplayer" target="_blank" border="0"><img src="/assets/images/utility/160x41_Get_Flash_Player.jpg" alt="Download Flash" /></a>'
  };
});