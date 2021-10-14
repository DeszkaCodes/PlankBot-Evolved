function ExpToLevel(experience){
    return Math.floor(Math.pow(Math.floor(experience / 42), 0.55));
}

module.exports = {
    ExpToLevel
};