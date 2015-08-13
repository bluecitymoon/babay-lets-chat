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

    .controller('ChatDetailCtrl', function ($scope, $stateParams, Chats, StorageService, $rootScope, $ionicScrollDelegate) {

        $scope.input = {
            message: ''//localStorage['userMessage-' + $scope.toUser._id] || ''
        };

        var footerBar; // gets set in $ionicView.enter
        var scroller;
        var txtInput;

        $scope.$on('$ionicView.enter', function() {
            console.log('UserMessages $ionicView.enter');

            $timeout(function() {
                footerBar = document.body.querySelector('#userMessagesView .bar-footer');
                scroller = document.body.querySelector('#userMessagesView .scroll-content');
                txtInput = angular.element(footerBar.querySelector('textarea'));
            }, 0);

            //messageCheckTimer = $interval(function() {
            //    // here you could check for new messages if your app doesn't use push notifications or user disabled them
            //}, 20000);
        });

        $scope.chat = currentChat;

        var jidToSend = $scope.chat.from;

        $scope.typingMessage = '';
        var toJID = '';
        if (jidToSend) {
            toJID = jidToSend.toString().match("@") ? jidToSend : jidToSend + '@' + interfaceAddress;
            console.debug('sending message to ' + toJID);
        }

        $scope.messages = [];

        $rootScope.$on('receive-new-message', function (event, data) {

            console.debug('Reciving new message in chat dialog ' + data.message);
            var message = JSON.parse(data.message);
            if (message) {
                $scope.messages.push(message);
                $scope.$apply();

                $ionicScrollDelegate.scrollBottom();
            }
        });
        //$scope.input.message = '';
        $scope.sendMessage = function (sendMessageForm) {

            var fromJID = StorageService.get('username') + '@' + interfaceAddress;

            $scope.typingMessage = '';

            var reply = $msg({
                to: toJID,
                type: 'chat'
            }).cnode(Strophe.xmlElement('body', $scope.input.message)).up().c('active', {xmlns: "http://jabber.org/protocol/chatstates"});

            connection.send(reply);

            var messageObject = {from: fromJID, content: $scope.input.message, timeString: 'Just Now', type: 'me'};
            $scope.messages.push(messageObject);

            $ionicScrollDelegate.scrollBottom();

        };

        function keepKeyboardOpen() {
            console.log('keepKeyboardOpen');
            txtInput.one('blur', function() {
                console.log('textarea blur, focus back on it');
                txtInput[0].focus();
            });
        }

        $scope.$on('taResize', function(e, ta) {
            console.log('taResize');
            if (!ta) return;

            var taHeight = ta[0].offsetHeight;
            console.log('taHeight: ' + taHeight);

            if (!footerBar) return;

            var newFooterHeight = taHeight + 10;
            newFooterHeight = (newFooterHeight > 44) ? newFooterHeight : 44;

            footerBar.style.height = newFooterHeight + 'px';
            scroller.style.bottom = newFooterHeight + 'px';
        });
    })

    .controller('AccountCtrl', function ($scope, $window, StorageService) {
        $scope.settings = {
            enableFriends: true
        };
        $scope.thePersonWantToBeAdded = '';

        $scope.username = StorageService.get('username');

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
    });