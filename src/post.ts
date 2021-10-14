// SOURCE: https://github.com/githubocto/flat/blob/main/src/post.ts
import * as core from '@actions/core';
import { exec } from '@actions/exec';

const run = async (): Promise<void> => {
  core.startGroup('Post cleanup script');

  if (process.env.HAS_RUN_POST_JOB) {
    core.info('Files already committed');
    core.endGroup();
    return;
  }

  const files = JSON.parse(process.env.FILES || '[]');
  // Don't want to commit if there aren't any files changed!
  if (files.length === 0) {
    core.info('No changes to commit');
    core.endGroup();
    return;
  }

  const date = new Date().toISOString();
  const meta = JSON.stringify({ date, files }, undefined, 2);
  const msg = `LDES-Action: latest data (${date})`;
  const body = files
    .map((file: Record<string, any>) => file.name)
    .slice(0, 100)
    .join('\n- ');

  if (files.length > 100) {
    body.concat(`${files.length - 100} files not shown`);
  }

  // These should already be staged, in main.ts
  core.info(`Committing "${msg}"`);
  core.debug(meta);
  await exec('git', [
    'commit',
    '-m',
    `${msg}\nCreated/changed files:\n- ${body}`,
  ]);
  await exec('git', ['push']);
  core.info(`Pushed!`);
  core.exportVariable('HAS_RUN_POST_JOB', 'true');

  core.endGroup();
};

run().catch(error => {
  core.setFailed(`Post script failed! ${error.message}`);
});
