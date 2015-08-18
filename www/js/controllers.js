var controllers = angular.module('starter.controllers', []);

controllers.controller('ChatsCtrl', function ($scope, Chats, ChatDialogService, $rootScope) {
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    $scope.chats = Chats.all();
    $scope.remove = function (chat) {
        Chats.remove(chat);
    };

    $scope.openChatDialog = function (chat) {

        // $rootScope.$emit('load-single-chat', {chatId: chatId});
        currentChat = chat;
        ChatDialogService.init('templates/chat-detail.html', $scope).then(
            function (modal) {
                modal.show();
            });
    };
})
    .controller('AccountCtrl', function ($scope, $window, StorageService) {
        $scope.settings = {
            enableFriends: true
        };
        $scope.thePersonWantToBeAdded = '';

        $scope.username = StorageService.get('username');
        $scope.roomname = '';

        $scope.saveConfiguration = function (username) {
            StorageService.set('username', username);
        };

        $scope.sendAddContactRequest = function (name) {

            var jid = name + '@' + interfaceAddress;
            //connection.roster.authorize(jid, 'Hello I want add you');
            connection.roster.add(jid, 'Jerry', ['Friends'], function (data) {
                alert(JSON.stringify(data));
            });
            //connection.send($pres({ to: name + '@' + interfaceAddress, type: "subscribe" }));
            //connection.update(jid, 'Jerry', '同事');
        };

        var successCreateCallback = function(response) {
            console.debug('create room successfully ' + JSON.stringify(response));
        };
        var errorCreateCallback = function(response) {
            console.debug('create room failed ' + JSON.stringify(response));
        };

        $scope.createChatRoom = function(roomname) {
            console.debug('creating chat room ' + roomname);
            var d = $pres({"from": currentUserFullJid, "to": roomname  + "@test.192.168.0.122/" + currentUserJid})
                    .c("x",{"xmlns":"http://jabber.org/protocol/muc"});
            connection.send(d.tree());
            var configuration = {"muc#roomconfig_publicroom": "0", "muc#roomconfig_persistentroom": "1"};
            connection.muc.createConfiguredRoom(roomname + '@test.192.168.0.122', configuration, successCreateCallback, errorCreateCallback);
        };

        $scope.listRooms = function () {

            connection.muc.listRooms('test.192.168.0.122', function (stanza) {
                var rooms = stanza.getElementsByTagName('item');
                angular.forEach(rooms, function(value, index) {

                    var room = {
                        jid: value.getAttribute('jid'),
                        name: value.getAttribute('name'),
                        avatar: 'img/group-avatar.jpg'
                    };
                });
                console.debug(JSON.stringify(rooms));

            }, function () {
            });
        };
    });