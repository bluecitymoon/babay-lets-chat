controllers.controller('InviteMyFriendToRoomCtrl', function ($scope, $ionicHistory, $ionicLoading, $rootScope, $stateParams, StorageService, ChatRoomService, Utils) {

    $scope.goback = function () {
        $ionicHistory.goBack();
    };

    var roomJid = $stateParams.roomjid;
    console.debug('inviting user to the room ' + roomJid);

    $scope.rosters = StorageService.getObject(currentUserJid + '_rosters');

    this.nick = '';

    var successCreateCallback = function(response) {
        console.debug(response);
    };
    var errorCreateCallback = function(response) {
        console.debug(response);
    };

    $scope.selectedJids = [];
    $scope.inviteSelectedFriendToRoom = function() {

        $ionicLoading.show();

        angular.forEach($scope.selectedJids, function(jid) {

            ChatRoomService.singleInvite(jid, roomJid);

        });

        connection.muc.multipleInvites(roomJid, $scope.selectedJids, 'invite-to-group');

        $ionicLoading.hide();

        Utils.alert("已成功发出邀请", function() {
            $scope.goback();
        });
    };
});