import * as core from '@actions/core'
import {exec} from '@actions/exec'
import {execSync} from 'child_process'
import {diff} from './git'
import {getConfig, IConfig} from "./config";
import {fetchData} from "./data";

async function run(): Promise<void> {
    core.startGroup('Configuration');
    const config: IConfig = await getConfig();
    const username = 'flat-data';
    await exec('git', ['config', 'user.name', username]);
    await exec('git', [
        'config',
        'user.email',
        `${username}@users.noreply.github.com`,
    ]);
    core.endGroup();

    core.startGroup('Fetch data');
    await fetchData(config);
    core.endGroup();

    if (config.postprocess) {
        core.startGroup('Postprocess');
        core.debug(`Invoking ${config.postprocess}…`)
        try {
            core.info('TODO (doesn\'t run anything yet)')
        } catch (error) {
            core.setFailed(error);
        }
        core.endGroup()
    }

    core.startGroup('File changes');
    const newUnstagedFiles = await execSync('git ls-files --others --exclude-standard').toString();
    const modifiedUnstagedFiles = await execSync('git ls-files -m').toString();
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
        const bytes = await diff(filename);
        editedFiles.push({'name': filename, 'deltaBytes': bytes, 'source': config.data_source});
    }
    core.endGroup()

    core.startGroup('Committing new data')
    const alreadyEditedFiles = JSON.parse(process.env.FILES || '[]')
    core.info('alreadyEditedFiles')
    core.info(JSON.stringify(alreadyEditedFiles))
    core.info('editedFiles')
    core.info(JSON.stringify(editedFiles))
    const files = [...alreadyEditedFiles, ...editedFiles]
    core.exportVariable('FILES', files)
    core.endGroup()
}

run().catch(error => {
    core.setFailed('Workflow failed! ' + error.message)
})