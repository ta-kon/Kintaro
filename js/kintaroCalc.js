﻿'use strict';

function isTime(timeList) {
    const Before = timeList.start.isBefore;
    const After = !timeList.end.isBefore;

    const Halfway = (!Before && !After);

    return { Before: Before, Halfway: Halfway, After: After };
}

function isTimeResult(timeList) {
    const timeResult = isTime(timeList);

    for (let time in timeResult) {
        if (timeResult[time] === true) {
            return time;
        }
    }
}

function LessTime(timeList) {
    const returnTime = {
        Before: timeList.start.date,
        Halfway: timeList.end.date,
        After: timeList.end.date
    };

    const result = isTimeResult(timeList);

    return {
        time: returnTime[result],
        is: result
    };
}

function makeResult(currentDate, limitDate) {
    let timeList = {};

    for (let i in limitDate) {
        const sub = currentDate.subDate(limitDate[i]);

        const result = {
            date: sub.time,
            timeDtlText: sub.time.getTimeDtlText(),
            isBefore: sub.isBefore,
        };

        timeList[i] = result;
    }

    return {
        Less: new LessTime(timeList),
        diffTime: (limitDate.end - limitDate.start),
        timeList: timeList
    };
}

function progressBreakTime(currentDate, breakTime) {
    const now = currentDate;

    const limitDate = breakTime.limitDate(now);

    return {
        break_name: breakTime.name,
        result: makeResult(now, limitDate)
    };
}

function SumBreakTime() {
    let halfwayTime = 0;
    let afterTime = 0;

    return {
        HalfwayTime: halfwayTime,
        AfterTime: afterTime,
        addDiffTime: addDiffTime,
        result: breakTimeResult,
    };

    function breakTimeResult(now) {
        const dateObj = function (millSecconds) {
            return now.createHoursMillSecconds(millSecconds);
        };

        return {
            halfwayTime: dateObj(halfwayTime),
            afterTime: dateObj(afterTime),
            breakTime: dateObj(halfwayTime + afterTime)
        };
    }

    function addDiffTime(containAddWorkTime, result) {
        const diffTime = result.diffTime;
        if (isNaN(diffTime)) {
            throw new Error('休憩時間に数値でないものが挿入されています。');
        }

        const addDiffTime = {
            Before: function () { },
            After: function () {
                afterTime += diffTime;
            },
            Halfway: function () {
                // 勤怠時間に含める時間の場合
                if (containAddWorkTime === true) {
                    return;
                }
                halfwayTime += result.timeList.start.date.getHoursMillSeconds();
            }
        };

        addDiffTime[result.Less.is]();

        return true;
    }
}

function progresTime(currentDate) {
    const BREAK_TIME = KINTARO_MODEL.BREAK_TIME;
    const sum = new SumBreakTime();

    let breakProgres = {};
    for (let breakName in BREAK_TIME) {
        const breakTime = BREAK_TIME[breakName];

        const progres = progressBreakTime(currentDate, breakTime);

        sum.addDiffTime(breakTime.setting.containAddWorkTime, progres.result);

        breakProgres[breakName] = progres;
    }

    const WORK = KINTARO_MODEL.WORK;
    const breakTime = sum.result(currentDate).breakTime;
    const startDate = WORK.time.start.timeTextDate(currentDate);
    const passsStartDate = currentDate.createHoursMillSecconds(currentDate - startDate);
    const workTime = currentDate.createHoursMillSecconds(passsStartDate - breakTime);

    const workProgres = {
        breakTime: breakTime,
        passsStartDate: passsStartDate,
        workTime: workTime
    };

    return {
        workProgres: workProgres,
        breakProgres: breakProgres
    };
}
