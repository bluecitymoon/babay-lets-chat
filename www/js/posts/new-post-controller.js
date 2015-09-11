controllers.controller('NewPostCtrl', ['$scope', 'Upload', 'PostService', '$state', 'StorageService', 'Ahdin', '$rootScope', function ($scope, Upload, PostService, $state, StorageService, Ahdin, $rootScope) {

    $scope.post = {
        content: '',
        jid: StorageService.getObject('configuration').username,
        greetCount: 0,
        commentsCount: 0
    };

    $scope.$on('$ionicView.enter', function () {

        $scope.post = {
            content: '',
            jid: StorageService.getObject('configuration').username,
            greetCount: 0,
            commentsCount: 0
        };
    });

    $scope.file = null;

    $scope.justPostIt = function (post) {

        var successCallback = function(postId) {

            angular.forEach($scope.files, function(file) {

                var uploadImageFile = function(compressedBlob) {

                    Upload.upload({

                        url: snsInterface + '/api/userPostsWithSingleImage',
                        fields: { postId: postId },
                        file: compressedBlob,
                        method: 'POST'

                    }).progress(function (evt) {

                        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                        console.log('progress: ' + progressPercentage + '% ');

                    }).success(function (data, status, headers, config) {

                        $rootScope.$emit('image-upload-success', {postId: postId, src: data.fullSrc});

                    }).error(function (data, status, headers, config) {

                        console.log('error status: ' + status);
                    });
                };

                //TODO gif no compress
                Ahdin.compress({
                    sourceFile: file,
                    maxWidth: 800,
                    maxHeight:800,
                    quality: 0.5
                }).then(function(compressedBlob) {

                    uploadImageFile(compressedBlob);
                });

                $state.go('posts');
            });

        };

        if ($scope.post.content || $scope.files.length > 0) {
            PostService.userPost(post, successCallback);
        }
    }

}]);