var controllers = angular.module('starter.controllers', []);

controllers.controller('ChatsCtrl', function ($scope, Chats, ChatDialogService, $rootScope, Utils, StorageService) {
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    $scope.cleanupChatHistory = function() {
        var localchats = StorageService.getArray("localchats");
        angular.forEach(localchats, function(chat, i) {

            try {

                if(chat.type == 'chat' || chat.type == 'groupchat') {

                }
            } catch(e) {
                //ignore it
            }
        });

    };

    $scope.chats = Chats.loadAllLocalChats();
    $rootScope.$on('chats-changed', function() {
        $scope.chats = Chats.loadAllLocalChats();

        $scope.$applyAsync();
    });

    $scope.remove = function (chat) {
        Chats.remove(chat);
    };

    $scope.openChatDialog = function(roster) {

        if (roster.type && roster.type != 'info') {

            currentChat = {name: roster.name, from: Utils.getFullJid(roster.jid)};
            ChatDialogService.init('templates/chat-detail.html', roster.type, $scope).then(
                function (modal) {
                    modal.show();
                });
        }
    };

    $scope.removeSingleChat = function(chat) {

        $scope.chats = Chats.removeSingleChat(chat);

        $rootScope.$emit('chats-changed');

    };
})
    .controller('AccountCtrl', function ($scope, $window, StorageService, $state, $ionicHistory) {

        $scope.username = StorageService.get('username');
        $scope.roomname = '';

        $scope.saveConfiguration = function (username) {
            StorageService.set('username', username);
        };

        $scope.goToPosts = function() {
            $state.go('posts');
        };

        $scope.goback = function() {
            $ionicHistory.goBack();
        };

    })

    .controller('NavigationCtrl', function ($scope, $state) {

        $scope.goToPosts = function() {
            $state.go('posts');
        };

        $scope.gotoSetting = function() {
            $state.go('settings');
        };

    });