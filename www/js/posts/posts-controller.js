controllers.controller('PostsCtrl', function ($scope, $window, StorageService, $ionicHistory, $ionicActionSheet, $state) {

    $scope.goback = function() {
        $ionicHistory.goBack();
    };

    $scope.gotoNewPostPage = function() {

        $state.go('new-post-page');

    }
});