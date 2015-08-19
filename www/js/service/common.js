services.factory('Utils', function () {

    function getFullJid(longestJid) {

        var splittedElements = longestJid.split('/');
        var fullJid = splittedElements[0];

        return fullJid;
    };

    return {
        getFullJid: getFullJid
    };
});
