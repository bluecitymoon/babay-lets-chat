var connection = null;
var connected = false;
var interfaceAddress = '121.40.152.11';
var baseInterfaceAddress = "http://121.40.152.11:8081/";
var snsInterface = 'http://192.168.0.114:8080';
var currentChat = null;
var defaultFriendAvatar = 'img/jerry-avatar.jpeg';
var currentUserJid = '';
var currentUserFullJid = '';
var nick = 'Jerry';
var mode = 'DEBUG';
var groupChatServiceName = 'conference' + '.' + interfaceAddress;

//, 'ui-notification'
var app = angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'nl2br', 'monospaced.elastic', 'checklist-model', 'angularMoment', 'ngFileUpload', 'ahdin']);

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
    .constant('myAvatar', function(Utils) {
        var myAvatar = Utils.getMyAvatar();

        return myAvatar;
    })
    .run(function ($ionicPlatform, StartupService) {

        $ionicPlatform.ready(function () {

            if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);
            }
            if (window.StatusBar) {
                StatusBar.styleLightContent();
            }

            StartupService.startup();
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
