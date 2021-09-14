"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// SOURCE: https://github.com/githubocto/flat/blob/main/src/main.ts
const core = __importStar(require("@actions/core"));
const exec_1 = require("@actions/exec");
const child_process_1 = require("child_process");
const config_1 = require("./config");
const data_1 = require("./data");
const fs_1 = require("fs");
const run = async () => {
    core.startGroup('Configuration');
    const config = (0, config_1.getConfig)();
    await (0, exec_1.exec)('git', ['config', 'user.name', config.git_username]);
    await (0, exec_1.exec)('git', ['config', 'user.email', `${config.git_email}`]);
    core.endGroup();
    core.startGroup('Delete output folder');
    // Delete output folder to have a clean start, no symlinks, no old data
    (0, fs_1.rmdirSync)(config.storage, { recursive: true });
    core.endGroup();
    core.startGroup('Fetch and write data');
    const data_fetcher = new data_1.Data(config);
    await data_fetcher.fetchData();
    await data_fetcher.writeData();
    core.endGroup();
    core.startGroup('File changes');
    const newUnstagedFiles = (0, child_process_1.execSync)('git ls-files --others --exclude-standard').toString();
    const modifiedUnstagedFiles = (0, child_process_1.execSync)('git ls-files -m').toString();
    const editedFilenames = [
        ...newUnstagedFiles.split('\n'),
        ...modifiedUnstagedFiles.split('\n'),
    ].filter(Boolean);
    core.info('newUnstagedFiles');
    core.info(newUnstagedFiles + '');
    core.info('modifiedUnstagedFiles');
    core.info(modifiedUnstagedFiles + '');
    core.info('editedFilenames');
    core.info(JSON.stringify(editedFilenames));
    core.endGroup();
    core.startGroup('Calculating diffstat');
    const editedFiles = [];
    for (const filename of editedFilenames) {
        core.debug(`git adding ${filename}…`);
        await (0, exec_1.exec)('git', ['add', filename]);
        // const bytes = await diff(filename);
        editedFiles.push({
            name: filename,
            // deltaBytes: bytes,
            // source: config.url,
        });
    }
    core.endGroup();
    core.startGroup('Committing new data');
    const alreadyEditedFiles = JSON.parse(process.env.FILES || '[]');
    core.info('alreadyEditedFiles');
    core.info(JSON.stringify(alreadyEditedFiles.slice(0, 100)));
    core.info('editedFiles');
    core.info(JSON.stringify(editedFiles.slice(0, 100)));
    const files = [...alreadyEditedFiles.slice(0, 100), ...editedFiles.slice(0, 100)];
    core.exportVariable('FILES', files);
    core.info('process.env.FILES');
    core.info(JSON.stringify(process.env.FILES));
    core.endGroup();
};
run().catch((error) => {
    core.setFailed('Workflow failed! ' + error.message);
});
