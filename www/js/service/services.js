var services = angular.module('starter.services', [])

    .factory('focus', function ($timeout, $window) {
        return function (id) {
            // timeout makes sure that is invoked after any other event has been triggered.
            // e.g. click events that need to run before the focus or
            // inputs elements that are in a disabled state but are enabled when those events
            // are triggered.
            $timeout(function () {
                var element = $window.document.getElementById(id);
                if (element) {
                    element.focus();
                }
            });
        };
    })

    .factory('UserService', function (StorageService, Utils, $http) {

        function loadRosterAvatars() {

            var configuration = StorageService.getObject('configuration');
            var storedRostersKey = configuration.username + '_rosters';
            var rosters = StorageService.getArray(storedRostersKey);
            angular.forEach(rosters, function (roster) {

                $http({
                    url: baseInterfaceAddress + 'ihome/chat/resident',
                    params: {
                        tokenId: configuration.tokenId,
                        residentId: configuration.userId,
                        phoneNum: Utils.getJidHeader(roster.jid)
                    }
                }).success(function (response, status, headers, config) {

                    console.debug(JSON.stringify(response));

                    roster.avatar = response.data.resident.headImg;
                    roster.nickname = response.data.resident.nickName;

                    StorageService.setObject(storedRostersKey, rosters);

                }).error(function (response, status, headers, config) {

                    console.debug(response);
                });
            });

        }

        function loadMyInformation() {

            var configuration = StorageService.getObject('configuration');

            $http({
                url: baseInterfaceAddress + 'ihome/chat/resident',
                params: {
                    tokenId: configuration.tokenId,
                    residentId: configuration.userId,
                    phoneNum: configuration.username
                }
            }).success(function (response, status, headers, config) {

                configuration.avatar = response.data.resident.headImg;
                configuration.nickname = response.data.resident.nickName;

                StorageService.setObject('configuration', configuration);

            }).error(function (response, status, headers, config) {

                console.debug(response);
            });
        }

        function findUserInformationByJid(jidParam) {

            var configuration = StorageService.getObject('configuration');
            var storedRostersKey = configuration.username + '_rosters';
            var rosters = StorageService.getArray(storedRostersKey);

            var roster = null;
            for (var i = 0; i < rosters.length; i++) {
                if (rosters[i].jid === jidParam) {
                    roster = rosters[i];
                    break;
                }
            }

            return roster;
        }

        return {
            loadRosterAvatars: loadRosterAvatars,
            loadMyInformation: loadMyInformation,
            findUserInformationByJid: findUserInformationByJid
        };
    })

    .factory('Chats', function (StorageService) {

        var removeSingleChat = function (chat) {

            return saveOrUpdateChat(chat, 'delete');

        };

        var loadAllLocalChats = function () {

            return StorageService.getArray('localchats');
        };

        var saveOrUpdateChat = function (message, operation) {

            var storedChats = StorageService.getArray('localchats');
            var targetMessage = null;
            for (var i = 0; i < storedChats.length; i++) {
                if (storedChats[i].from === message.from && storedChats[i].type === message.type) {
                    targetMessage = storedChats[i];
                    break;
                }
            }

            if (operation && operation === 'delete') {

                if (targetMessage) {

                    var index = storedChats.indexOf(targetMessage);
                    if (index > -1) {
                        storedChats.splice(targetMessage);
                    }
                }

            } else {

                if (targetMessage) {

                    targetMessage.lastText = message.content;

                } else {

                    targetMessage = {};
                    targetMessage.lastText = message.content;
                    targetMessage.from = message.from;
                    targetMessage.type = message.type;
                    targetMessage.title = message.title;
                    targetMessage.jid = message.jid;
                    targetMessage.name = message.name;

                    if (message.title == '消息通知') {
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

                var value = '';
                try {
                    value = $window.localStorage[key];
                } catch (e) {
                }

                return value;
            },
            set: function (key, value) {
                $window.localStorage[key] = value;
            },
            setObject: function (key, value) {
                $window.localStorage[key] = JSON.stringify(value);
            },
            getObject: function (key) {
                return JSON.parse($window.localStorage[key] || '{}');
            },
            getArray: function (key) {
                return JSON.parse($window.localStorage[key] || '[]');
            }
        };
    })

    .factory('ChatRoomService', function ($http, $rootScope, Utils) {


        var singleInvite = function (jids, roomName) {

            var name = Utils.getJidHeader(roomName);

            $http({
                url: snsInterface + '/api/chatRooms/invite/' + jids + '/toroom/' + name,
                method: 'POST'
            }).success(function (response, status, headers, config) {

                console.debug(response);

            }).error(function (response, status, headers, config) {

                console.debug(response);
            });
        };

        return {
            singleInvite: singleInvite

        };
    })

    .factory('PostService', function ($http, $rootScope, StorageService, $ionicLoading, UserService) {

        function userPost(post, successCallback, failCallback) {

            post.createDate = new Date();

            console.debug(post);

            $http({
                url: snsInterface + '/api/singlePost',
                data: JSON.stringify(post),
                method: 'POST'
            }).success(function (response, status, headers, config) {

                $rootScope.$emit('new-post-created-success', {singlePost: response});
                if (successCallback) {
                    successCallback(response.id);
                }
            }).error(function (response, status, headers, config) {

                if (failCallback) {
                    failCallback();
                }
            });
        }


        function commentPost(comment, post, successCallback, failCallback) {

            $http({
                url: snsInterface + '/api/comment/' + post.id,
                data: JSON.stringify(comment),
                method: 'POST'
            }).success(function (response, status, headers, config) {

                console.debug(response);
                if(response) {
                    comment.id = response;
                    comment.postId = post.id;
                    $rootScope.$emit('new-comment-created-success', {comment: comment});
                }

                if (successCallback) {
                    successCallback(response.id);
                }
            }).error(function (response, status, headers, config) {

                if (failCallback) {
                    failCallback();
                }
            });
        }

        function greetPost(postId) {

            $http({
                url: snsInterface + '/api/greet/' + postId,
                method: 'POST'
            }).success(function (response, status, headers, config) {
                console.debug(response);

            }).error(function (response, status, headers, config) {

            });
        }
        function loadAllReadablePosts() {

            $http({
                url: snsInterface + '/api/avaliablePosts',
                params: {userId: StorageService.get('username')}
            }).success(function (response, status, headers, config) {

                if(response) {

                    angular.forEach(response, function(singlePost) {

                        var jid = singlePost.jid;
                        var roster = UserService.findUserInformationByJid(jid);

                        if(roster) {
                            singlePost.avatar = roster.avatar;
                            singlePost.nickname = roster.nickname;
                        } else {
                            singlePost.avatar = "img/hayizeku/jyoba.jpeg";
                            singlePost.nickname = singlePost.jid;
                        }

                        var configuration = StorageService.getObject("configuration");
                        if(singlePost.jid == configuration.username) {
                            singlePost.avatar = configuration.avatar;
                            singlePost.nickname = configuration.nickname;
                        }
                        console.debug(JSON.stringify(singlePost));

                    });

                    $rootScope.$emit('avaliable-posts-loaded', {posts: response});
                }

                $ionicLoading.hide();
                $rootScope.$broadcast('scroll.refreshComplete');
            }).error(function (response, status, headers, config) {

            });
        }

        return {
            userPost: userPost,
            loadAllReadablePosts: loadAllReadablePosts,
            greetPost: greetPost,
            commentPost: commentPost
        }
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
            if (items.length == 0) {
                messages.push({jid: message.from, items: [message]});
            } else {
                items.push(message);
            }

        }

        var saveSingleMessageToLocalStorage = function (message) {

            var messageKey = message.from.match('/') ? 'message_' + Utils.getFullJid(message.from) : 'message_' + message.from;

            var storedMessages = StorageService.getArray(messageKey);

            if (storedMessages.length == 0) {
                storedMessages = [message];
            } else {
                storedMessages.push(message);
            }

            StorageService.setObject(messageKey, storedMessages);
        };

        var getMessagesFromSingleFriendInLocalStorage = function (fullJid) {

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

                    var unread = rosters[i].unread ? rosters[i].unread : 0;
                    unread++;

                    rosters[i].unread = unread;

                    console.debug('Service updates ' + fullJid + ' unread count to ' + unread);
                    return;
                }
            }
        };

        var clearUnreadCount = function (rosters, jid) {

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
        function ($timeout) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    $timeout(function () {
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
                            angular.element(autolinks[i]).bind('click', function (e) {
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