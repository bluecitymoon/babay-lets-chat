var services = angular.module('starter.services', [])

    .factory('Chats', function (StorageService) {

        var removeSingleChat = function(chat) {

            return saveOrUpdateChat(chat, 'delete');

        };

        var loadAllLocalChats = function () {

            return StorageService.getArray('localchats');
        };

        var saveOrUpdateChat = function(message, operation) {

            var storedChats = StorageService.getArray('localchats');
            var targetMessage = null;
            for (var i = 0; i < storedChats.length; i++) {
                if (storedChats[i].from === message.from && storedChats[i].type === message.type) {
                    targetMessage = storedChats[i];
                    break;
                }
            }

            if (operation && operation === 'delete') {

                if(targetMessage) {

                    var index = storedChats.indexOf(targetMessage);
                    if(index > -1) {
                        storedChats.splice(targetMessage);
                    }
                }

            } else {

                if(targetMessage) {

                    targetMessage.lastText = message.content;

                } else {

                    targetMessage = {};
                    targetMessage.lastText = message.content;
                    targetMessage.from = message.from;
                    targetMessage.type = message.type;
                    targetMessage.title = message.title;
                    if(message.title == '消息通知') {
                        targetMessage.avatar = 'img/hayizeku/lufee.jpg';
                    } else {
                        targetMessage.avatar = defaultFriendAvatar;
                    }

                    storedChats.push(targetMessage);
                }
            }

            StorageService.setObject('localchats', storedChats);

            return storedChats;
        };

        return {
            loadAllLocalChats: loadAllLocalChats,
            saveOrUpdateChat: saveOrUpdateChat,
            removeSingleChat: removeSingleChat
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
            },
            getArray: function(key) {
                return JSON.parse($window.localStorage[key] || '[]');
            }
        };
    })

    .factory('ChatRoomService', function ($http, $rootScope, Utils) {


        var singleInvite = function(jids, roomName) {

            var name = Utils.getJidHeader(roomName);

            $http({
                url: snsInterface + '/api/chatRooms/invite/' + jids + '/toroom/' + name,
                method: 'POST'
            }).success(function (response, status, headers, config) {

                console.debug(response);
                $rootScope.$emit('flights-loaded', {flights: response});

            }).error(function (response, status, headers, config) {

                console.debug(response);
                $rootScope.$emit('flights-loaded', {flights: []});
            });
        };

        return {
            singleInvite: singleInvite

        };
    })

    .factory('MessageService', function (StorageService, Utils) {
        var messages = [];

        function getMessagesFromSingleFriend(from) {

            for (var i = 0; i < messages.length; i++) {
                if (messages[i].from === from) {
                    return messages[i].items;
                }
            }
            return [];
        }

        function pushSingleMessage(message) {

            var fromJid = message.from;

            var items = getMessagesFromSingleFriend(fromJid);
            if(items.length == 0) {
                messages.push({jid: message.from, items: [message]});
            } else {
                items.push(message);
            }

        }

        var saveSingleMessageToLocalStorage = function(message) {

            var messageKey = message.from.match('/')? 'message_' + Utils.getFullJid(message.from) : 'message_' + message.from;

            var storedMessages = StorageService.getArray(messageKey);

            if(storedMessages.length == 0) {
                storedMessages = [message];
            } else {
                storedMessages.push(message);
            }

            StorageService.setObject(messageKey, storedMessages);
        };

        var getMessagesFromSingleFriendInLocalStorage = function(fullJid) {

            return StorageService.getArray('message_' + fullJid);
        };

        return {
            getMessagesFromSingleFriend: getMessagesFromSingleFriend,
            pushSingleMessage: pushSingleMessage,
            saveSingleMessageToLocalStorage: saveSingleMessageToLocalStorage,
            getMessagesFromSingleFriendInLocalStorage: getMessagesFromSingleFriendInLocalStorage
        };
    })

    .factory('ChatDialogService', function ($ionicModal, $rootScope) {

        var init = function (tpl, type, $scope) {

            var promise;
            $scope = $scope || $rootScope.$new();

            promise = $ionicModal.fromTemplateUrl(tpl, {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function (modal) {
                $scope.modal = modal;
                $scope.type = type;
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
        };

        var updateBageCount = function (rosters, rooms, fullJid) {

            //rosters.append(rooms);
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

        var clearUnreadCount = function(rosters, jid) {

            for (var i = 0; i < rosters.length; i++) {
                if (rosters[i].jid === jid) {

                    rosters[i].unread = 0

                    console.debug('Service clear up the unread count.');
                    return;
                }
            }
        };

        return {
            init: init,
            updateUnreadCount: updateBageCount,
            clearUnreadCount: clearUnreadCount
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