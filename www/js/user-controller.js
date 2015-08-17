controllers.controller('UserCtrl', function ($scope, $ionicHistory, $ionicLoading, $rootScope) {

    $scope.closeAddRosterDialog = function () {
        $ionicHistory.goBack();
    };

    $scope.rosterIwantToAdd = {};
    $scope.justAddRoster = function () {

        var jid = $scope.rosterIwantToAdd.jid + '@' + interfaceAddress;

        connection.roster.add(jid, $scope.rosterIwantToAdd.name, ['Friends'], function (data) {
        });

        $rootScope.$emit('reload-roster');
        $scope.closeAddRosterDialog();
    };

});