Date.prototype.removeMillSeconds = function () {
    const hours = this.getHours();
    const minutes = (hours * 60) + this.getMinutes();
    const seconds = (minutes * 60) + this.getSeconds();
    const millSecconds = (seconds * 1000) + this.getMilliseconds();

    return millSecconds;
};

Date.prototype.toJSON = function () {
    const date = this.getFullYear() + '-' + ('0' + (this.getMonth() + 1)).slice(-2) + '-' + ('0' + this.getDate()).slice(-2) + 'T ';
    const time = this.getTimeDtlText() + 'Z';

    return date + time;
};

Date.prototype.getTimeDtlText = function () {

    function fillZero2(num) {
        return ('0' + num).slice(-2);
    }

    const hours = fillZero2(this.getHours());
    const minutes = fillZero2(this.getMinutes());
    const seconds = fillZero2(this.getSeconds());

    return hours + ":" + minutes + ":" + seconds;
};

Date.prototype.getHourDecTime = function () {
    const hours = this.getHours();
    const minutes = this.getMinutes();

    return hours + (minutes / 60);
};

Date.prototype.getHourDecTimeText = function () {
    const decTime = this.getHourDecTime();

    const hour = ('0' + floor(decTime, 0)).slice(-2);
    const minutes = ('0' + (floor(decTime, -2) * 100)).slice(-2)

    // 例: 0.30, 1.25
    return hour + '.' + minutes;
};

Date.prototype.createTimeTextDate = function (timeDtlText) {
    const date = new Date(this);

    date.setHours(parseInt(timeDtlText.slice(0, 2)));
    date.setMinutes(parseInt(timeDtlText.slice(3, 5)));

    // 秒数以下の時刻指定がある場合は設定
    if (timeDtlText.length >= 8) {
        date.setSeconds(parseInt(timeDtlText.slice(6, 8)));
    } else {
        date.setSeconds(0);
    }

    return date;
};

Date.prototype.createHoursMillSecconds = function(millSecconds) {
    const retDate = new Date(this);
    retDate.setHours(0);
    retDate.setMinutes(0);
    retDate.setSeconds(0);
    retDate.setMilliseconds(millSecconds);

    return retDate;
}