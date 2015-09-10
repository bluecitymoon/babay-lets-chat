controllers.controller('PostsCtrl', function ($scope, $window, StorageService, $ionicHistory, $ionicActionSheet, $state, PostService, $rootScope, $ionicLoading) {

    $scope.goback = function() {
        $ionicHistory.goBack();
    };

    $scope.gotoNewPostPage = function() {

        $state.go('new-post-page');

    };

    $scope.allPosts = [];
    $scope.$on('$ionicView.enter', function () {

        $ionicLoading.show({
            template: '<ion-spinner icon=\"spiral\"></ion-spinner>正在载入'
        });

        PostService.loadAllReadablePosts($rootScope);
    });

    $rootScope.$on('avaliable-posts-loaded', function(event, data) {

        if(data.posts) {
            $scope.allPosts = data.posts;
        }

    });
});