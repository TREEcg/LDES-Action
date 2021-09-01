import * as core from '@actions/core';

export interface IConfig {
	url: string; // HTTP(S) data source
	storage: string; // directory where data will be written
	predicate?: string; // path to postprocessing script, if necessary
	max_members: number; // max amount of members per data file
	gh_pages_branch: string; // branch used for deploying to GitHub Pages
}

export const getConfig = (): IConfig => {
	return {
		url: core.getInput('url'),
		storage: core.getInput('storage'),
		predicate: core.getInput('predicate')
			? core.getInput('predicate')
			: undefined,
		max_members: parseInt(core.getInput('max_members')),
		gh_pages_branch: core.getInput('gh_pages_branch'),
	};
};
