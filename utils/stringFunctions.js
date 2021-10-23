function StartsWithStringArray(str, starts){
    return starts.some(item => str.startsWith(item));
}

function Capitalize(str){
    return str[0].toUpperCase() + str.substring(1);
}

module.exports = {
    StartsWithStringArray,
    Capitalize
};