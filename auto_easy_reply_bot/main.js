// LINE developersのメッセージ送受信設定に記載のアクセストークン
var ACCESS_TOKEN = 'token';

function doPost(e) {
    var event = JSON.parse(e.postData.contents).events[0];
    var replyToken = event.replyToken;

    // シート取得
    var ss = SpreadsheetApp.openById(SpreadsheetApp.getActiveSpreadsheet().getId());
    var sheet = ss.getSheetByName('登録ユーザ一覧');

    // WebHookで受信した応答用Token
    var replyToken = JSON.parse(e.postData.contents).events[0].replyToken;

    // ユーザーにbotがフォローされた場合の処理
    if (event.type == 'follow') {
        followMessage(replyToken);
    }

    // テキストが送信された時の処理
    if (event.type == 'message') {
        // ユーザーのメッセージを取得
        var userMessage = JSON.parse(e.postData.contents).events[0].message.text;


        sendMessage(replyToken, userMessage);
    }
    return ContentService.createTextOutput(JSON.stringify({ 'content': 'post ok' })).setMimeType(ContentService.MimeType.JSON);
}


// 登録時のアンケート導線
function followMessage(replyToken) {
    var sendtext = "NOIABの先行体験をご希望の方は下記をご記入ください！\n \
    楽器やレベルで対象に選出されましたら別途先行体験のご案内を送らさせていただきます。";

    sendMessage(replyToken, sendtext);
    return 0;
}

function sendMessage(replyToken, message) {
    // 応答メッセージ用のAPI URL
    var url = 'https://api.line.me/v2/bot/message/reply';

    UrlFetchApp.fetch(url, {
        'headers': {
            'Content-Type': 'application/json; charset=UTF-8',
            'Authorization': 'Bearer ' + ACCESS_TOKEN,
        },
        'method': 'post',
        'payload': JSON.stringify({
            'replyToken': replyToken,
            'messages': [{
                'type': 'text',
                'text': message + 'ンゴ',
            }],
        }),
    });
    return 0;
}