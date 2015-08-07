// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js

var connection = null;
var connected = false;
var interfaceAddress = '192.168.0.100';
var currentChat = null;

var app = angular.module('starter', ['ionic', 'starter.controllers', 'starter.services']);

    app.constant('BOSH_URL', 'http://' + interfaceAddress + ':7070/http-bind/')
    .constant('interface_address', interfaceAddress)

    .run(function ($ionicPlatform, BOSH_URL, StorageService, $ionicLoading, MessageService, $rootScope) {

        $ionicPlatform.ready(function () {
            if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);
            }
            if (window.StatusBar) {
                StatusBar.styleLightContent();
            }

            var onMessage = function (recievedMessage){

                var from = recievedMessage.getAttribute('from');
                var type = recievedMessage.getAttribute('type');
                var elems = recievedMessage.getElementsByTagName('body');
                var body = '';
                if (type == "chat" && elems.length > 0) {
                    body = Strophe.getText(elems[0]) ;
                }
                var message = {from: from, content: body, timeString: '', type: 'you'};
                //MessageService.pushSingleMessage(message);

                console.debug('received: ' + JSON.stringify(message));

                $rootScope.$emit('receive-new-message', {message: JSON.stringify(message)});

                return true;
            }

            var on_subscription_request = function (stanza)
            {
                //&& is_friend(stanza.getAttribute("from"))
                if(stanza.getAttribute("type") == "subscribe" )
                {
                    // Send a 'subscribed' notification back to accept the incoming
                    // subscription request
                    connection.send($pres({ to: "friend@example.com", type: "subscribed" }));
                }
                return true;
            };

            if (!connected) {

                $ionicLoading.show({
                    template: '<ion-spinner icon=\"spiral\"></ion-spinner>正在登录'
                });

                connection = new Strophe.Connection(BOSH_URL);
                var username = StorageService.get('username');
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
                           // connection.addHandler(on_subscription_request, null, "presence", "subscribe");

                            connection.send($pres().tree());

                            $ionicLoading.hide();

                            break;

                        case Strophe.Status.DISCONNECTED:
                            alert(error);
                            break;
                        case Strophe.Status.DISCONNECTING:
                            alert(error);
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

            .state('tab.dash', {
                url: '/dash',
                views: {
                    'tab-dash': {
                        templateUrl: 'templates/tab-dash.html',
                        controller: 'DashCtrl'
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

            .state('tab.account', {
                url: '/account',
                views: {
                    'tab-account': {
                        templateUrl: 'templates/tab-account.html',
                        controller: 'AccountCtrl'
                    }
                }
            });

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/tab/dash');

    });
