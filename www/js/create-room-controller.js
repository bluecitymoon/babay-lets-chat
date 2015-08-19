controllers.controller('CreateRoomCtrl', function ($scope, $ionicHistory, $ionicLoading, $rootScope) {

    $scope.goback = function () {
        $ionicHistory.goBack();
    };

    this.room = '';
    this.nick = '';

    var successCreateCallback = function(response) {
        console.debug(response);
    };
    var errorCreateCallback = function(response) {
        console.debug(response);
    };

    $scope.create = function () {

        console.debug('Getting room name ' + this.room);

        if (this.room) {

            console.debug('creating chat room ' + this.room);

            var d = $pres({"from": currentUserFullJid, "to": this.room + "@" + groupChatServiceName + "/" + currentUserJid})
                .c("x", {"xmlns": "http://jabber.org/protocol/muc"});
            connection.send(d.tree());
            var configuration = {"muc#roomconfig_publicroom": "0", "muc#roomconfig_persistentroom": "1"};
            connection.muc.createConfiguredRoom(this.room + "@" + groupChatServiceName, configuration, successCreateCallback, errorCreateCallback);

            $rootScope.$emit('reload-rooms');

            $scope.goback();
        }
    };

});