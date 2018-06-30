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
    const timeText = new Date().getTimeDtlText();

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

function updateProgres(progres) {
    const BREAK_TIME = KINTARO_MODEL.BREAK_TIME;

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

    return (function main() {
        progressText();
        progressTime();
        progressBar();

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

function sanitaize(str) {
    return str.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
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
                text: "あと",
                time: result.timeList.start.timeDtlText,
            };
        },
        Halfway: function () {
            const millSeconds = removeDateMillSeconds(result.timeList.end.date);
            const diffTime = (result.diffTime === 0 ? millSeconds : result.diffTime);
            const rate = Math.abs(floor(((millSeconds / diffTime) * 100), -2));

            return {
                bageClass: 'badge badge-dark',
                text: "残り",
                time: result.timeList.end.timeDtlText,
                progres: makeProgressBar(rate),
            };
        },
        After: function () {
            return {
                bageClass: 'badge badge-pill badge-dark',
                text: "経過",
                time: result.timeList.end.timeDtlText,
            };
        }
    };

    return view[result.Less.is]();
}

function setMenuText(workTime) {
    const MENU = KINTARO_MODEL.MENU;

    MENU.realTime.text(workTime.getTimeDtlText());
    MENU.realTime_dec.text(Format.HourDecTime(workTime.getHourDecTime()) + 'H');
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

    let innerHtml = '';
    innerHtml += '<div class="progress">'
    innerHtml += '<div class="progress-bar progress-bar-striped ';
    innerHtml += sanitaize(type);
    innerHtml += ' progress-bar-animated" role = "progressbar" ';
    innerHtml += 'style = "width: ' + Number(rate) + '%" >';
    innerHtml += '</div ></div >';

    return {
        innerHtml: innerHtml,
        type, type,
        rate: rate
    };
}
