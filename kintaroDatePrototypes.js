Date.prototype.removeDateMillSeconds = function () {
    const hours = this.getHours();
    const minutes = (hours * 60) + this.getMinutes();
    const seconds = (minutes * 60) + this.getSeconds();
    const millSecconds = (seconds * 1000) + this.getMilliseconds();

    return millSecconds;
};

Date.prototype.toJSON = function () {
    return this.getFullYear() + '-' + ('0' + (this.getMonth() + 1)).slice(-2) + '-' + ('0' + this.getDate()).slice(-2) + 'T ' +
        ('0' + this.getHours()).slice(-2) + ':' + ('0' + this.getMinutes()).slice(-2) + ':' + ('0' + this.getSeconds()).slice(-2) + 'Z';
};

Date.prototype.getTimeDtlText = function () {

    function fillZero2(num) {
        return ('0' + num).slice(-2);
    }

    const hours = fillZero2(this.getHours());
    const minutes = fillZero2(this.getMinutes());
    const seconds = fillZero2(this.getSeconds());
    const timeText = hours + ":" + minutes;

    return timeText + ":" + seconds;
};

Date.prototype.makeTimeTextDate = function (timeDtlText) {
    const date = new Date(this.getTime());

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