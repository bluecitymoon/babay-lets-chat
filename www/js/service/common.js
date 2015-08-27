services.factory('Utils', function ($ionicPopup) {

    function getFullJid(longestJid) {

        return splitStringWith(longestJid, '/', 0);
    };

    function getJidHeader(longestJid) {

        return splitStringWith(longestJid, '@', 0);
    };

    function getGroupParticipantNickName(fullJid) {
        return splitStringWith(fullJid, '/', 1);
    };

    function splitStringWith(string, withStr, index) {

        if(string) {
            var splittedElements = string.toString().split(withStr);
            var firstElement = splittedElements[index];

            return firstElement;
        }
        return '';
    };

    function alert(message, callback) {

        var alertPopup = $ionicPopup.alert({
            title: '提示信息',
            template: message,
            okText: '确定',
            okType: 'button button-block button-positive'
        });

        if( callback ) {
            alertPopup.then(callback);
        }
    }

    return {
        getFullJid: getFullJid,
        getJidHeader: getJidHeader,
        alert: alert,
        getGroupParticipantNickName: getGroupParticipantNickName
    };
});
