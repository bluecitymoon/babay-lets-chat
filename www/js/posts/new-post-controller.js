controllers.controller('NewPostCtrl', function ($scope, $window, PostService, $ionicHistory, $ionicActionSheet, $state) {

    $scope.post = {
        content: '',
        jid: currentUserJid,
        greetCount: 0,
        commentsCount: 0
    };

    $scope.$on('$ionicView.enter', function() {

        $scope.post = {
            content: '',
            jid: currentUserJid,
            greetCount: 0,
            commentsCount: 0
        };
    });

    $scope.justPostIt = function () {
        PostService.userPost($scope.post);
    }

});