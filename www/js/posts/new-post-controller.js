controllers.controller('NewPostCtrl', ['$scope', 'Upload', 'PostService', '$state', 'StorageService', 'Ahdin', function ($scope, Upload, PostService, $state, StorageService, Ahdin) {

    $scope.post = {
        content: '',
        jid: StorageService.get('username'),
        greetCount: 0,
        commentsCount: 0
    };

    $scope.$on('$ionicView.enter', function () {

        $scope.post = {
            content: '',
            jid: StorageService.get('username'),
            greetCount: 0,
            commentsCount: 0
        };
    });

    $scope.file = null;

    $scope.justPostIt = function (post) {

        var successCallback = function(postId) {

            angular.forEach($scope.files, function(file) {

                console.debug(file.size);
                Ahdin.compress({
                    sourceFile: file,
                    maxWidth: 800,
                    maxHeight:800,
                    quality: 0.5
                }).then(function(compressedBlob) {
                    console.debug(compressedBlob.size);
                    Upload.upload({

                        url: snsInterface + '/api/userPostsWithSingleImage',
                        fields: { postId: postId },
                        file: compressedBlob,
                        method: 'POST'

                    }).progress(function (evt) {

                        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                        console.log('progress: ' + progressPercentage + '% ');

                    }).success(function (data, status, headers, config) {

                        console.log( 'uploaded. Response: ' + data);

                    }).error(function (data, status, headers, config) {

                        console.log('error status: ' + status);
                    });


                });
            });

            $state.go('posts');
        };

        if ($scope.post.content || $scope.files.length > 0) {
            PostService.userPost(post, successCallback);
        }
    }

}]);