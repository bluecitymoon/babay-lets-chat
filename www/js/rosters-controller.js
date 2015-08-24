controllers.controller('RosterCtrl', function ($scope, StorageService, $ionicLoading, $rootScope, $ionicModal, ChatDialogService, $state, $ionicActionSheet) {

    $scope.$on('$ionicView.enter', function() {
        console.log('UserMessages $ionicView.enter');
        $scope.rooms = StorageService.getArray(currentUserJid + '_' + 'rooms');

    });

    $scope.rosters = [];

    $scope.rooms = [];

    $rootScope.$on('roster-loaded', function(event, data) {

        $scope.rosters = data.roster;

        $scope.$apply();

        StorageService.setObject('rosters', $scope.rosters);

    });

    $rootScope.$on('rooms-loaded', function(e, data) {
        $scope.rooms = data.rooms;

        $scope.$apply();

    });

    $rootScope.$on('chat-dialog-closed', function(e, data) {
        var jid = data.jid;
        ChatDialogService.clearUnreadCount($scope.rosters, jid);
    });

    $rootScope.$on('receive-new-message', function (event, data) {
        var message = JSON.parse(data.message);

        console.debug('recieve new message in rosters page ' + data.message);

        if(message) {
            var jid = message.from;
            var splittedElements = jid.split('/');
            var fullJid = splittedElements[0];

            ChatDialogService.updateUnreadCount($scope.rosters, $scope.rooms, fullJid);

            $scope.$apply();
        }
    });

    $scope.popupAddingContactTypeDialog = function() {

        $ionicActionSheet.show({
            buttons: [
                {text: '添加好友'},
                {text: '加入房间'},
                {text: '创建房间'}
            ],
            titleText: '选择操作类型',
            cancelText: '取消',
            cancel: function () {
            },
            buttonClicked: function (index, value) {
                console.debug(index);

                switch (index) {
                    case 0:
                        $state.go('add-new-roster');
                        break;
                    case 2:

                        $state.go('create-my-room');
                        break;

                    default: break;

                }
                return true;
            }
        });
    };

    $scope.removeSingleRoster = function(jid) {

        connection.roster.remove(jid, function(data) {
            alert(JSON.stringify(data));
        });

        $rootScope.$emit('reload-roster');
    };

    $scope.openChatDialog = function(roster, chatType) {

        currentChat = {name: roster.name, from: roster.jid};
        ChatDialogService.init('templates/chat-detail.html', chatType, $scope).then(
            function(modal) {
                modal.show();
        });
    };

    $scope.goInviteMyFriendPage = function(roomJid) {

        $state.go('invite-to-room', {roomjid: roomJid});
    };
});