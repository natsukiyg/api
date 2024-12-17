//Firebase設定
import { initializeApp } 
from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getDatabase, ref, set, onValue } 
from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
import { getAuth, signInWithPopup, signInWithCredential, GoogleAuthProvider, signOut, onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

//Firebase設定情報
const firebaseConfig = {
apiKey: "",
authDomain: "chat-app-taskshare-ver2.firebaseapp.com",
projectId: "chat-app-taskshare-ver2",
storageBucket: "chat-app-taskshare-ver2.firebasestorage.app",
messagingSenderId: "225854912930",
appId: "1:225854912930:web:89d6f8605d484dfa40dafb"
};

const app = initializeApp(firebaseConfig);

// Google Auth認証
const provider = new GoogleAuthProvider();
const auth = getAuth();
provider.addScope("https://www.googleapis.com/auth/calendar"); //Calendar APIのスコープを追加

//ログインボタンのクリックイベント
$("#google-login-btn").on("click", function () {
    signInWithPopup(auth, provider)
        .then((result) => {
            //ユーザー情報取得
            const user = result.user;
            alert(`ようこそ、${user.displayName}さん！`);

            //IDトークンを取得
            result.user.getIdToken().then((idToken) => {
                localStorage.setItem("idToken", idToken); //idTokenをlocalStorageに保存
                console.log("IDトークンを保存しました:", idToken);

                //Google Calendar APIにアクセス
                getGoogleCalendarData(idToken); //Google Calendarのデータを取得

                //遷移先
                location.href = "tasklist.html";
            });
        })
        .catch((error) => {
            console.error("ログインエラー:", error);
            alert("ログインに失敗しました。再試行してください。");
        });
});

//Google Calender APIにアクセスする関数
function getGoogleCalendarData(idToken) {
    //IDトークンをAuthorizationヘッダーにセット
    fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
        method: "GET",
        headers: {
            "Authorization": "Bearer" + idToken //BearerトークンとしてIDトークンを送信
        }
    })
        .then(response => response.json())
        .then(data => {
            console.log("Googleカレンダーのイベント:", data);
            //必要な処理をここで行う
        })
        .catch(error => {
            console.error("Google Calendar APIエラー:", error);
        });
}

const db = getDatabase(app);

// 認証状態の監視
onAuthStateChanged(auth, (user) => {
if (user) {
    // ユーザー情報を表示
    $("#uname").text(user.displayName);
    $("#prof").attr("src", user.photoURL);
    $("#status").fadeOut(500);
} else {
    _redirect(); // ログアウト時のリダイレクト
}
});

// データ登録
$("#send").on("click", function () {
const uid = auth.currentUser.uid;
const msg = {
    title: $("#title").val(),
    text: $("#text").val()
};
const dbRef = ref(db, "users/" + uid + "/memo/" + $("#title").val());
set(dbRef, msg).then(() => {
    alert("データを保存しました");
}).catch((error) => {
    console.error("データ保存エラー:", error);
});
});

// データ取得
$("#title").on("change", function () {
const uid = auth.currentUser.uid;
const dbRef = ref(db, "users/" + uid + "/memo/" + $("#title").val());
onValue(dbRef, (snapshot) => {
    const msg = snapshot.val();
    if (msg) {
        $("#text").val(msg.text);
    }
});
});