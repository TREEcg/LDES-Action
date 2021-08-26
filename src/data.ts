import {newEngine} from '@treecg/actor-init-ldes-client';
import * as fs from 'fs/promises';
import {existsSync, mkdirSync} from 'fs';
import {IConfig} from "./config";


export class Data {
    public readonly config: IConfig;
    public readonly members: { [key: string]: object };

    public constructor(config: IConfig) {
        this.config = config;
        this.members = {};
    }

    /**
     * fetch data using the LDES client and store them in 'members'
     */
    public async fetchData(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                let options = {
                    "pollingInterval": 5000, // milliseconds
                    "emitMemberOnce": true,
                    "disablePolling": true,
                };

                let LDESClient = newEngine();
                let eventStreamSync = LDESClient.createReadStream(this.config.data_source, options);
                eventStreamSync
                    .on('data', (data) => {
                        let obj = JSON.parse(data);
                        this.members[obj['@id']] = obj;
                    })
                    .on('end', async () => {
                        return resolve();
                    });

            } catch (e) {
                console.error(e);
                return reject(e);
            }
        });
    }

    /**
     * write data stored in 'members' to the output directory supplied in the config file
     */
    public async writeData(): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            try {
                const now = new Date().toISOString();
                // create necessary directories where data will be stored
                if (!existsSync(this.config.output_dir)) {
                    mkdirSync(this.config.output_dir);
                }
                mkdirSync(`${this.config.output_dir}/${now}`);

                // split members into multiple files, each containing no more than 500 members
                const file_size = 500;
                const member_values = Object.values(this.members);
                const chunks = Array.from(
                    new Array(Math.ceil(member_values.length / file_size)), (_, i) =>
                        member_values.slice(i * file_size, i * file_size + file_size)
                );
                // write all chunks to a file
                await Promise.all(chunks.map((chunk, index) => {
                    // files are named data<number>.json, where <number> is a 5-digit number representing the chunk index
                    const file_num = String(index).padStart(5, '0');
                    fs.writeFile(`${this.config.output_dir}/${now}/data${file_num}.json`, JSON.stringify(chunk));
                }));

                return resolve();
            } catch (e) {
                console.error(e);
                return reject(e);
            }
        });
    }
}
