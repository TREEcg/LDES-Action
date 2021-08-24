import {newEngine} from '@treecg/actor-init-ldes-client';
import * as fs from 'fs/promises';
import {existsSync, mkdirSync} from 'fs';
import {IConfig} from "./config";

export const fetchData = async (config: IConfig): Promise<void> => {
    return new Promise((resolve, reject) => {
        try {
            let options = {
                "pollingInterval": 5000, // milliseconds
                "emitMemberOnce": true,
                "disablePolling": true,
            };

            let members: any = {};
            let LDESClient = newEngine();
            let eventStreamSync = LDESClient.createReadStream(config.data_source, options);
            eventStreamSync
                .on('data', (data) => {
                    let obj = JSON.parse(data);
                    members[obj['@id']] = obj;
                })
                .on('end', async () => {
                    const now = new Date().toISOString();
                    if (!existsSync(config.output_dir)) {
                        mkdirSync(config.output_dir);
                    }
                    await fs.writeFile(`${config.output_dir}/${now}.json`, JSON.stringify(members));
                    return resolve();
                });

        } catch (e) {
            console.error(e);
            return reject(e);
        }
    });
}
