
controllers.controller('RosterCtrl', function ($scope, StorageService, $ionicLoading, $rootScope, $ionicModal, ChatDialogService) {
    $scope.rosters = [];

    $rootScope.$on('roster-loaded', function(event, data) {
        $scope.rosters = data.roster;
        console.debug('loaded roster list -> ' + JSON.stringify($scope.rosters));

        $scope.$apply();
    });

    $rootScope.$on('user-logged-in', function() {

        var loadMyRoster = $iq({type: 'get'}).c('query', {xmlns: 'jabber:iq:roster'});
        connection.sendIQ(loadMyRoster, function(iq) {
            alert(iq);
        });
    });


    $ionicModal.fromTemplateUrl('templates/modal/adduser.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.modal = modal;
    });

    $scope.closeAddRosterDialog = function () {
        $scope.modal.hide();
    };

    $scope.addRosterToMyPlate = function() {
        $scope.modal.show();
    };

    $scope.rosterIwantToAdd = {};
    $scope.justAddRoster = function() {

        var jid = $scope.rosterIwantToAdd.jid + '@' + interfaceAddress;

        connection.roster.add(jid, $scope.rosterIwantToAdd.name, ['Friends'], function(data) {
            alert(JSON.stringify(data));
        });

        $rootScope.$emit('reload-roster');
    };

    $scope.removeSingleRoster = function(jid) {

        connection.roster.remove(jid, function(data) {
            alert(JSON.stringify(data));
        });

        $rootScope.$emit('reload-roster');
    };

    $scope.openChatDialog = function(roster) {

        // $rootScope.$emit('load-single-chat', {chatId: chatId});
        currentChat = {name: roster.name, from: roster.jid};
        ChatDialogService.init('templates/chat-detail.html', $scope).then(
            function(modal) {
                modal.show();
            });
    };
});