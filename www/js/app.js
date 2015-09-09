var connection = null;
var connected = false;
var interfaceAddress = '121.40.152.11';
var snsInterface = 'http://192.168.0.120:8080';
var currentChat = null;
var defaultFriendAvatar = 'img/jerry-avatar.jpeg';
var currentUserJid = '';
var currentUserFullJid = '';
var nick = 'Jerry';
var mode = 'DEBUG';
var groupChatServiceName = 'conference' + '.' + interfaceAddress;

//, 'ui-notification'
var app = angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'nl2br', 'monospaced.elastic', 'checklist-model', 'angularMoment', 'ngFileUpload']);

app.filter('nl2br', ['$filter',
    function ($filter) {
        return function (data) {
            if (!data) return data;
            var dataAfter = data.replace(/\n\r?/g, '<br />');

            return dataAfter;
        };
    }
]);

app.constant('BOSH_URL', 'http://' + interfaceAddress + ':7070/http-bind/')
    .constant('interface_address', interfaceAddress)

    .run(function ($ionicPlatform, BOSH_URL, StorageService, $ionicLoading, MessageService, $rootScope, Utils, StartupService, Chats) {

        $ionicPlatform.ready(function () {

            if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);
            }
            if (window.StatusBar) {
                StatusBar.styleLightContent();
            }

            var onMessage = function (recievedMessage) {

                console.debug(recievedMessage);

                var from = recievedMessage.getAttribute('from');
                var type = recievedMessage.getAttribute('type');
                var elements = recievedMessage.getElementsByTagName('body');

                var stamp = new Date();
                if (recievedMessage.getElementsByTagName('delay') && recievedMessage.getElementsByTagName('delay').length == 1) {

                    stamp = recievedMessage.getElementsByTagName('delay')[0].getAttribute('stamp');
                    console.debug(stamp);

                }

                var joinToGroupReason = $(recievedMessage).find('reason').get();

                if (joinToGroupReason[0] && joinToGroupReason[0].textContent && joinToGroupReason[0].textContent == 'invite-to-group') {

                    var inviteFrom = $(recievedMessage).find('invite').map(function () {
                        return $(this).attr("from");
                    }).get();

                    var message = {
                        from: inviteFrom,
                        type: 'info',
                        content: inviteFrom + '邀请你加入了' + from,
                        title: '消息通知'
                    };
                    Chats.saveOrUpdateChat(message);

                }

                var body = '';
                if ((type == "chat" || type == 'groupchat') && elements.length > 0) {

                    var nickname = '';
                    if (type == 'groupchat') {
                        nickname = Utils.getGroupParticipantNickName(from);
                    }

                    body = Strophe.getText(elements[0]);

                    if (type == 'groupchat' && nickname == currentUserJid) {
                        console.debug('receive my own message, ignore it.');
                    } else {

                        var message = {
                            from: from,
                            nick: nickname,
                            content: body,
                            date: stamp,
                            type: 'friend',
                            messageType: type
                        };

                        MessageService.saveSingleMessageToLocalStorage(message);

                        var chatlog = {
                            jid: from,
                            type: type,
                            content: body,
                            title: Utils.getJidHeader(from),
                            name: Utils.getJidHeader(from),
                            avatar: defaultFriendAvatar,
                            unread: false
                        };
                        Chats.saveOrUpdateChat(chatlog);

                        $rootScope.$emit('receive-new-message', {message: JSON.stringify(message)});
                    }
                }

                $rootScope.$emit('chats-changed');

                return true;
            };

            var loadRoster = function (roster) {

                angular.forEach(roster, function (value) {
                    value.avatar = defaultFriendAvatar;
                });

                $rootScope.$emit('roster-loaded', {roster: roster});

                StorageService.setObject(currentUserJid + '_rosters', roster);
            };

            $rootScope.$on('reload-roster', function () {
                connection.roster.get(loadRoster);
            });

            $rootScope.$on('load-and-join-rooms', function () {

                connection.muc.listRooms(groupChatServiceName, function (stanza) {

                    var rooms = stanza.getElementsByTagName('item');
                    var roomsTranformed = [];
                    angular.forEach(rooms, function (value, index) {

                        var room = {
                            jid: value.getAttribute('jid'),
                            name: value.getAttribute('name'),
                            avatar: 'img/group-avatar.jpg'
                        };

                        console.debug('joining room: ' + room.jid);
                        connection.muc.join(room.jid, currentUserJid);

                        roomsTranformed.push(room);
                    });

                    $rootScope.$emit('rooms-loaded', {rooms: roomsTranformed});

                    StorageService.setObject(currentUserJid + '_' + 'rooms', roomsTranformed);

                    console.debug('loaded rooms ' + JSON.stringify(roomsTranformed));

                }, function () {
                });
            });

            if (!connected) {

                //$ionicLoading.show({
                //    template: '<ion-spinner icon=\"spiral\"></ion-spinner>正在登录'
                //});

                connection = new Strophe.Connection(BOSH_URL);
                var username = StorageService.get('username');

                currentUserJid = username;
                currentUserFullJid = username + '@' + interfaceAddress;

                connection.connect(username + '@' + interfaceAddress, username, function (status, error) {

                    switch (status) {
                        case Strophe.Status.ERROR:
                            alert(error);
                            break;
                        case Strophe.Status.CONNECTING:
                            break;
                        case Strophe.Status.CONNFAIL:
                            alert(error);
                            break;
                        case Strophe.Status.AUTHENTICATING:

                            $ionicLoading.show({
                                template: '<ion-spinner icon=\"spiral\"></ion-spinner>正在验证'
                            });
                            break;

                        case Strophe.Status.AUTHFAIL:
                            $ionicLoading.show({
                                template: '<ion-spinner icon=\"spiral\"></ion-spinner>验证失败 ' + error
                            });

                            $ionicLoading.hide();

                            break;
                        case Strophe.Status.CONNECTED:

                            $ionicLoading.show({
                                template: '<ion-spinner icon=\"spiral\"></ion-spinner>已连接'
                            });
                            connection.addHandler(onMessage, null, "message", null, null, null);

                            connection.send($pres().tree());

                            connection.muc.init(connection);

                            $ionicLoading.hide();

                            $rootScope.$emit('reload-roster');
                            $rootScope.$emit('load-and-join-rooms');

                            break;

                        case Strophe.Status.DISCONNECTED:
                            alert('连接已断开');
                            break;
                        case Strophe.Status.DISCONNECTING:
                            break;
                        case Strophe.Status.ATTACHED:
                            alert(error);
                            break;
                        case Strophe.Status.REDIRECT:
                            alert(error);
                            break;
                        default:
                            break;
                    }
                });

            }
        });
    })

    .config(function ($stateProvider, $urlRouterProvider) {

        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        $stateProvider

            // setup an abstract state for the tabs directive
            .state('tab', {
                url: '/tab',
                abstract: true,
                templateUrl: 'templates/tabs.html'
            })

            // Each tab has its own nav history stack:

            .state('tab.rosters', {
                url: '/rosters',
                views: {
                    'tab-dash': {
                        templateUrl: 'templates/tab-rosters.html',
                        controller: 'RosterCtrl'
                    }
                }
            })

            .state('tab.chats', {
                url: '/chats',
                views: {
                    'tab-chats': {
                        templateUrl: 'templates/tab-chats.html',
                        controller: 'ChatsCtrl'
                    }
                }
            })

            .state('chat-detail', {
                url: '/chatsdetail/:chatId',
                templateUrl: 'templates/chat-detail.html',
                controller: 'ChatDetailCtrl'
            })

            .state('add-new-roster', {
                url: '/addnewroster',
                templateUrl: 'templates/modal/adduser.html',
                controller: 'UserCtrl'
            })

            .state('create-my-room', {
                url: '/createmyroom',
                templateUrl: 'templates/modal/create-room.html',
                controller: 'CreateRoomCtrl'
            })

            .state('invite-to-room', {
                url: '/invite2room/:roomjid',
                templateUrl: 'templates/roster/select-rosters.html',
                controller: 'InviteMyFriendToRoomCtrl'
            })

            .state('tab.account', {
                url: '/account',
                views: {
                    'tab-account': {
                        templateUrl: 'templates/sns/tab-sns-navigation.html',
                        controller: 'NavigationCtrl'
                    }
                }
            })
            .state('posts', {
                url: '/posts',
                templateUrl: 'templates/tab-posts.html',
                controller: 'PostsCtrl'
            })

            .state('settings', {
                url: '/settings',
                templateUrl: 'templates/setting/setting.html',
                controller: 'AccountCtrl'
            })
            .state('new-post-page', {
                url: '/newpost',
                templateUrl: 'templates/sns/new-post.html',
                controller: 'NewPostCtrl'
            });

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/tab/rosters');

    });

moment.locale('en', {
    relativeTime: {
        future: "在 %s",
        past: "%s 之前",
        s: "%d 秒",
        m: "一分钟",
        mm: "%d 分钟",
        h: "一小时",
        hh: "%d 小时",
        d: "一天",
        dd: "%d 天",
        M: "一个月",
        MM: "%d 月",
        y: "一年",
        yy: "%d 年"
    }
});
