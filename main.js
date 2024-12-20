const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const fs2 = require('fs').promises;
const { exec } = require('child_process');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });
    win.loadFile('index.html');
}
function createSecondWindow() {
    const secondWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });
    secondWindow.loadFile('index2.html');
}
function createThirdWindow() {
    const secondWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });
    secondWindow.loadFile('drive.html');
}


app.whenReady().then(() => {
    createWindow();
    createSecondWindow();
    createThirdWindow()
});

ipcMain.on('insert-and-run', (event, content) => {
    const filePath = path.join(__dirname, 'kadrtt.properties'); // 更新対象ファイルのパスを指定
    const filePath2 = path.join(__dirname, '.ipfs/config');
    const lineNumber = 36; // 変更したい行番号

    // ファイルの削除
    deleteFile(filePath2);

    // ファイルの読み込みと編集
    const fileContent = fs.readFileSync(filePath, 'utf-8').split('\n');
    fileContent[lineNumber - 1] = content;
    fs.writeFileSync(filePath, fileContent.join('\n'), 'utf-8');

    // バッチファイルの実行
    exec('start "" "run.bat"', { cwd: __dirname }, (error, stdout, stderr) => {
        if (error) {
            console.error(`バッチファイル実行エラー: ${error.message}`);
        }
    });
});

// 'run-command' メッセージを受け取ってコマンドプロンプトでコマンドを実行
ipcMain.on('run-command', (event, command) => {
    console.log(`コマンド実行: ${command}`);

    // コマンドプロンプトでコマンドを実行
    exec(command, (error, stdout, stderr) => {
        // 実行結果をレンダラープロセスに送信
        const regex = /"CID_file":"(.*?)"/g; // 正規表現：CID:" で始まり、最初の " までの内容を取得

        // 一致する部分をすべて取得
        const matches = [...stdout.matchAll(regex)].map(match => match[1]);
        event.reply('command-result', matches[0]);  // レンダラーに実行結果を送信
    });
});

// 'run-command2' メッセージを受け取ってコマンドプロンプトでコマンドを実行
ipcMain.on('run-command2', (event, command) => {
    console.log(`コマンド実行: ${command}`);

    // コマンドプロンプトでコマンドを実行
    exec(command, (error, stdout, stderr) => {
        event.reply('command-result2',stdout);
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

async function deleteFile(file) {
    try {
      await fs2.unlink(file);
      console.log('ファイルが正常に削除されました');
    } catch (err) {
      console.error(`ファイル削除中にエラーが発生しました: ${err.message}`);
    }
  }