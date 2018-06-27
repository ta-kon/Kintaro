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

        WORK.time.end.tag.val(timeText);
        WORK.time.end.tag.text(timeText);

        updateProgresAll();
    }

    function setIntervalUpdateProgres() {

        // 次の1秒までのミリ秒
        const lessMillSecconds = 1000 - new Date().getMilliseconds();

        // ミリ秒単位で時間を合わせるため、起動時は時間を修正
        setTimeout(function () {

            // １秒後の表示を更新
            updateProgresAll();

            // タイマーを設定
            setInterval(updateProgresAll, 1000);
        }, lessMillSecconds);
    }

    function initBootstrapMaterialDatePicker() {
        const inputTime = $('body').find('.input-time');

        inputTime.bootstrapMaterialDatePicker({
            date: false,
            shortTime: true, // enable AM or PM
            format: 'HH:mm',
        });

        inputTime.change(function () {
            updateProgresAll();
        });
    }

    function updateProgresAll() {
        const now = new Date();
        now.setHours(now.getHours() - 11);

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
        let halfwayTime = 0;
        let afterTime = 0;

        return {
            HalfwayTime: halfwayTime,
            AfterTime: afterTime,

            addDiffTime: function (updateDate, result) {
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
            },

            result: function (now) {
                const dateObj = function (millSecconds) {
                    return setMillSecconds(now, millSecconds);
                };

                return {
                    halfwayTime: dateObj(halfwayTime),
                    afterTime: dateObj(afterTime),
                    breakTime: dateObj(halfwayTime + afterTime)
                };
            }
        };
    }

    function updateBreakTime(now) {
        const progres = progresTime(now);
        viewUpdateProgres(progres);
    }

    function viewUpdateProgres(progres) {
        for (let break_name in BREAK_TIME) {
            const breakTime = BREAK_TIME[break_name];
            const breakProgres = progres.breakProgres[break_name];

            const progresHtml = getProgressText(breakProgres);

            updateProgress(breakTime.progres, progresHtml);
        }

        const workTime = progres.workProgres.workTime;
        setMenuText(workTime);

        $('#debug').text(JSON.stringify(progres.workProgres));
    }

    function updateProgress(breakTimeProgress, progresHtml) {
        const setFunction = {
            progressBar: function () {
                const progressElement = breakTimeProgress.find('.progress');
                const existsProgressElement = (progressElement[0] !== undefined);

                if (progresHtml === undefined || progresHtml.progres !== undefined) {

                    if (existsProgressElement) {
                        progressElement.remove();
                    }
                    return;
                }

                if (!existsProgressElement) {
                    breakTimeProgress.append(progresHtml.progres.innerHtml);

                    return;
                }

                // 小要素の取得
                const progressBar = progressElement.find('.progress-bar');
                progressBar.css('width', Number(progresHtml.progres.rate) + '%');

                const className = 'progress-bar progress-bar-striped '
                    + sanitaize(progresHtml.progres.type)
                    + ' progress-bar-animated';
                progressBar.removeClass();
                progressBar.addClass(className);
            },

            progressTime: function () {
                const progressTime = breakTimeProgress.find('*[name="progress-time"]');
                progressTime.text(progresHtml !== undefined ? progresHtml.time : undefined);
            },

            progressText: function () {
                const progressText = breakTimeProgress.find('*[name="progress-text"]');
                // 経過　残り　あと [経過: 05:14:36]
                progressText.removeClass();

                if (progresHtml === undefined) {
                    progressText.text();
                    return;
                }

                progressText.addClass(progresHtml.bageClass);
                progressText.text(progresHtml.text);
            },
        };

        setFunction.progressText();
        setFunction.progressTime();
        setFunction.progressBar();
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
        };

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