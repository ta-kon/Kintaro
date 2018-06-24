"use strict";

const TIME_MODEL = (function () {

    const MENU = {
        nowDate: $('#menu-nowDate'),
        realTime: $('#menu-realTime'),
        realTime_dec: $('#menu-realTime-dec')
    };

    const WORK = {
        time: BreakTime('#workTime'),
    };

    const BREAK_TIME = {
        noon: BreakTime('#breakTime1'),
        evening: BreakTime('#breakTime2'),
        night: BreakTime('#breakTime3'),
        midnight: BreakTime('#breakTime4'),
        other1: BreakTime('#breakTime-other1'),
        other2: BreakTime('#breakTime-other2'),
    }

    function BreakTime(timeName) {

        function timeObj(selector) {
            const timeSelector = $(selector);

            return {
                tag: timeSelector,
                timeTextDate: function (now) {
                    const date = timeTextDate(now, timeSelector.val());

                    if (selector === '#workTime-start' || selector === '#workTime-end') {
                        return date;
                    }

                    const startDate = WORK.time.start.timeTextDate(now);

                    // 00:00 ~ 始業前の場合
                    const isNextDate = (now < startDate);
                    if (isNextDate) {
                        date.setDate(date.getDate() - 1);
                    }

                    return date;
                }
            };
        };

        function timeTextDate(time, timeDtlText) {

            const date = new Date(time);
            date.setHours(parseInt(timeDtlText.slice(0, 2)));
            date.setMinutes(parseInt(timeDtlText.slice(3, 5)));

            if (timeDtlText.length >= 8) {
                date.setSeconds(parseInt(timeDtlText.slice(6, 8)));
            } else {
                date.setSeconds(0);
            }

            return date;
        };

        const start = timeObj(timeName + '-start');
        const end = timeObj(timeName + '-end');

        const limitDate = function (now) {
            return {
                start: start.timeTextDate(now),
                end: end.timeTextDate(now)
            };
        };

        return {
            name: $(timeName + '-name').text(),
            start: start,
            end: end,
            limitDate: limitDate,
            progres: $(timeName)
        };
    };

    return {
        MENU: MENU,
        WORK: WORK,
        BREAK_TIME: BREAK_TIME
    }
})();

const Format = {
    Fill: {
        Zero2: function (num) {
            return ('0' + Number(num)).slice(-2);
        },
        Zero3: function (num) {
            return ('00' + Number(num)).slice(-3);
        }
    },

    HourDecTime: function (numHour) {
        const hour = ('0' + floor(numHour, 0)).slice(-2);
        const minutes = ('0' + (floor(numHour, -2) * 100)).slice(-2)

        return hour + '.' + minutes;
    }
};

function setMillSecconds(date, millSecconds) {
    const retDate = new Date(date);
    retDate.setHours(0);
    retDate.setMinutes(0);
    retDate.setSeconds(0);
    retDate.setMilliseconds(millSecconds);

    return retDate;
}

function removeDateMillSeconds(date) {
    const hours = date.getHours();
    const minutes = (hours * 60) + date.getMinutes();
    const seconds = (minutes * 60) + date.getSeconds();
    const millSecconds = (seconds * 1000) + date.getMilliseconds();

    return millSecconds;
}

function floor(num, digit) {
    const calcDigit = Math.pow(10, -digit);
    const number = num * calcDigit;
    return Math.floor(number) / calcDigit;
}

// debug用項目
Date.prototype.toJSON = function () {
    return this.getFullYear() + '-' + ('0' + (this.getMonth() + 1)).slice(-2) + '-' + ('0' + this.getDate()).slice(-2) + 'T ' +
        ('0' + this.getHours()).slice(-2) + ':' + ('0' + this.getMinutes()).slice(-2) + ':' + ('0' + this.getSeconds()).slice(-2) + 'Z';
}