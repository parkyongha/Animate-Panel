const csInterface = new CSInterface();

const extRoot = csInterface.getSystemPath("extension");

const fileUtil = require(extRoot + '/js/libs/fileUtil.js');
const jsflCommands = require(extRoot + '/js/libs/jsflCommands.js');

// 서버 실행
csInterface.requestOpenExtension('com.morph_panel.localserver', '');

(function init() {
    setupButtons();
})();

function setupButtons() {
    document.getElementById('addPathBtn').addEventListener('click', () => {
        const list = document.getElementById('nasList');

        // 새로운 행 요소 생성
        const item = document.createElement('div');
        item.className = 'path-item';
        item.innerHTML = `<label>
                            경로:
                            <input type="text" name="nasPath[]" value="//nas/home/www/" style="width: 400px;"/>
                          </label>
                          <button type="button" class="remove" tabindex = "-1">×</button>`;

        // 삭제 버튼에 이벤트 연결
        item.querySelector('.remove').addEventListener('click', () => {
            list.removeChild(item);
        });

        list.appendChild(item);
    });

    document.getElementById('nasUploadBtn').addEventListener('click', async () => {
        const items = getPathList();
        const projectPath = await getProjectPath();
        const folderName = getFolderName();

        const json = JSON.stringify({ items, projectPath, folderName });

        fetch(`http://localhost:3200/nasUpload`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: json
        })
            .then(res => res.json())
            .then(json => {
                console.log(json);
            });
            
        // 루트 경로로 통신 예제
        // fetch('http://localhost:3200/')
        //     .then(res => res.text())
        //     .then(text => console.log(`통신 ----- ${text}`));
    });
}

/**
 * 
 * @returns {string[]} path List
 */
function getPathList() {
    const pathList = [];

    // path-item 클래스를 가진 모든 Input 요소의 name이 nasPath[] 인것을 선택
    const pathItems = document.querySelectorAll('.path-item input[name="nasPath[]"]');

    pathItems.forEach(item => {
        const path = item.value.trim();

        if (path) {
            pathList.push(path);
        }
    });

    return pathList;
}

async function getProjectPath() {
    const getPathJsfl = jsflCommands.getPath();

    return await evalScriptAsync(getPathJsfl);
}

// evalScript가 비동기로 결과가 반환되기 때문에 Promise로 감싸서 사용
function evalScriptAsync(script) {
    return new Promise((resolve, reject) => {
        csInterface.evalScript(script, result => {
            if (result === 'undefined' || result === '' || result == null) {
                reject(new Error('No result from evalScript'));
            } else {
                resolve(result);
            }
        });
    });
}

function getFolderName() {
    const folderName = document.getElementById('folderName').value.trim();
    return folderName || null;
}