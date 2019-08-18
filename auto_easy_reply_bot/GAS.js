// LINE developersのメッセージ送受信設定に記載のアクセストークン
var ACCESS_TOKEN = 'token';

function test() {
    // シート取得
    var ss = SpreadsheetApp.openById(SpreadsheetApp.getActiveSpreadsheet().getId());
    var sheet = ss.getSheetByName('登録ユーザ一覧');
  
    // ユーザ情報を取得
    var userId = 'gdageageagea2eqr3';
    var nickName = 'teq2432';
    Logger.log(userId);
    Logger.log(nickName);
  
  // ユーザIDが登録されてなかったら
  if (0 == findUserId(sheet, userId)) {
    addNewUserProfile(sheet, userId, nickName);
  }
  sendMessage(replyToken, 'test');
}

function doPost(e) {
    var event = JSON.parse(e.postData.contents).events[0];
    // WebHookで受信した応答用Token
    var replyToken = event.replyToken;

    // ユーザ情報を取得
    var userId = event.source.userId;
    var nickName = getUserProfile(userId);

    // シート取得
    var ss = SpreadsheetApp.openById(SpreadsheetApp.getActiveSpreadsheet().getId());
    var sheet = ss.getSheetByName('登録ユーザ一覧');

    // ユーザIDが登録されてなかったら
    if (0 == findUserId(sheet, userId)) {
        addNewUserProfile(sheet, userId, nickName);
        sendMessage(replyToken, '未登録');
    }
    sendFollowMessage(replyToken); 
    // ユーザーにbotがフォローされた場合の処理
    if (event.type == 'follow') {
        sendFollowMessage(replyToken);
        // 先行体験フォームを出す
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
function sendFollowMessage(replyToken) {
    var sendtext = "「いつでも、どこでも、なんどでも。プロによる楽器のアドバイス」\n\nNOIAB（ノイア）への事前登録が完了しました！\n\nここでは、リリース時のご案内や、先行体験の情報をお届けします! 通知が多いと感じた方は、この画面内のトーク設定より「通知」をOFFにしてみてくださいね\uDBC0\uDC77";
    sendPriorExpText(replyToken, sendtext);
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
                'text': message,
            }],
        }),
    });
}

// userIdとnickNameを登録する
function addNewUserProfile(sheet, userId, nickName) {
    // 最終行を取得
    var lastRow = findLastRow(sheet, 'A');

    //　書き込む場所を決定する
    var writeCellA = 'A' + (lastRow).toString(10);
    var writeCellB = 'B' + (lastRow).toString(10);

    sheet.getRange(writeCellA).setValue(userId);
    sheet.getRange(writeCellB).setValue(nickName);
}
 
// ユーザーネームを取得してくる関数
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
    var colValues = sheet.getRange((col + ':' + col)).getValues()
    //二次元配列のなかで、データが存在する要素のlengthを取得する
    var lastRow = colValues.filter(String).length;

    return lastRow + 1;
}

// userIdが存在しているかを確認する
function findUserId(sheet,userId) {
    var date = sheet.getDataRange().getValues(); //受け取ったシートのデータを二次元配列に取得
 
    for(var i=1;i<date.length;i++){
      if(date[i][0] === userId){
        return 1+i;
      }
    }
    return 0;
}

// 先行体験のリッチテキスト送信
function sendPriorExpText(replyToken, sendtext) {
    var url = 'https://api.line.me/v2/bot/message/reply';
    var postData = {
        "replyToken": replyToken,
        "messages": [
            {
                'type': 'text',
                'text': sendtext,
            },
          {
          "type": "flex",
          "altText": "flex box",
          "contents":
          {
            "type": "bubble",
            "body": {
              "type": "box",
              "layout": "vertical",
              "spacing": "md",
              "contents": [
                {
                  "type": "text",
                  "text": "NOIABの先行体験をご希望の方はボタンをクリック！当選した方には、先行体験のご案内を送らさせていただきます！"
                },
                {
                  "type": "button",
                  "style": "primary",
                  "action": {
                    "type": "uri",
                    "label": "先行体験に申し込む",
                    "uri": "https://example.com"
                  }
                }
              ]
            }
          }
        }]
      };

    UrlFetchApp.fetch(url, {
        'headers': {
            'Content-Type': 'application/json; charset=UTF-8',
            'Authorization': 'Bearer ' + ACCESS_TOKEN,
        },
        'method': 'post',
        'payload': JSON.stringify(postData),
    });
}