const ms = require("ms");

const Time = {
    //Time values in milliseconds
    second: 1000,
    minute: 60000,
    hour: 3600000,
    day: 86400000,
}

function FormatMillisec(timeperiod, long = true){

    const formatted = ms(timeperiod, { long: long });

    const translated = formatted
        .replace("second", "másodperc")
        .replace("seconds", "másodperc")
        .replace("minute", "perc")
        .replace("minutes", "perc")
        .replace("hour", "óra")
        .replace("hours", "óra") 
        .replace("day", "nap")
        .replace("days", "nap")

    return translated;
}

module.exports = {
    Time, FormatMillisec
};