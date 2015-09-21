/**
 * Created by jerry on 17/8/15.
 */
controllers.controller('ChatDetailCtrl', function ($scope, $stateParams, Chats, StorageService, $rootScope, $ionicScrollDelegate, MessageService, Utils) {
    $scope.messages = [];
    $scope.myAvatar = Utils.getMyAvatar();

    $scope.input = {
        message: ''
    };

    $scope.$watch(function($scope) { return $scope.messages}, function(newValue, oldValue) {
        $ionicScrollDelegate.scrollBottom();
    });

    //var footerBar; // gets set in $ionicView.enter
    //var scroller;
    //var txtInput;
    ////TODO not triggered
    //$scope.$on('$ionicView.enter', function() {
    //    console.log('UserMessages $ionicView.enter');
    //
    //    $timeout(function() {
    //        footerBar = document.body.querySelector('#userMessagesView .bar-footer');
    //        scroller = document.body.querySelector('#userMessagesView .scroll-content');
    //        txtInput = angular.element(footerBar.querySelector('textarea'));
    //    }, 0);
    //});

    $scope.chat = currentChat;

    var jidToSend = $scope.chat.from;

    var toJID = '';
    if (jidToSend) {
        toJID = jidToSend.toString().match("@") ? jidToSend : jidToSend + '@' + interfaceAddress;
        console.debug('sending message to ' + toJID);
        $scope.messages = MessageService.getMessagesFromSingleFriendInLocalStorage($scope.chat.from);

        $scope.$applyAsync();
    }

    $rootScope.$on('receive-new-message', function (event, data) {

        console.debug('Reciving new message in chat dialog ' + data.message);
        var message = JSON.parse(data.message);
        if (message) {
            $scope.messages.push(message);
            $scope.$apply();

            $ionicScrollDelegate.scrollBottom();
        }
    });

    $scope.sendMessage = function (sendMessageForm) {

        switch($scope.type) {
            case 'chat':

                var fromJID = StorageService.get('username') + '@' + interfaceAddress;

                var reply = $msg({
                    to: toJID,
                    type: 'chat'
                }).cnode(Strophe.xmlElement('body', $scope.input.message)).up().c('active', {xmlns: "http://jabber.org/protocol/chatstates"});

                connection.send(reply);

                var messageObject = {from: toJID, to: fromJID, content: $scope.input.message, date: new Date(), type: 'me'};
                $scope.messages.push(messageObject);

                MessageService.saveSingleMessageToLocalStorage(messageObject);

                //var chatlog = {jid: toJID, from: currentUserJid, type: 'chat', content:  $scope.input.message, title: Utils.getJidHeader(toJID), avatar: defaultFriendAvatar};
                //Chats.saveOrUpdateChat(chatlog);

                break;
            case 'groupchat':

                connection.muc.groupchat(toJID, $scope.input.message);
                var messageObject = {from: toJID, to: fromJID, content: $scope.input.message, date: new Date(), type: 'me'};
                $scope.messages.push(messageObject);

                MessageService.saveSingleMessageToLocalStorage(messageObject);
                //var chatlog = {jid: toJID, from: toJID, type: 'groupchat', content:  $scope.input.message, title: Utils.getJidHeader(toJID), avatar: defaultMyAvatar};
                //Chats.saveOrUpdateChat(chatlog);

                break;
            default:
                break;
        }

        $scope.input.message = '';

        $ionicScrollDelegate.scrollBottom();
        keepKeyboardOpen();

    };

    function keepKeyboardOpen() {
        //var txtInput = angular.element('#messageTextArea');
        //txtInput.one('blur', function() {
        //    alert('textarea blur, focus back on it');
        //    txtInput[0].focus();
        //});
    }

    //$scope.$on('taResize', function(e, ta) {
    //    if (!ta) return;
    //
    //    var taHeight = ta[0].offsetHeight;
    //
    //    if (!footerBar) return;
    //
    //    var newFooterHeight = taHeight + 10;
    //    newFooterHeight = (newFooterHeight > 44) ? newFooterHeight : 44;
    //
    //    footerBar.style.height = newFooterHeight + 'px';
    //    scroller.style.bottom = newFooterHeight + 'px';
    //});

    $scope.$on('$destroy', function() {
        $scope.modal.remove();

        console.debug($scope.type);

        $rootScope.$emit('chat-dialog-closed', {jid: $scope.chat.from});
    });

});