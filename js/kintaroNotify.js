window.addEventListener('load', function () {
    if (isIE) {
        removeNotifyBtn();
        return;
    }

    setNotifyBtnText();
});

function removeNotifyBtn() {
    const notifyBtn = document.getElementById('notifyBtn');
    notifyBtn.parentNode.removeChild(notifyBtn);
}

function setNotifyBtnText() {
    document.getElementById('notifyBtn').textContent =
        (Push.Permission.has() ? 'プッシュ通知設定済み' : 'ブラウザにプッシュ通知を設定');
}

function notifyBtn(notifyBtnElement) {
    if (Push.Permission.has()) {
        existsNotify();
    } else {
        setNotify();
    }

    setNotifyBtnText();
}

function setNotify() {
    notify(
        {
            title: 'プッシュ通知を設定しました。',
            body: '休憩時間の開始・終了時に通知されます。(サイトが表示されている場合のみ)',
            timeoutSeconds: 5,
        }
    );
}

function existsNotify() {
    notify(
        {
            title: 'プッシュ通知は設定済みです。',
            body: '休憩時間の開始・終了時に通知されます。(サイトが表示されている場合のみ)',
            timeoutSeconds: 5,
        }
    );
}

function notify(message) {
    // messageのデフォルト値の設定
    message = message || {};
    message.title = message.title || 'Kintaro';
    message.body = message.body || 'Kintaro';
    message.timeoutSeconds = message.timeoutSeconds || 10; // Seconds

    // プッシュ通知を送る
    Push.create(message.title, {
        body: message.body,
        tag: 'kintaro',
        requireInteraction: false,
        timeout: message.timeoutSeconds * 1000, // msec
        onClick: function () {
            window.focus();
            this.close();
        }
    });
}
