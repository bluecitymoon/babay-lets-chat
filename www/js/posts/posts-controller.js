controllers.controller('PostsCtrl', function ($scope, $window, StorageService, $ionicHistory, $ionicActionSheet, $state, PostService, $rootScope) {

    $scope.goback = function() {
        $ionicHistory.goBack();
    };

    $scope.gotoNewPostPage = function() {

        $state.go('new-post-page');

    };

    $scope.allPosts = [];
    $scope.$on('$ionicView.enter', function () {

        PostService.loadAllReadablePosts($rootScope);
    });

    $rootScope.$on('avaliable-posts-loaded', function(event, data) {

        if(data.posts) {
            $scope.allPosts = data.posts;
        }

    });
});