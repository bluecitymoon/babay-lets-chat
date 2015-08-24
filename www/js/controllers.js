var controllers = angular.module('starter.controllers', []);

controllers.controller('ChatsCtrl', function ($scope, Chats, ChatDialogService, $rootScope) {
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    $scope.chats = Chats.loadAllLocalChats();

    $scope.remove = function (chat) {
        Chats.remove(chat);
    };

    $scope.openChatDialog = function (chat) {

        if (chat.type && chat.type != 'info') {

            currentChat = chat;
            ChatDialogService.init('templates/chat-detail.html', $scope).then(
                function (modal) {
                    modal.show();
                });
        }
    };

    $scope.removeSingleChat = function(chat) {

    };
})
    .controller('AccountCtrl', function ($scope, $window, StorageService) {
        $scope.settings = {
            enableFriends: true
        };

        $scope.username = StorageService.get('username');

    });