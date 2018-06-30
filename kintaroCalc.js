"use strict";

function getTimeDtlText(date) {
    return date.getTimeDtlText();
}

function removeMillSec(date) {
    return floor((date.getTime() / 1000), 0) * 1000;
}

function subDate(currentDate, limitDate) {

    const diffMillSecconds = Math.abs(removeMillSec(currentDate) - removeMillSec(limitDate));
    const subTime = setMillSecconds(currentDate, diffMillSecconds)

    return { time: subTime, isBefore: (currentDate < limitDate) };
}

function isTime(timeList) {

    const Before = timeList.start.isBefore;
    const After = !timeList.end.isBefore;

    const Halfway = (!Before && !After);

    return { Before: Before, Halfway: Halfway, After: After }
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
        Before: timeList.start.time,
        Halfway: timeList.end.time,
        After: timeList.end.time
    }

    const result = isTimeResult(timeList);

    return {
        time: returnTime[result],
        is: result
    };
}

function makeResult(currentDate, limitDate) {
    let timeList = {};

    for (let i in limitDate) {
        const sub = subDate(currentDate, limitDate[i]);

        const result = {
            date: sub.time,
            timeDtlText: sub.time.getTimeDtlText(),
            isBefore: sub.isBefore,
        };

        timeList[i] = result;
    }

    return {
        Less: LessTime(timeList),
        diffTime: (limitDate.end - limitDate.start),
        timeList: timeList
    };
}

function progressBreakTime(currentDate, time) {
    const now = currentDate;

    const limitDate = time.limitDate(now);

    return {
        break_name: time.name,
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
            return setMillSecconds(now, millSecconds);
        };

        return {
            halfwayTime: dateObj(halfwayTime),
            afterTime: dateObj(afterTime),
            breakTime: dateObj(halfwayTime + afterTime)
        };
    }

    function addDiffTime(result) {
        const diffTime = result.diffTime;
        if (isNaN(diffTime)) {
            return false;
        }

        const addDiffTime = {
            Before: function () { },
            After: function () {
                afterTime += diffTime;
            },
            Halfway: function () {
                halfwayTime += removeDateMillSeconds(result.timeList.start.date);
            }
        }

        addDiffTime[result.Less.is]();

        return true;
    }
}

function progresTime(currentDate) {

    const BREAK_TIME = KINTARO_MODEL.BREAK_TIME;
    const sum = SumBreakTime();

    let breakProgres = {};
    for (let break_name in BREAK_TIME) {
        const breakTime = BREAK_TIME[break_name];

        const progres = progressBreakTime(currentDate, breakTime);
        sum.addDiffTime(progres.result);

        breakProgres[break_name] = progres;
    }

    const WORK = KINTARO_MODEL.WORK;
    const breakTime = sum.result(currentDate).breakTime;
    const startDate = WORK.time.start.timeTextDate(currentDate);
    const passsStartDate = setMillSecconds(currentDate, (currentDate - startDate));
    const workTime = setMillSecconds(currentDate, (passsStartDate - breakTime));

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