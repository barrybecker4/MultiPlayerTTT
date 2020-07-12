
var utils = getUtils();

function getUtils() {

    return {
        rint: rint,
    };

    // Returns a random number between low (inclusive) and high (exclusive).
    function rint(low, high) {
        return Math.floor(low + Math.random() * (high - low));
    }

}
