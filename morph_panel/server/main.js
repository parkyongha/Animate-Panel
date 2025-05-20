
/* npm Modules */
const express = require("express");
const app = express();
const request = require('request');
const http = require('http');
const path = require("path");
const fs = require('fs');

const fileUtil = require("../js/libs/fileUtil.js");

/** @type {http.Server} */
const httpServer = http.Server(app);

module.exports = run;

function run() {
    console.log("Server is running");

    var port = 3200;
    var hostname = "localhost"

    httpServer.listen(port, hostname);

    app.use(express.json());
    app.use(express.urlencoded({ limit: '50mb', extended: true }));
    app.use(express.static(path.join(__dirname, "../client")));

    /* http://localhost:3200/ 로 요청이 들어왔을 떄 */
    app.get("/", (req, res, next) => {
        res.send('connected');
    });

    /* http://localhost:3200/nasUpload 로 요청이 들어왔을 떄 */
    app.post("/nasUpload", async (req, res, next) => {
        try {
            const { items, projectPath, folderName } = req.body;
            const list = Array.isArray(items) ? items : [items];
            const unique = [...new Set(list)];

            const promises = unique.map(nasPath =>
                fileUtil.uploadNas(projectPath, folderName, nasPath)
                    .then(r => ({ filePath: nasPath, ...r }))
            );

            const results = await Promise.all(promises);

            res.json({ results });
        } catch (err) {
            console.error('nasUpload 처리 중 에러:', err);
            // next(err);           // Express 에러핸들러로 전달
            res.status(500).json({ error: err.message || '서버 에러' });
        }
    });

    return httpServer;
}

function serverClose() {
    httpServer.close(() => {
        console.log("Server closed");
    });
}