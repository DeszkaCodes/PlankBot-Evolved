function StartsWithStringArray(str, starts){
    return starts.some(item => str.startsWith(item));
}

module.exports = {
    StartsWithStringArray
};