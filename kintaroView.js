"use strict";

$(document).ready(function () {
    initTime();
    initBootstrapMaterialDatePicker();

    setIntervalUpdateProgres();
});

function updateProgresAll() {
    const now = new Date();
    now.setHours(now.getHours() - 5);

    KINTARO_MODEL.MENU.nowDate.text(KINTARO_CALC.getTimeDtlText(now));

    const progres = KINTARO_CALC.progresTime(now);
    KINTARO_VIEW.viewUpdateProgres(progres);
};

function initTime() {
    const timeText = KINTARO_CALC.FillDate(new Date()).timeText;

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

const KINTARO_VIEW = (function () {
    return {
        viewUpdateProgres: viewUpdateProgres
    };

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
})();


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
    MENU.realTime.text(KINTARO_CALC.getTimeDtlText(workTime));
    MENU.realTime_dec.text(Format.HourDecTime(getHourDecTime(workTime)) + 'H');
}

function getHourDecTime(date) {
    const hours = date.getHours();
    const minutes = date.getMinutes();

    return hours + (minutes / 60);
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

// debug用項目
Date.prototype.toJSON = function () {
    return this.getFullYear() + '-' + ('0' + (this.getMonth() + 1)).slice(-2) + '-' + ('0' + this.getDate()).slice(-2) + 'T ' +
        ('0' + this.getHours()).slice(-2) + ':' + ('0' + this.getMinutes()).slice(-2) + ':' + ('0' + this.getSeconds()).slice(-2) + 'Z';
}