"use strict";

$(document).ready(function () {
    initTime();
    initBootstrapMaterialDatePicker();

    setIntervalUpdateProgres();
});

function updateProgresAll() {
    const now = new Date();
    now.setHours(12);

    KINTARO_MODEL.MENU.nowDate.text(now.getTimeDtlText());

    const progres = progresTime(now);
    updateProgres(progres);
};

function initTime() {
    const timeText = new Date().getTimeText();

    const WORK = KINTARO_MODEL.WORK;
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
    const inputTime = $('.input-time');

    inputTime.bootstrapMaterialDatePicker({
        date: false,
        shortTime: true, // enable AM or PM
        format: 'HH:mm',
    });

    inputTime.change(function () {
        updateProgresAll();
    });
}

function updateProgres(progres) {
    const BREAK_TIME = KINTARO_MODEL.BREAK_TIME;

    for (let break_name in BREAK_TIME) {
        const breakTime = BREAK_TIME[break_name];
        const breakProgres = progres.breakProgres[break_name];

        const progresHtml = getProgressText(breakProgres);

        updateProgress(breakTime.progres, progresHtml);
    }

    setMenuText(progres.workProgres.workTime);

    const nowProgress = getNowBreakTimeProgres(progres);
    $('#menu-progress-title').text(nowProgress.break_name);
    // end or start で調整が必要
    $('#menu-progress').text(getLessTimeIsText(nowProgress.result.Less.is) + nowProgress.result.timeList.end.timeDtlText);
}

function getNowBreakTimeProgres(progres) {
    const breakProgres = progres.breakProgres;

    let lowDiffTimeAfterResult = undefined;
    let lowDiffTimeBeforeResult = undefined;

    for (let breakTime in breakProgres) {
        const breakTimeResult = breakProgres[breakTime];

        switch (breakTimeResult.result.Less.is) {
            case 'Halfway':
                return breakTimeResult;
            case 'After':
                if (lowDiffTimeAfterResult === undefined || breakTimeResult.result.diffTime < lowDiffTimeAfterResult.result.diffTime) {
                    lowDiffTimeAfterResult = breakTimeResult;
                }
                break;
            case 'Before':
                if (lowDiffTimeBeforeResult === undefined || breakTimeResult.result.diffTime < lowDiffTimeBeforeResult.result.diffTime) {
                    lowDiffTimeBeforeResult = breakTimeResult;
                }
                break;
            default:
                throw new Error('time Is Error ' + JSON.stringify(progres));
        }
    }

    return (lowDiffTimeBeforeResult !== undefined ? lowDiffTimeBeforeResult : lowDiffTimeAfterResult);
}

function updateProgress(breakTimeProgress, progresHtml) {

    return (function main() {
        progressText();
        progressTime();
        progressBar();

        // 特に戻り値の指定なし
        return undefined;
    })();

    function progressBar() {
        const progressElement = breakTimeProgress.find('.progress');
        const existProgressElement = (progressElement[0] !== undefined);

        if (progresHtml === undefined || progresHtml.progres === undefined) {

            if (existProgressElement) {
                progressElement.remove();
            }
            return;
        }

        if (!existProgressElement) {
            breakTimeProgress.append(progresHtml.progres.outerHTML);

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
    }

    function progressTime() {
        const progressTime = breakTimeProgress.find('*[name="progress-time"]');
        progressTime.text(progresHtml !== undefined ? progresHtml.time : undefined);
    }

    function progressText() {
        const progressText = breakTimeProgress.find('*[name="progress-text"]');
        // 経過　残り　あと [経過: 05:14:36]
        progressText.removeClass();

        if (progresHtml === undefined) {
            progressText.text();
            return;
        }

        progressText.addClass(progresHtml.bageClass);
        progressText.text(progresHtml.text);
    }
}

function getProgressText(breakProgres) {

    const result = breakProgres.result;

    if (isNaN(result.diffTime)) {
        return undefined;
    }

    const view = {
        Before: function () {
            return {
                bageClass: 'badge badge-dark',
                time: result.timeList.start.timeDtlText,
            };
        },
        Halfway: function () {
            const millSeconds = result.timeList.end.date.getHoursMillSeconds();
            const diffTime = (result.diffTime === 0 ? millSeconds : result.diffTime);
            const rate = Math.abs(floor(((millSeconds / diffTime) * 100), -2));

            return {
                bageClass: 'badge badge-dark',
                time: result.timeList.end.timeDtlText,
                progres: makeProgressBar(rate),
            };
        },
        After: function () {
            return {
                bageClass: 'badge badge-pill badge-dark',
                time: result.timeList.end.timeDtlText,
            };
        }
    };

    let progressText = view[result.Less.is]();
    progressText.text = getLessTimeIsText(result.Less.is);

    return progressText;
}

function getLessTimeIsText(lessTimeIs) {

    const timeText = {
        Before: "あと",
        Halfway: "残り",
        After: "経過"
    };

    return timeText[lessTimeIs];
}

function setMenuText(workTime) {
    const MENU = KINTARO_MODEL.MENU;

    MENU.realTime.text(workTime.getTimeDtlText());
    MENU.realTime_dec.text(workTime.getHourDecTimeText() + 'H');
}

function makeProgressBar(rate) {
    const progressType = [
        'bg-danger',
        'bg-warning',
        'bg-info',
        'bg-success'
    ];

    const rateType = (function () {
        // 100%以上の場合
        // progressType.lengthが得られ、配列外を参照してしまうため。
        if (rate >= 100) {
            return (progressType.length - 1);
        }

        const rateTypeSize = (100 / progressType.length);
        return Math.floor(rate / rateTypeSize);
    })();

    return makeProgressInnerHtml(progressType[rateType], rate);
}

function makeProgressInnerHtml(type, rate) {

    const progress = document.createElement('div');
    progress.className = 'progress';

    const progressBar = document.createElement('div');
    progress.appendChild(progressBar);

    progressBar.className = 'progress-bar progress-bar-striped progress-bar-animated ' + sanitaize(type);
    progressBar.setAttribute('role', 'progressbar');
    progressBar.setAttribute('style', 'width: ' + Number(rate) + ' %;');

    return {
        outerHTML: progress.outerHTML,
        type: type,
        rate: rate
    };
}
