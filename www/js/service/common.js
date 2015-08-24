services.factory('Utils', function () {

    function getFullJid(longestJid) {

        var splittedElements = longestJid.split('/');
        var fullJid = splittedElements[0];

        return fullJid;
    };

    function getJidHeader(longestJid) {

        var splittedElements = longestJid.split('@');
        var header = splittedElements[0];

        return header;
    };

    return {
        getFullJid: getFullJid,
        getJidHeader: getJidHeader
    };
});
