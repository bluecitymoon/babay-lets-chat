/**
 * Created by jerry on 17/8/15.
 */

controllers.controller('ChatDetailCtrl', function ($scope, $stateParams, Chats, StorageService, $rootScope, $ionicScrollDelegate) {

    $scope.input = {
        message: ''
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
    });

    $scope.chat = currentChat;

    var jidToSend = $scope.chat.from;

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

    $scope.sendMessage = function (sendMessageForm) {

        switch($scope.type) {
            case 'single':

                var fromJID = StorageService.get('username') + '@' + interfaceAddress;

                var reply = $msg({
                    to: toJID,
                    type: 'chat'
                }).cnode(Strophe.xmlElement('body', $scope.input.message)).up().c('active', {xmlns: "http://jabber.org/protocol/chatstates"});

                connection.send(reply);

                var messageObject = {from: fromJID, content: $scope.input.message, timeString: new Date(), type: 'me'};
                $scope.messages.push(messageObject);

                break;
            case 'room':

                connection.muc.groupchat(toJID, $scope.input.message);
                var messageObject = {from: fromJID, content: $scope.input.message, timeString: new Date(), type: 'me'};
                $scope.messages.push(messageObject);

                break;
            default:
                break;
        }

        $scope.input.message = '';

        $ionicScrollDelegate.scrollBottom();

    };

    function keepKeyboardOpen() {
        alert('keepKeyboardOpen');
        txtInput.one('blur', function() {
            alert('textarea blur, focus back on it');
            txtInput[0].focus();
        });
    }

    $scope.$on('taResize', function(e, ta) {
        if (!ta) return;

        var taHeight = ta[0].offsetHeight;

        if (!footerBar) return;

        var newFooterHeight = taHeight + 10;
        newFooterHeight = (newFooterHeight > 44) ? newFooterHeight : 44;

        footerBar.style.height = newFooterHeight + 'px';
        scroller.style.bottom = newFooterHeight + 'px';
    });

    $scope.$on('$destroy', function() {
        $scope.modal.remove();
        console.debug('close dialog');

        console.debug($scope.type);
    });

});