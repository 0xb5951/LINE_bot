// LINE developersのメッセージ送受信設定に記載のアクセストークン
var ACCESS_TOKEN = 'token';

function doPost(e) {
    // WebHookで受信した応答用Token
    var replyToken = JSON.parse(e.postData.contents).events[0].replyToken;
    // ユーザーのメッセージを取得
    var userMessage = JSON.parse(e.postData.contents).events[0].message.text;
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
                'text': userMessage + 'ンゴ',
            }],
        }),
    });
    return ContentService.createTextOutput(JSON.stringify({ 'content': 'post ok' })).setMimeType(ContentService.MimeType.JSON);
}