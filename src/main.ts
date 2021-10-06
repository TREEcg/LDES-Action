// SOURCE: https://github.com/githubocto/flat/blob/main/src/main.ts
import * as core from '@actions/core';
import { exec } from '@actions/exec';
import { execSync } from 'child_process';
import { diff } from './utils/Git';
import { getConfig, IConfig } from './utils/Config';
import { Data } from './data';
import { rmdirSync } from 'fs';

const run = async (): Promise<void> => {
	// Read configuration from .yaml file
	core.startGroup('Configuration');
	const config: IConfig = getConfig();
	await exec('git', ['config', 'user.name', config.git_username]);
	await exec('git', ['config', 'user.email', `${config.git_email}`]);
	core.endGroup();

	// Delete local output folder to have a clean start, no symlinks and no old data
	core.startGroup('Delete output folder');
	rmdirSync(config.storage, { recursive: true });
	core.endGroup();

	// Fetches the LDES and applies a fragmentation strategy
	core.startGroup('Fetch and write data');
	const data_fetcher = new Data(config);
	if (config.stream_data) {
		await data_fetcher.processDataStreamingly();
	} else {
		await data_fetcher.processDataMemory();
	}
	core.endGroup();

	// List all changed files
	core.startGroup('File changes');
	const newUnstagedFiles = execSync(
		'git ls-files --others --exclude-standard'
	).toString();
	const modifiedUnstagedFiles = execSync('git ls-files -m').toString();
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

	// Calculate the differences with the previous result
	core.startGroup('Calculating diffstat');
	const editedFiles = [];
	for (const filename of editedFilenames) {
		core.debug(`git adding ${filename}…`);
		await exec('git', ['add', filename]);
		editedFiles.push({
			name: filename,
		});
	}
	core.endGroup();

	// Commit new data to the repository
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
