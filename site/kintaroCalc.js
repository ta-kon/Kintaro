"use strict";

(function () {
    const MENU = TIME_MODEL.MENU;
    const WORK = TIME_MODEL.WORK;
    const BREAK_TIME = TIME_MODEL.BREAK_TIME;

    $(document).ready(function () {
        initTime();
        initBootstrapMaterialDatePicker();

        setIntervalUpdateProgres();
    });

    function initTime() {
        const timeText = FillDate(new Date()).timeText;

        WORK.realTime.end.tag.val(timeText);
        WORK.realTime.end.tag.text(timeText);

        updateProgresAll();
    }

    function setIntervalUpdateProgres() {

        // 次の1秒までのミリ秒
        const lessMillSecconds = 1000 - new Date().getMilliseconds();

        const waitMillSeconds = setInterval(function () {

            // タイマー停止
            clearInterval(waitMillSeconds);

            // １秒後の表示を更新
            updateProgresAll();

            // タイマーを設定
            setInterval(updateProgresAll, 1000);
        }, lessMillSecconds);
    }

    function initBootstrapMaterialDatePicker() {
        const inputTime = $('.input-time');

        inputTime.bootstrapMaterialDatePicker({
            date: false,
            shortTime: true, // enable AM or PM
            format: 'HH:mm'
        });

        inputTime.change(function () {
            $(this).text($(this).val());
        });
    }

    function updateProgresAll() {
        const now = new Date();

        MENU.nowDate.text(getTimeDtlText(now));
        updateBreakTime(now);
    }

    function FillDate(date) {
        const _Fill = Format.Fill.Zero2;

        const hours = _Fill(date.getHours());
        const minutes = _Fill(date.getMinutes());
        const seconds = _Fill(date.getSeconds());
        const timeText = hours + ":" + minutes;
        const timeDtlText = timeText + ":" + seconds;

        return {
            hours: hours,
            minutes: minutes,
            seconds: seconds,
            timeText: timeText,
            timeDtlText: timeDtlText
        };
    }

    function getTimeDtlText(date) {
        return FillDate(date).timeDtlText;
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
            if (timeResult[time]) {
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
                timeDtlText: getTimeDtlText(sub.time),
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
        let HalfwayTime = 0;
        let AfterTime = 0;

        return {
            HalfwayTime: HalfwayTime,
            AfterTime: AfterTime,

            addDiffTime: function (updateDate, result) {
                const diffTime = result.diffTime;
                if (isNaN(diffTime)) {
                    return;
                }

                const addDiffTime = {
                    Before: function () { },
                    After: function () {
                        AfterTime += diffTime;
                    },
                    Halfway: function () {
                        HalfwayTime += removeDateMillSeconds(result.timeList.start.date);
                    }
                }

                addDiffTime[result.Less.is]();
            },

            result: function (now) {
                const dateObj = function (millSecconds) {
                    return setMillSecconds(now, millSecconds);
                };

                return {
                    halfwayTime: dateObj(HalfwayTime),
                    afterTime: dateObj(AfterTime),
                    breakTime: dateObj(HalfwayTime + AfterTime)
                };
            }
        };
    }

    function viewLessTime(breakProgres) {

        const result = breakProgres.result;

        if (isNaN(result.diffTime)) {
            return "";
        }

        const view = {
            Before: function () {
                return "あと: " + result.timeList.start.timeDtlText;
            },
            Halfway: function () {
                return "残り: " + result.timeList.end.timeDtlText;
            },
            After: function () {
                return "経過: " + result.timeList.end.timeDtlText;
            }
        };

        return view[result.Less.is]();
    }

    function updateBreakTime(now) {
        const progres = progresTime(now);
        viewUpdateProgres(progres);
    }

    function viewUpdateProgres(progres) {
        for (let break_name in BREAK_TIME) {
            const breakTime = BREAK_TIME[break_name];
            const breakProgres = progres.breakProgres[break_name];

            breakTime.progres.html(viewLessTime(breakProgres));
        }

        const workTime = progres.workProgres.workTime;
        setMenuText(workTime);

        $('#debug').text(JSON.stringify(progres.workProgres));
    }

    function setMenuText(workTime) {
        MENU.realTime.text(getTimeDtlText(workTime));
        MENU.realTime_dec.text(Format.HourDecTime(getHourDecTime(workTime)) + 'H');
    }

    function progresTime(currentDate) {

        const sum = SumBreakTime();

        let breakProgres = {};
        for (let break_name in BREAK_TIME) {
            const breakTime = BREAK_TIME[break_name];

            const progres = progressBreakTime(currentDate, breakTime);
            sum.addDiffTime(currentDate, progres.result);

            breakProgres[break_name] = progres;
        }

        const breakTime = sum.result(currentDate).breakTime;
        const startDate = WORK.time.start.timeTextDate(currentDate);
        const passsStartDate = setMillSecconds(currentDate, (currentDate - startDate));
        const workTime = setMillSecconds(currentDate, (passsStartDate - breakTime));

        const workProgres = {
            breakTime: breakTime,
            passsStartDate: passsStartDate,
            workTime: workTime
        }

        return {
            workProgres: workProgres,
            breakProgres: breakProgres
        };
    }

    function getHourDecTime(date) {
        const hours = date.getHours();
        const minutes = date.getMinutes();

        return hours + (minutes / 60);
    }
})();