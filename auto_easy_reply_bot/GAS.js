// LINE developersのメッセージ送受信設定に記載のアクセストークン
var ACCESS_TOKEN = 'token';

function doPost(e) {
    var event = JSON.parse(e.postData.contents).events[0];
    // WebHookで受信した応答用Token
    var replyToken = event.replyToken;

    // ユーザ情報を取得
    var userId = event.source.userId;
    var nickname = getUserProfile(userId);

    // シート取得
    var ss = SpreadsheetApp.openById(SpreadsheetApp.getActiveSpreadsheet().getId());
    var sheet = ss.getSheetByName('登録ユーザ一覧');

    // ユーザIDが登録されてなかったら
    if (FindUserId(sheet, userId) =! 0) {

    } 

    // ユーザーにbotがフォローされた場合の処理
    if (event.type == 'follow') {
        followMessage(replyToken);
        // 最終行を取得
        var last_row = findLastRow(sheet, 'A');

        //　書き込む場所を決定する
        var write_cell_a = 'A' + (last_row).toString(10);
        var write_cell_b = 'B' + (last_row).toString(10);


        // データ入力
        sheet.getRange(write_cell_a).setValue(userId);
        sheet.getRange(write_cell_b).setValue(nickname);

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

// メッセージを返す
function sendMessage(replyToken, message) {
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

// profileを取得してくる関数
function getUserProfile(userId) {
    var url = 'https://api.line.me/v2/bot/profile/' + userId;
    var userProfile = UrlFetchApp.fetch(url, {
        'headers': {
            'Authorization': 'Bearer ' + ACCESS_TOKEN,
        },
    })
    return JSON.parse(userProfile).displayName;
}

// 指定列の[最終行の行番号」を返す
// (値が途切れていないことが前提)
function findLastRow(sheet, col) {

    //指定の列を二次元配列に格納する※シート全体の最終行までとする
    var ColValues = sheet.getRange((col + ':' + col)).getValues()

    //二次元配列のなかで、データが存在する要素のlengthを取得する
    var lastRow = ColValues.filter(String).length;

    return lastRow + 1;
}

// UserIdが存在しているかを確認する
function FindUserId(sheet, Id) {
    var dat = sheet.getDataRange().getValues(); //受け取ったシートのデータを二次元配列に取得
 
    for(var i=1;i<dat.length;i++){
      if(dat[i][col-1] === ID){
        return i+1;
      }
    }
    return 0;
}
