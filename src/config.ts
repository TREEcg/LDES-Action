import * as core from '@actions/core';

export interface IConfig {
	url: string; // HTTP(S) data source
	storage: string; // directory where data will be written
	postprocess?: string; // path to postprocessing script, if necessary
	gh_pages_branch: string; // branch used for deploying to GitHub Pages
	gh_pages_url: string; // URL of the GitHub Pages deployment
	git_username: string; // GitHub username that makes the commits
	git_email: string; // GitHub email that makes the commits
}

export function getConfig(): IConfig {
	const raw: any = {};
	const keys = ['url', 'storage', 'postprocess', 'gh_pages_branch', 'gh_pages_url', 'git_username', 'git_email'];
	keys.forEach((k) => {
		const v = core.getInput(k); // getInput always returns a string
		core.info(`${k}: ${v}`);
		if (v) {
			raw[k] = v;
		}
	});
	core.debug(`Raw config: ${JSON.stringify(raw)}`);
	return raw as IConfig;
}
