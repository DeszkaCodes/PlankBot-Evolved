function RandomInt(minInclusive, maxInclusive){
    return Math.floor((Math.random() * maxInclusive) + minInclusive);
};

module.exports = { RandomInt };