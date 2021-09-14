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
// SOURCE: https://github.com/githubocto/flat/blob/main/src/post.ts
const core = __importStar(require("@actions/core"));
const exec_1 = require("@actions/exec");
const run = async () => {
    core.startGroup('Post cleanup script');
    if (process.env.HAS_RUN_POST_JOB) {
        core.info('Files already committed');
        core.endGroup();
        return;
    }
    const files = JSON.parse(process.env.FILES || '[]');
    // Don't want to commit if there aren't any files changed!
    if (!files.length) {
        core.info('No changes to commit');
        core.endGroup();
        return;
    }
    const date = new Date().toISOString();
    const meta = JSON.stringify({ date, files }, undefined, 2);
    const msg = `LDES-Action: latest data (${date})`;
    const body = files.map((f) => f['name']).slice(0, 100).join('\n- ');
    files.length > 100 ? body.concat(`${files.length - 100} files not shown`) : '';
    // these should already be staged, in main.ts
    core.info(`Committing "${msg}"`);
    core.debug(meta);
    await (0, exec_1.exec)('git', [
        'commit',
        '-m',
        msg + '\nCreated/changed files:\n- ' + body,
    ]);
    await (0, exec_1.exec)('git', ['push']);
    core.info(`Pushed!`);
    core.exportVariable('HAS_RUN_POST_JOB', 'true');
    core.endGroup();
};
run().catch((error) => {
    core.setFailed('Post script failed! ' + error.message);
});
