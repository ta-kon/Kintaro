// IE11の場合は、プッシュ通知が行えず、push.jsで通知可能判定となってしまうため、修正する。
const isIE = (window.navigator.userAgent.indexOf('Trident') !== -1);

function floor(num, digit) {
    const calcDigit = Math.pow(10, -digit);
    const number = num * calcDigit;
    return Math.floor(number) / calcDigit;
}

function fillZero2(num) {
    return ('0' + parseInt(num)).slice(-2);
}

function sanitaize(str) {
    return str.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

Date.prototype.getHoursMillSeconds = function () {
    const hours = this.getHours();
    const minutes = (hours * 60) + this.getMinutes();
    const seconds = (minutes * 60) + this.getSeconds();
    const millSecconds = (seconds * 1000) + this.getMilliseconds();

    return millSecconds;
};

Date.prototype.getRemoveMillSeconds = function () {
    return Math.floor(this.getTime() / 1000) * 1000;
};

Date.prototype.getTimeDtlText = function () {
    const hours = fillZero2(this.getHours());
    const minutes = fillZero2(this.getMinutes());
    const seconds = fillZero2(this.getSeconds());

    return hours + ':' + minutes + ':' + seconds;
};

Date.prototype.getTimeText = function () {
    const hours = fillZero2(this.getHours());
    const minutes = fillZero2(this.getMinutes());

    return hours + ':' + minutes;
};

Date.prototype.getHourDecTime = function () {
    const hours = this.getHours();
    const minutes = this.getMinutes();

    return hours + (minutes / 60);
};

Date.prototype.getHourDecTimeText = function () {
    const decTime = this.getHourDecTime();

    const hour = fillZero2(Math.floor(decTime));

    function getMinutesText() {
        // 0.5 50,  0.583 58.3,  0.0583 5.83
        return new Decimal(decTime).mod(1).times(100).toNumber();
    }

    const minutes = fillZero2(Math.floor(getMinutesText()));

    // 例: 0.30, 1.25
    return hour + '.' + minutes + 'H';
};

Date.prototype.createTimeTextDate = function (timeDtlText) {
    const date = new Date(this);

    // 時刻を設定する文字列が不足している場合
    if (timeDtlText === undefined || timeDtlText.length < 5) {
        return date;
    }

    date.setHours(parseInt(timeDtlText.slice(0, 2)));
    date.setMinutes(parseInt(timeDtlText.slice(3, 5)));

    // 秒数以下の時刻指定がある場合は設定
    if (timeDtlText.length >= 8) {
        date.setSeconds(parseInt(timeDtlText.slice(6, 8)));
    } else {
        date.setSeconds(0);
    }

    date.setMilliseconds(0);

    return date;
};

Date.prototype.createHoursMillSecconds = function (millSecconds) {
    const retDate = new Date(this);
    retDate.setHours(0, 0, 0);
    retDate.setMilliseconds(millSecconds);

    return retDate;
};

Date.prototype.subDate = function (limitDate) {
    const diffMillSecconds = Math.abs(this.getRemoveMillSeconds() - limitDate.getRemoveMillSeconds());
    const subTime = this.createHoursMillSecconds(diffMillSecconds);

    return { time: subTime, diffMillSecconds: diffMillSecconds, isBefore: (this < limitDate) };
};

Date.prototype.toJSON = function () {
    const date = this.getFullYear() + '-' + fillZero2((this.getMonth() + 1)) + '-' + fillZero2(this.getDate()) + 'T ';
    const time = this.getTimeDtlText() + 'Z';

    return date + time;
};
