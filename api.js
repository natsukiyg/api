// Firebase設定
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    getDoc,
    getDocs,
    deleteDoc,
    serverTimestamp,
    query,
    orderBy,
    onSnapshot,
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
//FirebaseAuth設定
import { getAuth, signInWithPopup,signInWithCredential, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

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

//ログインボタンのクリックイベント
$("#google-login-btn").on("click", function () {
    signInWithPopup(auth, provider)
        .then((result) => {
            //ユーザー情報取得
            const user = result.user;
            alert(`ようこそ、${user.displayName}さん！`);
            //遷移先
            location.href = "expense.html";
        })
        .catch((error) => {
            console.error("ログインエラー:", error);
            alert("ログインに失敗しました。再試行してください。");
        });
});

// DOMが読み込まれた後に実行（サイドバー）
document.addEventListener("DOMContentLoaded", function() {
    const toggleButton = document.getElementById("toggle-sidebar");
    const sidebar = document.getElementById("sidebar");

    if (toggleButton && sidebar) {
        console.log("Sidebar and button found"); //サイドバーとボタンが見つかれば表示される
        toggleButton.addEventListener("click", function () {
            //サイドバーの開閉を切り替える
            sidebar.classList.toggle("open");  // "open"クラスをトグル
            //サイドバーが開いている場合、ボタンの位置を右にスライド
            if (sidebar.classList.contains("open")) {
                toggleButton.style.left = "250px";
                toggleButton.textContent = "＜"; //サイドバーが開いている場合は「＜」の表記にする
            } else {
                toggleButton.style.left = "0px";
                toggleButton.textContent = "＞"; //サイドバーが閉じている時は「＞」の表記にする
            }
        });
    }
});

// Firebase初期化
//const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 日時を見やすい形式に変換する関数
function convertTimestampToDatetime(timestamp) {
    //if (!timestamp || !timestamp.seconds) {
    //    return "Invalid timestamp"; //無効なtimestampの場合のデフォルト値を返す
    //}
    const _d = timestamp ? new Date(timestamp.seconds * 1000) : new Date();
    const Y = _d.getFullYear();
    const m = (_d.getMonth() + 1).toString().padStart(2, '0');
    const d = _d.getDate().toString().padStart(2, '0');
    const H = _d.getHours().toString().padStart(2, '0');
    const i = _d.getMinutes().toString().padStart(2, '0');
    const s = _d.getSeconds().toString().padStart(2, '0');
    return `${Y}/${m}/${d} ${H}:${i}:${s}`;
}

// 新しいタスクをFirestoreに追加
function addTask() {
    const taskName = document.getElementById("task-name").value;
    const taskDescription = document.getElementById("task-description").value;
    const taskDueDate = document.getElementById("task-due-date").value;
    const taskManager = document.getElementById("task-manager").value;

    //入力項目が全て揃っているか確認する
    if (!taskName || !taskDescription || !taskDueDate || !taskManager) {
        alert("すべての項目を入力してください！");
        return;
    }
    
    const taskData = {
        name: taskName,
        description: taskDescription,
        dueDate: taskDueDate,
        manager: taskManager,
    };

    //Firestoreにタスクデータを追加する
    addDoc(collection(db, "tasks"), taskData)
        .then(() => {
            console.log("Task added successfully!");// 新しいタスクをリストに表示

            //入力欄をリセットする
            document.getElementById("task-name").value = "";
            document.getElementById("task-description").value = "";
            document.getElementById("task-due-date").value = "";
            document.getElementById("task-manager").value = "";
        })
        .catch((error) => {
            console.error("Error adding task: ", error);
        });
}

//「タスク追加」をクリックしたらタスクリストに追加
document.getElementById("add-task").addEventListener("click", addTask);


// タスク一覧を取得してリストに表示
function loadTasks() {
    const taskListElement = document.getElementById("task-items");
    taskListElement.innerHTML = ""; //既存のタスクリストをクリア

    // Firestoreからタスクデータを取得
    const tasksRef = collection(db, "tasks");
    getDocs(tasksRef).then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const task = doc.data();
            const taskId = doc.id; //タスクIDを取得
            const taskItem = document.createElement("div");
            taskItem.classList.add("task-items");
            taskItem.textContent = task.name; //タスク名表示

            //削除ボタンを作成
            const deleteButton = document.createElement("button");
            deleteButton.classList.add("delete-task-btn");

            //削除ボタンのクリックイベント
            deleteButton.addEventListener("click", (event) => {
                event.stopPropagation(); //クリックした時に親要素のクリックイベントを止める
                deleteTask(taskId); //クリックしたタスクを削除
            });

            // タスクをクリックした時に詳細を表示する
            taskItem.addEventListener("click", () => {
                showTaskDetails(taskId); //タスクIDを渡す
            }); 

            //タスクアイテムにタスク名と削除ボタンを追加する
            taskItem.appendChild(deleteButton);

            //タスクリストに追加
            taskListElement.appendChild(taskItem);
        });
    });
}

//Firestoreからタスクを削除する関数
function deleteTask(taskId) {
    const taskRef = doc(db, "tasks", taskId); //削除対象のタスク参照を作成
    deleteDoc(taskRef)
        .then(() => {
            console.log("Task deleted successfully");
        })
        .catch((error) => {
            console.log("Error deleting task", error);
        });
}

// タスク詳細を右側に表示する
function showTaskDetails(taskId) {
    console.log("Showing details for task", taskId); //デバッグ用ログ
    const taskRef = doc(db, "tasks", taskId);

    //getDoc関数を使用して特定のドキュメントを取得
    getDoc(taskRef).then((docSnap) => {
        if (docSnap.exists()) {
            const task = docSnap.data();
            const taskDetailContent = document.getElementById("task-detail-content");
            const chatList = document.getElementById("chat-list");
            
            //背景画像を表示するクラスを追加する
            taskDetailContent.classList.add("show-background");

            //タスク詳細を表示する
            taskDetailContent.innerHTML = `
                <h3>${task.name}</h3>
                <p>${task.description}</p>
                <p>期限：${task.dueDate}</p>
                <p>担当者：${task.manager}</p>
            `;

            //タスクIDをデータ属性として保存
            taskDetailContent.setAttribute("data-task-id", taskId);

            //チャットリストをリセット（他のタスクのチャット内容を表示させない）
            chatList.innerHTML = "";

            //チャットメッセージを読み込む
            loadChatMessages(taskId);

            //メッセージ送信ボタンのイベントリスナー
            document.getElementById("send-chat").addEventListener("click", () => {
                //                const taskId = document.getElementById("task-detail-content").getAttribute("data-task-id");
                sendChatMessage(taskId);
            });
        }
    }).catch((error) => {
        console.log("Error getting task details:", error);
    });
}

//タスク詳細に紐づけられたチャットメッセージを読み込む
function loadChatMessages(taskId) {
    const chatList = document.getElementById("chat-list");
//    chatList.innerHTML = ""; //既存のチャットをクリア

    //Firestoreからチャットメッセージをリアルタイムで取得(taskIdでフィルタリング)
    const messageRef = collection(db, "tasks", taskId, "messages");
    const q = query(messageRef, orderBy("time"));
    
    //onSnapshotを使用してリアルタイムにデータを取得
    onSnapshot(q, (querySnapshot) => {
        //新しいメッセージを追加する前に、重複しないように既存のメッセージをクリアしない
        querySnapshot.docChanges().forEach((change) => {
            if (change.type === "added") { //新しく追加されたメッセージのみを追加する
                const message = change.doc.data();
                const messageItem = document.createElement("li");
                //メッセージ内容
                const messageContent = document.createElement("span");
                messageContent.textContent = `${message.name}: ${message.text}`;

                //送信時間
                const messageTime = document.createElement("span");
                messageTime.textContent = convertTimestampToDatetime(message.time);
                messageTime.style.marginLeft = "auto"; //右寄せにするために追加

                //メッセージ内容と時間を表示
                messageItem.appendChild(messageContent);
                messageItem.appendChild(messageTime);

                //メッセージをリストに追加する
                chatList.appendChild(messageItem);
            }
        });
    });
}

//チャットメッセージを送信する
function sendChatMessage(taskId) {
    const messageText = document.getElementById("chat-input").value;
    const userName = document.getElementById("chat-name").value; //名前を取得

    if (!userName || !messageText) {
        alert("名前とメッセージを入力してください！");
        return;
    }

    const messageData = {
        name: userName,
        text: messageText,
        time: serverTimestamp(),
        taskId: taskId //送信するメッセージに紐づけられるタスクIDを追加
    };
   
    //Firestoreにメッセージを追加
    addDoc(collection(db, "tasks", taskId, "messages"), messageData)
        .then(() => {
            console.log("Message sent successfully");
            document.getElementById("chat-input").value = ""; //メッセージ送信後、入力欄を空欄にする        
        })
        .catch((error) => {
            console.log("Error adding message", error);
    });
}

//タスクがリアルタイムで更新されるようにする
const tasksRef = collection(db, "tasks");
onSnapshot(tasksRef, (querySnapshot) => {
    loadTasks(); //リアルタイムでタスクリストを更新
    const taskListElement = document.getElementById("task-items");
    taskListElement.innerHTML = ""; // 既存のリストをクリア

    querySnapshot.forEach((doc) => {
        const task = doc.data();
        const taskItem = document.createElement("div");
        taskItem.classList.add("task-items");
        taskItem.textContent = task.name; // タスク名表示

        //削除ボタンを作成
        const deleteButton = document.createElement("button");
        deleteButton.classList.add("delete-task-btn");

        //削除ボタンのクリックイベント
        deleteButton.addEventListener("click", (event) => {
            event.stopPropagation(); //クリックした時に親要素のクリックイベントを止める            deleteTask(doc.id); //クリックしたタスクを削除
        });

        //タスクリストをクリックするとクリックしたタスクが右側に表示されるか確認
        taskItem.addEventListener("click", () => {
            console.log("Task clicked:", task); //クリックしたタスクが表示されるかの確認用
            showTaskDetails(taskId);
        });

        //タスクアイテムに削除ボタンを追加
        //        taskItem.appendChild(deleteButton);

        //タスクリストにタスクアイテムを追加
        //        taskListElement.appendChild(taskItem);
        //    });
    });


    // Firestoreからデータを配列形式に変換する関数
    function chatDocuments(fireStoreDocs) {
        const documents = [];
        fireStoreDocs.forEach(function (doc) {
            const document = {
                id: doc.id,
                data: doc.data(),
            };
            documents.push(document);
        });
        return documents;
    }

    // 配列データをHTMLのリスト形式に変換する関数
    function chatElements(chatDocuments) {
        const elements = [];
        chatDocuments.forEach(function (document) {
            elements.push(`
            <li id="${document.id}">
                <p>${document.data.name} at ${convertTimestampToDatetime(document.data.time.seconds)}</p>
                <p>${document.data.text}</p>
            </li>
        `);
        });
        return elements;
    }

    // メッセージ送信時の処理
    $("#send").on("click", function () {
        const name = $("#name").val(); //名前を取得
        const text = $("#text").val(); //メッセージを取得
    
        //入力項目が空欄でないか確認
        if (!name || !text) {
            alert("名前とメッセージを入力してください");
            return;
        }

        //Forestoreにメッセージを追加する
        const data = {
            name: name,
            text: text,
            time: serverTimestamp(),
            taskId: taskId //ここでタスクIDを紐づける
        };

        addDoc(collection(db, "chat"), data)
            .then(() => {
                console.log("Message sent successfully");
                $("#text").val("");  // 送信後にテキストフィールドをクリア
            })
            .catch((error) => {
                console.log("Error adding message: ", error);
            });
    });

    // Firestoreからchat内容についてリアルタイムにデータを取得
    const q = query(collection(db, "chat"), orderBy("time", "desc"));
    onSnapshot(q, (querySnapshot) => {
        const documents = chatDocuments(querySnapshot.docs);
        const elements = chatElements(documents);
        $("#output").html(elements.join(""));  // リストとして出力
    });

    // Enterキーで送信
    $("#text").on("keydown", function (e) {
        if (e.keyCode === 13) {
            $("#send").click();
        }
    });
})