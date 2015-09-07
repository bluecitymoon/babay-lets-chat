controllers.controller('NewPostCtrl', ['$scope', 'Upload', 'PostService', function ($scope, Upload, PostService) {

    $scope.post = {
        content: '',
        jid: currentUserJid,
        greetCount: 0,
        commentsCount: 0
    };

    $scope.$on('$ionicView.enter', function () {

        $scope.post = {
            content: '',
            jid: currentUserJid,
            greetCount: 0,
            commentsCount: 0
        };
    });

    $scope.file = null;

    $scope.justPostIt = function ($files) {

        console.debug($scope.files);

        Upload.upload({
            url: snsInterface + '/api/userPostsWithImages',
            fields: {'fileName': 'Hello.jpg'},
            file: $scope.files,
            method: 'POST'
        }).progress(function (evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            console.log('progress: ' + progressPercentage + '% ');
        }).success(function (data, status, headers, config) {
            console.log( 'uploaded. Response: ' + data);
        }).error(function (data, status, headers, config) {
            console.log('error status: ' + status);
        })
    }

}]);