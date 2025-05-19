const fs = require('fs');

const csInterface = new CSInterface();

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

    document.getElementById('nasUploadBtn').addEventListener('click', () => {
        const pathList = getPathList();

        pathList.forEach(path => {
            console.log(`path: ${path}`);
        });
    });
}

function getProjectPath() {
    const projectPath = csInterface.evalScript("fl.");
    return projectPath;
}

function getPathList() {
    const pathList = [];

    const pathItems = document.querySelectorAll('.path-item input[name="nasPath[]"]');

    pathItems.forEach(item => {
        const path = item.value.trim();
        if (path) {
            pathList.push(path);
        }
    });

    return pathList;
}

function uploadNas() {

}