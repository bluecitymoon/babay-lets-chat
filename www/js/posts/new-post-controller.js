controllers.controller('NewPostCtrl', ['$scope', 'Upload', 'PostService', '$state', 'StorageService', function ($scope, Upload, PostService, $state, StorageService) {

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

                Upload.upload({

                    url: snsInterface + '/api/userPostsWithSingleImage',
                    fields: { postId: postId },
                    file: file,
                    method: 'POST'

                }).progress(function (evt) {

                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    console.log('progress: ' + progressPercentage + '% ');

                }).success(function (data, status, headers, config) {

                    console.log( 'uploaded. Response: ' + data);

                }).error(function (data, status, headers, config) {

                    console.log('error status: ' + status);
                });

                $state.go('posts');
            });
        };

        PostService.userPost(post, successCallback);

    }

}]);