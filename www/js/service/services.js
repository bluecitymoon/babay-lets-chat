angular.module('starter.services', [])

    .factory('Chats', function (StorageService) {
        // Might use a resource here that returns a JSON array

        // Some fake testing data
        var chats = [{
            id: 0,
            name: 'Jerry',
            lastText: 'You on your way?',
            face: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png',
            from: 1
        }];

        function saveAllLocalChat() {
            StorageService.set('allchats', JSON.stringify(chats));
        };

        return {
            saveAllLocalChat: saveAllLocalChat,
            all: function () {
                return chats;
            },
            remove: function (chat) {
                chats.splice(chats.indexOf(chat), 1);
            },
            get: function (chatId) {
                for (var i = 0; i < chats.length; i++) {
                    if (chats[i].id === parseInt(chatId)) {
                        return chats[i];
                    }
                }
                return null;
            }
        };
    })

    .factory('StorageService', function ($window) {

        return {
            get: function (key) {
                return $window.localStorage[key];
            },
            set: function (key, value) {
                $window.localStorage[key] = value;
            },
            setObject: function(key, value) {
                $window.localStorage[key] = JSON.stringify(value);
            },
            getObject: function(key) {
                return JSON.parse($window.localStorage[key] || '{}');
            }
        };
    })

    .factory('MessageService', function () {
        var messages = [{from: '', content: '', timeString: ''}];

        function getMessagesFromSingleFriend(from) {

            for (var i = 0; i < messages.length; i++) {
                if (messages[i].from === from) {
                    return messages[i];
                }
            }
            return null;
        }

        function pushSingleMessage(message) {
            messages.push(message);
        }

        return {
            getMessagesFromSingleFriend: getMessagesFromSingleFriend,
            pushSingleMessage: pushSingleMessage
        };
    })

    .factory('ChatDialogService', function ($ionicModal, $rootScope) {

        var init = function (tpl, $scope) {

            var promise;
            $scope = $scope || $rootScope.$new();

            promise = $ionicModal.fromTemplateUrl(tpl, {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function (modal) {
                $scope.modal = modal;
                return modal;
            });

            $scope.openModal = function () {
                $scope.modal.show();
            };
            $scope.closeModal = function () {
                $scope.modal.remove();
            };
            $scope.$on('$destroy', function () {
                $scope.modal.remove();
            });

            return promise;
        }

        var updateBageCount = function (rosters, fullJid) {

            for (var i = 0; i < rosters.length; i++) {
                if (rosters[i].jid === fullJid) {

                    var unread = rosters[i].unread? rosters[i].unread : 0;
                    unread ++;

                    rosters[i].unread = unread;

                    console.debug('Service updates ' + fullJid + ' unread count to ' + unread);
                    return;
                }
            }
        };

        return {
            init: init,
            updateUnreadCount: updateBageCount

       };
    })

    .directive('autolinker', ['$timeout',
        function($timeout) {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {
                    $timeout(function() {
                        var eleHtml = element.html();

                        if (eleHtml === '') {
                            return false;
                        }

                        var text = Autolinker.link(eleHtml, {
                            className: 'autolinker',
                            newWindow: false
                        });

                        element.html(text);

                        var autolinks = element[0].getElementsByClassName('autolinker');

                        for (var i = 0; i < autolinks.length; i++) {
                            angular.element(autolinks[i]).bind('click', function(e) {
                                var href = e.target.href;
                                console.log('autolinkClick, href: ' + href);

                                if (href) {
                                    //window.open(href, '_system');
                                    window.open(href, '_blank');
                                }

                                e.preventDefault();
                                return false;
                            });
                        }
                    }, 0);
                }
            }
        }
    ]);