function getDocument() {
    return `var doc = fl.getDocumentDOM();`;
}

function getPath() {
    return `
    (function(){
        ${getDocument()} 
        var path = doc.path;
        return path;
    })()`;
}

function getPathURI() {
    return `
    (function(){
        ${getDocument()} 
        var path = doc.pathURI;
        return path;
    })()`;
}

module.exports = {
    getDocument,
    getPath,
    getPathURI
}