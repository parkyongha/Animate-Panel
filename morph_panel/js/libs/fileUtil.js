const path = require('path');

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

function getBuildFolder(projectPath) {

}

module.exports = {
    getRootFolder,
    getBuildFolder
}
