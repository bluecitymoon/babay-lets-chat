services.factory('StartupService', function ( BOSH_URL, StorageService, $ionicLoading, MessageService, $rootScope, Utils, Chats, UserService) {

    var registerUserOnFirstLoad = function() {

    };

    function startup() {

        UserService.loadMyInformation();

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

            $rootScope.$emit('roster-loaded', {roster: roster});

            StorageService.setObject(currentUserJid + '_rosters', roster);

            UserService.loadRosterAvatars();
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
            var username = Utils.getMyJid();

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
    }

    return {
        registerUserOnFirstLoad: registerUserOnFirstLoad,
        startup: startup
    };
});
