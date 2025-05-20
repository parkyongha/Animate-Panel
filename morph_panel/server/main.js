
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
    app.post("/nasUpload", (req, res, next) => {
        const { items, projectPath, folderName } = req.body;

        if (!items) {
            return res.status(400).json({ error: 'No items provided' });
        }

        // items는 배열로 변환하며 중복 제거
        const rawList = Array.isArray(items) ? items : [items];
        const itemList = [...new Set(rawList)];

        // 각 항목에 대해 처리
        itemList.forEach(nasPath => {
            console.log(`Received item: ${nasPath}`);

            // TODO : 나스에 업로드하는 로직 추가
            fileUtil.uploadNas(projectPath, folderName, nasPath, (success, result) => {
                if (success) {
                    console.log(`File uploaded successfully: ${result}`);
                } else {
                    console.error(`File upload failed: ${result}`);
                }
            });
        });

        res.send({ message: 'Items received successfully', items: itemList });
    });

    return httpServer;
}

function serverClose() {
    httpServer.close(() => {
        console.log("Server closed");
    });
}