const path = require('path');
const fs = require('fs');

/**
 * 
 * @param {string} projectPath 
 * @returns root folder path
 */
function getRootFolder(projectPath) {
    let result = null;

    if (projectPath.endsWith('.xfl')) {
        result = path.resolve(projectPath, '..', '..');
    } else if (projectPath.endsWith('.fla')) {
        result = path.resolve(projectPath, '..');
    } else {
        console.error('Invalid project path. Must be .xfl or .fla');
        return null;
    }

    return result;
}

/**
 * root 폴더에서 빌드 폴더 찾기
 * @param {string} projectPath 
 * @returns build folder path
 */
function getBuildFolder(projectPath) {
    const entries = fs.readdirSync(projectPath, { withFileTypes: true });

    // Check for .html and .js files in this folder
    let hasHtml = false;
    let hasJs = false;

    for (const entry of entries) {
        if (entry.isFile()) {
            const ext = path.extname(entry.name).toLowerCase();
            if (ext === '.html') hasHtml = true;
            if (ext === '.js') hasJs = true;
        }
    }
    if (hasHtml && hasJs) {
        return projectPath;
    }

    // Recurse into subfolders
    for (const entry of entries) {
        if (entry.isDirectory()) {
            const result = getBuildFolder(path.join(projectPath, entry.name));
            if (result) {
                return result;
            }
        }
    }

    return null;
}

/**
 * 비동기 재귀 폴더 삭제
 */
async function deleteFolderRecursiveAsync(dir) {
    try {
        fs.promises.rm(dir, { recursive: true, force: true });
    } catch (err) {
        console.error(`delete failed: ${dir}`, err);
        throw err;
    }
}

/**
 * 비동기 재귀 폴더 복사
 */
async function copyFolderRecursiveAsync(src, dst) {
    await fs.promises.mkdir(dst, { recursive: true });

    const entries = await fs.promises.readdir(src, { withFileTypes: true });

    await Promise.all(entries.map(entry => {
        const srcPath = path.join(src, entry.name);
        const dstPath = path.join(dst, entry.name);
        return entry.isDirectory()
            ? copyFolderRecursiveAsync(srcPath, dstPath)
            : fs.promises.copyFile(srcPath, dstPath);
    }));
}

/**
 * 특정 폴더 안에서 첫 번째 .html 파일명 찾기
 */
async function findFirstHtml(dir) {
    const entries = await fs.readdir(dir);
    for (const name of entries) {
        if (name.toLowerCase().endsWith('.html')) {
            return name;
        }
        const sub = path.join(dir, name);
        const stat = await fs.lstat(sub);
        if (stat.isDirectory()) {
            const found = await findFirstHtml(sub);
            if (found) return path.join(name, found);
        }
    }
    return null;
}

/**
 * NAS 업로드 처리 함수
 * @param {string} filePath        파일 경로 (이름에서 NAS 폴더명 및 프로젝트 루트 경로 추출)
 * @param {string} nasFolderPath  복사할 폴더 경로
 * @param {function(boolean, string)} func 콜백 (성공 여부, 결과 또는 에러 메시지)
 */
async function uploadNas(filePath, folderName, nasFolderPath, func) {
    try {
        folderName = folderName || path.parse(path.basename(filePath)).name;
        const targetFolder = path.join(nasFolderPath, folderName);

        console.log(`filePath : ${filePath}`);

        const rootFolderPath = getRootFolder(filePath);
        const buildFolderPath = getBuildFolder(rootFolderPath);

        console.log(`rootFolderPath: ${rootFolderPath}\n buildFolderPath: ${buildFolderPath}\n targetFolder: ${targetFolder}`);

        // 기존 폴더 제거
        await deleteFolderRecursiveAsync(targetFolder);
        // 새 폴더 생성 및 복사
        await copyFolderRecursiveAsync(buildFolderPath, targetFolder);

        // HTML 파일 경로 찾기
        // const htmlRelative = await findFirstHtml(rootFolderPath);

        // if (!htmlRelative) {
        //     throw new Error('HTML 파일을 찾을 수 없습니다.');
        // }

        // 성공 콜백
        func(true, `${targetFolder} 에 업로드 완료`);
    } catch (err) {
        // 실패 콜백
        func(false, err.message);
    }
};

module.exports = {
    getRootFolder,
    getBuildFolder,
    uploadNas
}
