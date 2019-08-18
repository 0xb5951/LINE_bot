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
  setPreExpFlag(sheet, userId);
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
    }

    // 先行体験ボタンが押されたときの処理
    if (event.type == 'postback' && event.postback.data == "pushButton") {
        setPreExpFlag(sheet, userId);
        sendMessage(replyToken, "使っている楽器を教えて！");
    }

    // ユーザーにbotがフォローされた場合の処理
    if (event.type == 'follow') {
        sendFollowMessage(replyToken);
    }

    // テキストが送信された時の処理
    if (event.type == 'message') {
        // ユーザーのメッセージを取得
        var userMessage = JSON.parse(e.postData.contents).events[0].message.text;

        // 先行体験入力中かつ入力完了していないなら
        if (getPreExpStatus(sheet, userId) == 1 && checkFormEndFlag(sheet, userId) == 0 ) {
            
            // 住所が未入力
            if (getPreExpPref(sheet, userId) == 0 ) {
                // 楽器の情報を書き込む
                sendMessage(replyToken, "居住地教えてください。(都道府県のみ)");
            }

            // 経験年数が未入力
            if (getPreExpYear(sheet, userId) == 0 ) {
                // 住所の情報を書き込む
                sendMessage(replyToken, "楽器の経験年数を教えてください。");
            }
            
            // 今の悩みが未入力
            if (getPreExpIssue(sheet, userId) == 0 ) {
                // 経験年数の情報を書き込む
                sendMessage(replyToken, "楽器の経験年数を教えてください。");
            }

            // すべての項目が入力されている
            if (getPreExpInstu(sheet, userId) && getPreExpPref(sheet, userId) && getPreExpYear(sheet, userId) && getPreExpIssue(sheet, userId)){
                // 登録完了フラグをONにする
                setFormEndFlag(sheet, userId);
                // 完了メッセージを送信する
                sendMessage(replyToken, "ご回答ありがとうございます！以上で先行体験申し込みは完了です！当選連絡までしばらくお待ちください！");
            }
        }


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

// 先行体験申し込みフラグを立てる
function setPreExpFlag(sheet, userId) {
    var writeRow = findUserId(sheet, userId);
  var writeCell = 'C' + (writeRow).toString(10);
  
    sheet.getRange(writeCell).setValue(1);
}

// 先行体験フラグが立っているか
function getPreExpStatus(sheet, userId) {
    var targetRow = findUserId(sheet, userId);
    var targetCell = 'C' + (targetRow).toString(10);

    if (sheet.getRange(targetCell).isBlank()) {
        return 0;
    }
    return 1;
}

// 登録完了フラグを立てる
function setFormEndFlag(sheet, userId) {
    var writeRow = findUserId(sheet, userId);
  var writeCell = 'I' + (writeRow).toString(10);
  
    sheet.getRange(writeCell).setValue(1);
}

// 登録完了フラグが立っているか
function checkFormEndFlag(sheet, userId) {
    var writeRow = findUserId(sheet, userId);
    var targetCell = 'I' + (writeRow).toString(10);
  
    if (sheet.getRange(targetCell).isBlank()) {
        return 0;
    }
    return 1;
}

// 楽器が入力されているか
function getPreExpInstu(sheet, userId) {
    var targetRow = findUserId(sheet, userId);
    var targetCell = 'D' + (targetRow).toString(10);

    if (sheet.getRange(targetCell).isBlank()) {
        return 0;
    }
    return 1;
}

// 都道府県が入力されているか
function getPreExpPref(sheet, userId) {
    var targetRow = findUserId(sheet, userId);
    var targetCell = 'E' + (targetRow).toString(10);

    if (sheet.getRange(targetCell).isBlank()) {
        return 0;
    }
    return 1;
}

// 経験年数が入力されているか
function getPreExpYear(sheet, userId) {
    var targetRow = findUserId(sheet, userId);
    var targetCell = 'F' + (targetRow).toString(10);

    if (sheet.getRange(targetCell).isBlank()) {
        return 0;
    }
    return 1;
}

// 悩みが入力されているか
function getPreExpIssue(sheet, userId) {
    var targetRow = findUserId(sheet, userId);
    var targetCell = 'G' + (targetRow).toString(10);

    if (sheet.getRange(targetCell).isBlank()) {
        return 0;
    }
    return 1;
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
          "altText": "NOIABの先行体験をご希望の方はボタンをクリック！当選した方には、先行体験のご案内を送らさせていただきます！",
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
                    "type": "postback",
                    "label": "先行体験に申し込む",
                    "data" : "pushButton"
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