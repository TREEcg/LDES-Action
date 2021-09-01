// SOURCE: https://github.com/githubocto/flat/blob/main/src/post.ts
import * as core from '@actions/core';
import { exec } from '@actions/exec';
import { IConfig, getConfig } from './config';
import fs from 'fs';

/**
 * create an html string containing an index to the different data files
 * @param config action config (we need this to get the 'storage' directory)
 */
const buildIndex = (config: IConfig) => {
	let body = '<ul>';
	let fetches = fs.readdirSync(config.storage);
	for (let fetch of fetches) {
		body += `<li>${fetch}<ul>`;
		const files = fs.readdirSync(`${config.storage}/${fetch}`);
		for (let file of files) {
			body += `<li><a href="${fetch}/${file}">${file}</a></li>`;
		}
		body += '</ul></li>';
	}
	body += '</ul>';

	return `<!DOCTYPE html><html lang="en"><head><title>Index</title></head><body><h2>Index</h2>${body}</body></html>`;
};

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
	const msg = `Flat: latest data (${date})`;
	const body = files.map((f: { [x: string]: any }) => f['name']).join('\n- ');

	// these should already be staged, in main.ts
	core.info(`Committing "${msg}"`);
	core.debug(meta);
	await exec('git', [
		'commit',
		'-m',
		msg + '\nCreated/changed files:\n- ' + body,
	]);
	await exec('git', ['push']);
	core.info(`Pushed!`);
	core.exportVariable('HAS_RUN_POST_JOB', 'true');

	core.endGroup();

	core.startGroup('Creating index.html');
	const config: IConfig = getConfig();
	const index = buildIndex(config);
	await fs.promises.writeFile(`${config.storage}/index.html`, index);
	core.endGroup();
};

run().catch((error) => {
	core.setFailed('Post script failed! ' + error.message);
});
