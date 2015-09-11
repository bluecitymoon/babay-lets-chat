controllers.controller('PostsCtrl', function ($scope, $window, StorageService, $ionicHistory, $ionicActionSheet, $state, PostService, $rootScope, $ionicLoading) {

    $scope.goback = function() {
        $ionicHistory.goBack();
    };

    $scope.gotoNewPostPage = function() {

        $state.go('new-post-page');

    };
    $ionicLoading.show({
        template: '<ion-spinner icon=\"spiral\"></ion-spinner>正在载入'
    });

    PostService.loadAllReadablePosts();

    $scope.allPosts = [];
    //$scope.$on('$ionicView.enter', function () {
    //
    //    $ionicLoading.show({
    //        template: '<ion-spinner icon=\"spiral\"></ion-spinner>正在载入'
    //    });
    //
    //    PostService.loadAllReadablePosts();
    //});

    $rootScope.$on('avaliable-posts-loaded', function(event, data) {

        if(data.posts) {
            $scope.allPosts = data.posts;
        }

    });

    $scope.reloadSNS = function() {
        PostService.loadAllReadablePosts();
    };

    $rootScope.$on('image-upload-success', function(event, data) {

        for(var i = 0; i< $scope.allPosts.length; i ++) {

            var singlePost = $scope.allPosts[i];
            if(data.postId == singlePost.id) {

                var images = singlePost.imageSrcList;
                if(images) {
                    images.push(data.src);
                } else {
                    singlePost.imageSrcList = [data.src];
                }
            }
        }
    });

    $rootScope.$on('new-post-created-success', function(event, data) {

        var configuration = StorageService.getObject("configuration");
        data.singlePost.avatar = configuration.avatar;
        data.singlePost.nickname = configuration.nickname;

        $scope.allPosts.unshift(data.singlePost);

    });
});