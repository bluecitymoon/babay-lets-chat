services.factory('Utils', function () {

    function getFullJid(longestJid) {

        return splitStringWith(longestJid, '/');
    };

    function getJidHeader(longestJid) {

        return splitStringWith(longestJid, '@');
    };

    function splitStringWith(string, withStr) {

        if(string) {
            var splittedElements = string.toString().split(withStr);
            var firstElement = splittedElements[0];

            return firstElement;
        }
        return '';
    }

    return {
        getFullJid: getFullJid,
        getJidHeader: getJidHeader
    };
});
