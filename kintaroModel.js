"use strict";

const KINTARO_MODEL = {
    MENU: MENU(),
    WORK: WORK(),
    BREAK_TIME: BREAK_TIME()
};

function MENU() {
    return {
        nowDate: $('#menu-nowDate'),
        realTime: $('#menu-realTime'),
        realTime_dec: $('#menu-realTime-dec')
    };
}

function WORK() {
    return {
        time: BreakTime('#workTime'),
    };
}

function BREAK_TIME() {
    return {
        noon: BreakTime('#breakTime1'),
        evening: BreakTime('#breakTime2'),
        night: BreakTime('#breakTime3'),
        midnight: BreakTime('#breakTime4'),
        other1: BreakTime('#breakTime-other1'),
        other2: BreakTime('#breakTime-other2'),
    };
}

function BreakTime(timeName) {
    const start = timeObj(timeName + '-start');
    const end = timeObj(timeName + '-end');

    return {
        name: $(timeName + '-name').text(),
        start: start,
        end: end,
        limitDate: limitDate,
        progres: $(timeName)
    };

    function limitDate(now) {
        return {
            start: start.timeTextDate(now),
            end: end.timeTextDate(now)
        };
    };

    function timeObj(selector) {
        const timeSelector = $(selector);

        return {
            tag: timeSelector,
            timeTextDate: function (now) {

                const date = now.createTimeTextDate(timeSelector.val());
                const workTime = KINTARO_MODEL.WORK.time;

                if (selector === '#workTime-start' || selector === '#workTime-end') {
                    return date;
                }

                const startDate = KINTARO_MODEL.WORK.time.start.timeTextDate(now);

                // 00:00 ~ 始業前の場合
                const isNextDate = (now < startDate);
                if (isNextDate) {
                    date.setDate(date.getDate() - 1);
                }

                return date;
            }
        };
    }
}

const Format = {
    Fill: {
        Zero2: function (num) {
            return ('0' + Number(num)).slice(-2);
        },
        Zero3: function (num) {
            return ('00' + Number(num)).slice(-3);
        }
    },
};

function floor(num, digit) {
    const calcDigit = Math.pow(10, -digit);
    const number = num * calcDigit;
    return Math.floor(number) / calcDigit;
}
