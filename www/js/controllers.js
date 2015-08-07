angular.module('starter.controllers', [])

    .controller('DashCtrl', function ($scope, StorageService, $ionicLoading) {

    })

    .controller('ChatsCtrl', function ($scope, Chats, ChatDialogService, $rootScope) {
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

        $scope.openChatDialog = function(chat) {

           // $rootScope.$emit('load-single-chat', {chatId: chatId});
            currentChat = chat;
            ChatDialogService.init('templates/chat-detail.html', $scope).then(
                function(modal) {
                    modal.show();
                });
        };
    })

    .controller('ChatDetailCtrl', function ($scope, $stateParams, Chats, StorageService, $rootScope, $ionicScrollDelegate) {

        $scope.chat = currentChat;

        $scope.typingMessage = '';
        var toJID = $scope.chat.from + '@' + interfaceAddress;
        $scope.messages = [];

        $rootScope.$on('receive-new-message', function(event, data) {

            console.debug('I get a event' + data.message);
            var message = JSON.parse(data.message);
            if (message) {
                $scope.messages.push(message);
                $scope.$apply();

                $ionicScrollDelegate.scrollBottom();
            }
        });

        $scope.sendMessage = function(message) {

            var fromJID = StorageService.get('username') + '@' + interfaceAddress;

            $scope.typingMessage = '';

            var reply = $msg({
                to: toJID,
                type: 'chat'
            }).cnode(Strophe.xmlElement('body', message)).up().c('active', {xmlns: "http://jabber.org/protocol/chatstates"});

            connection.send(reply);

            var messageObject = {from: fromJID, content: message, timeString: 'Just Now', type: 'me'};
            $scope.messages.push(messageObject);

            $ionicScrollDelegate.scrollBottom();

        };
    })

    .controller('AccountCtrl', function ($scope, $window, StorageService) {
        $scope.settings = {
            enableFriends: true
        };
        $scope.thePersonWantToBeAdded = '';

        $scope.username = StorageService.get('username');

        $scope.saveConfiguration = function(username) {
            StorageService.set('username', username);
        };

        $scope.sendAddContactRequest = function(name) {
            connection.send($pres({ to: name + '@' + interfaceAddress, type: "subscribe" }));
        };
    });