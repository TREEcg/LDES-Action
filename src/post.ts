// SOURCE: https://github.com/githubocto/flat/blob/main/src/post.ts
import * as core from '@actions/core'
import {exec} from '@actions/exec'

export const runPostScript = async () => {
    core.startGroup('Post cleanup script')

    if (process.env.HAS_RUN_POST_JOB) {
        core.info('Files already committed');
        core.endGroup();
        return;
    }

    const files = JSON.parse(process.env.FILES || '[]');
    core.info('files');
    core.info(JSON.stringify(files));

    // Don't want to commit if there aren't any files changed!
    if (!files.length) {
        core.info('No changes to commit');
        core.endGroup();
        return;
    }

    const date = new Date().toISOString();
    const meta = JSON.stringify({date, files}, undefined, 2);
    const msg = `Flat: latest data (${date})`;
    const body = files.map((f: { [x: string]: any; }) => f['name']).join('\n- ');

    // these should already be staged, in main.ts
    core.info(`Committing "${msg}"`);
    core.debug(meta);
    await exec('git', ['commit', '-m', msg + '\nCreated/changed files:\n- ' + body]);
    await exec('git', ['push']);
    core.info(`Pushed!`);
    core.exportVariable('HAS_RUN_POST_JOB', 'true');

    core.endGroup();
}
