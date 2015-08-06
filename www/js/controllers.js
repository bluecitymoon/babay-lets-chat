angular.module('starter.controllers', [])

    .controller('DashCtrl', function ($scope, StorageService, $ionicLoading) {

    })

    .controller('ChatsCtrl', function ($scope, Chats) {
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
    })

    .controller('ChatDetailCtrl', function ($scope, $stateParams, Chats, StorageService) {

        $scope.chat = Chats.get($stateParams.chatId);

        $scope.typingMessage = '';

        $scope.messages = [];
        $scope.sendMessage = function(message) {
            var toJID = $scope.chat.from + '@192.168.0.116';
            var fromJID = StorageService.get('username') + '@192.168.0.116';

            $scope.typingMessage = '';

            var reply = $msg({
                to: toJID,
                type: 'chat'
            }).cnode(Strophe.xmlElement('body', message)).up().c('active', {xmlns: "http://jabber.org/protocol/chatstates"});

            connection.send(reply);

            var messageObject = {message: message, chatId: $stateParams.chatId, type: 'me'};
            $scope.messages.push(messageObject);
        };
    })

    .controller('AccountCtrl', function ($scope, $window, StorageService) {
        $scope.settings = {
            enableFriends: true
        };

        $scope.username = StorageService.get('username');

        $scope.saveConfiguration = function(username) {
            StorageService.set('username', username);
        }
    });
