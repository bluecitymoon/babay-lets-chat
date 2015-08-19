controllers.controller('InviteMyFriendToRoomCtrl', function ($scope, $ionicHistory, $ionicLoading, $rootScope, $stateParams, StorageService) {

    $scope.goback = function () {
        $ionicHistory.goBack();
    };

    var roomJid = $stateParams.roomjid;
    console.debug('inviting user to the room ' + roomJid);

    $scope.rosters = StorageService.getObject('rosters');

    this.nick = '';

    var successCreateCallback = function(response) {
        console.debug(response);
    };
    var errorCreateCallback = function(response) {
        console.debug(response);
    };
});