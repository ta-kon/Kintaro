'use strict';

const KINTARO_MODEL = {
    MENU: new MENU(),
    WORK: new WORK(),
    BREAK_TIME: new BREAK_TIME(),
};

function MENU() {
    return {
        nowDate: $('#menu-nowDate'),
        realTime: $('#menu-realTime'),
        realTime_dec: $('#menu-realTime-dec'),
    };
}

function WORK() {
    return {
        time: new BreakTime({ timeName: '#workTime' }),
    };
}

function BREAK_TIME() {
    return {
        noon: new BreakTime({ timeName: '#breakTime1', containAddWorkTime: false }),
        evening: new BreakTime({ timeName: '#breakTime2', containAddWorkTime: false }),
        night: new BreakTime({ timeName: '#breakTime3', containAddWorkTime: true }),
        midnight: new BreakTime({ timeName: '#breakTime4', containAddWorkTime: true }),
        other1: new BreakTime({ timeName: '#breakTime-other1', containAddWorkTime: false }),
        other2: new BreakTime({ timeName: '#breakTime-other2', containAddWorkTime: false }),
    };
}

function BreakTime(breakTimeSetting) {
    const timeName = breakTimeSetting.timeName;

    const start = timeObj(timeName + '-start');
    const end = timeObj(timeName + '-end');

    return {
        name: $(timeName + '-name').text(),
        start: start,
        end: end,
        limitDate: limitDate,
        progres: $(timeName),
        setting: breakTimeSetting,
    };

    function limitDate(now) {
        return {
            start: start.timeTextDate(now),
            end: end.timeTextDate(now)
        };
    }

    function timeObj(selector) {
        const timeSelector = $(selector);

        return {
            tag: timeSelector,
            timeTextDate: function (now) {
                const date = now.createTimeTextDate(timeSelector.val());

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
