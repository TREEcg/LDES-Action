// SOURCE: https://github.com/githubocto/flat/blob/main/src/main.ts
import * as core from '@actions/core';
import { exec } from '@actions/exec';
import { execSync } from 'child_process';
import { diff } from './git';
import { getConfig, IConfig } from './config';
import { Data } from './data';

const run = async (): Promise<void> => {
	core.startGroup('Configuration');
	const config: IConfig = getConfig();
	await exec('git', ['config', 'user.name', config.git_username]);
	await exec('git', ['config', 'user.email', `${config.git_email}`]);
	core.endGroup();

	core.startGroup('Fetch and write data');
	const data_fetcher = new Data(config);
	await data_fetcher.fetchData();
	await data_fetcher.writeData();
	core.endGroup();

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

	core.startGroup('Calculating diffstat');
	const editedFiles = [];
	for (const filename of editedFilenames) {
		core.debug(`git adding ${filename}…`);
		await exec('git', ['add', filename]);
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
	core.info(JSON.stringify(alreadyEditedFiles));
	core.info('editedFiles');
	core.info(JSON.stringify(editedFiles));
	const files = [...alreadyEditedFiles, ...editedFiles];
	core.exportVariable('FILES', files);
	core.info('process.env.FILES');
	core.info(JSON.stringify(process.env.FILES?.slice(0,100)));
	core.endGroup();
};

run().catch((error) => {
	core.setFailed('Workflow failed! ' + error.message);
});
