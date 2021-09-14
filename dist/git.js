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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.diff = exports.gitStatus = void 0;
// SOURCE: https://github.com/githubocto/flat/blob/main/src/git.ts
const exec_1 = require("@actions/exec");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const core = __importStar(require("@actions/core"));
async function gitStatus() {
    core.debug('Getting gitStatus()');
    let output = '';
    await (0, exec_1.exec)('git', ['status', '-s'], {
        listeners: {
            stdout: (data) => {
                output += data.toString();
            },
        },
    });
    core.debug(`=== output was:\n${output}`);
    return output
        .split('\n')
        .filter((l) => l != '')
        .map((l) => {
        const chunks = l.trim().split(/\s+/);
        return {
            flag: chunks[0],
            path: chunks[1],
        };
    });
}
exports.gitStatus = gitStatus;
async function getHeadSize(path) {
    let raw = '';
    const exitcode = await (0, exec_1.exec)('git', ['cat-file', '-s', `HEAD:${path}`], {
        listeners: {
            stdline: (data) => {
                raw += data;
            },
        },
    });
    core.debug(`raw cat-file output: ${exitcode} '${raw}'`);
    if (exitcode === 0) {
        return parseInt(raw, 10);
    }
}
async function diffSize(file) {
    switch (file.flag) {
        case 'M': {
            const stat = (0, fs_1.statSync)(file.path);
            core.debug(`Calculating diff for ${JSON.stringify(file)}, with size ${stat.size}b`);
            // get old size and compare
            const oldSize = await getHeadSize(file.path);
            const delta = oldSize === undefined ? stat.size : stat.size - oldSize;
            core.debug(` ==> ${file.path} modified: old ${oldSize}, new ${stat.size}, delta ${delta}b `);
            return delta;
        }
        case 'A': {
            const stat = (0, fs_1.statSync)(file.path);
            core.debug(`Calculating diff for ${JSON.stringify(file)}, with size ${stat.size}b`);
            core.debug(` ==> ${file.path} added: delta ${stat.size}b`);
            return stat.size;
        }
        case 'D': {
            const oldSize = await getHeadSize(file.path);
            const delta = oldSize === undefined ? 0 : oldSize;
            core.debug(` ==> ${file.path} deleted: delta ${delta}b`);
            return delta;
        }
        default: {
            throw new Error(`Encountered an unexpected file status in git: ${file.flag} ${file.path}`);
        }
    }
}
async function diff(filename) {
    const statuses = await gitStatus();
    core.debug(`Parsed statuses: ${statuses.map((s) => JSON.stringify(s)).join(', ')}`);
    const status = statuses.find((s) => path_1.default.relative(s.path, filename) === '');
    if (typeof status === 'undefined') {
        core.info(`No status found for ${filename}, aborting.`);
        return 0; // there's no change to the specified file
    }
    return await diffSize(status);
}
exports.diff = diff;
