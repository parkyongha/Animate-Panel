const path = require('path');
const fs = require('fs');

/**
 * xfl 또는 fla 파일 경로에서 루트 폴더 경로를 찾는 함수
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
 * root 폴더에서 빌드 폴더 경로를 찾는 함수
 * @param {string} projectPath 
 * @returns build folder path
 */
function getBuildFolder(projectPath) {
    const entries = fs.readdirSync(projectPath, { withFileTypes: true });

    // .html 과 .js 파일들이 있는지 확인
    let hasHtml = false;
    let hasJs = false;

    for (const entry of entries) {
        if (entry.isFile()) {
            const ext = path.extname(entry.name).toLowerCase();

            if (ext === '.html') hasHtml = true;
            else if (ext === '.js') hasJs = true;

            if (hasHtml && hasJs) {
                return projectPath;
            }
        }
    }

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
        await fs.promises.rm(dir, { recursive: true, force: true });
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
 * NAS 업로드 처리 함수
 * @param {string} filePath        파일 경로 (이름에서 NAS 폴더명 및 프로젝트 루트 경로 추출)
 * @param {string} nasFolderPath  복사할 폴더 경로
 * @param {function(boolean, string)} func 콜백 (성공 여부, 결과 또는 에러 메시지)
 */
async function uploadNas(filePath, folderName, nasFolderPath) {
    const baseName = folderName || path.parse(path.basename(filePath)).name;
    const targetFolder = path.join(nasFolderPath, baseName);

    const rootFolder = getRootFolder(filePath);
    const buildFolder = getBuildFolder(rootFolder);

    // 로깅
    console.log(`rootFolderPath: ${rootFolder}`);
    console.log(`buildFolderPath: ${buildFolder}`);
    console.log(`targetFolder: ${targetFolder}`);

    try {
        // 기존 폴더 제거
        await deleteFolderRecursiveAsync(targetFolder);
        // 새 폴더 생성 및 복사
        await copyFolderRecursiveAsync(buildFolder, targetFolder);

        return { success: true, message: `${targetFolder}에 업로드 완료` };
    } catch (err) {
        // 에러를 던져도 되고, 이렇게 반환해도 됩니다
        return { success: false, message: err.message };
    }
}

module.exports = {
    getRootFolder,
    getBuildFolder,
    uploadNas
}
