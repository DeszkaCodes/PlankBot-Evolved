const Time = {
    //Time values in milliseconds
    second: 1000,
    minute: 60000,
    hour: 3600000,
    day: 86400000,
}

function DoubleDigit(time){
    let digit = `${time}`;

    if(digit.length < 1)
        digit = "00";
    else if(digit.length == 1)
        digit = `0${digit}`;

    return digit;
}

function FormatMillisec(timeperiod, long = true, capitalized = true) {

    const days = Math.floor(timeperiod / Time.day);
    timeperiod -= Time.day * days;
    const hours = Math.floor(timeperiod / Time.hour);
    timeperiod -= Time.hour * hours;
    const minutes = Math.floor(timeperiod / Time.minute);
    timeperiod -= Time.minute * minutes;
    const seconds = Math.floor(timeperiod / Time.second);

    let time = "";

    if(days > 0)
        time += `${days} nap`;
    if(hours > 0)
        time += ` ${hours}:${DoubleDigit(minutes)} óra`
    else if(minutes > 0)
        time += ` ${minutes}:${DoubleDigit(seconds)} perc`
    else if(seconds > 0)
        time += ` ${seconds} másodperc`
    else
        time += capitalized ? "Kevesebb, mint egy másodperc" : "kevesebb, mint egy másodperc"


    return time.trim();
}

module.exports = {
    Time, FormatMillisec
};