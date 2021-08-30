import { newEngine } from '@treecg/actor-init-ldes-client';
import fs from 'fs';
import { existsSync, mkdirSync } from 'fs';
import { IConfig } from './config';

export class Data {
	// constant file names
	private readonly FETCHES_INDEX = 'fetches';
	private readonly DATA_FILE = 'data';
	// amount of objects we save per file;
	private readonly FILE_SIZE = 500;

	private readonly config: IConfig;
	private readonly members: { [key: string]: object };
	private readonly fetches: Array<string>;

	public constructor(config: IConfig) {
		this.config = config;
		this.members = {};

		// create necessary directories where data will be stored
		if (!existsSync(this.config.storage)) {
			mkdirSync(this.config.storage);
		}

		// load previous fetch times if they exist
		if (existsSync(`${this.config.storage}/fetches.json`)) {
			this.fetches = JSON.parse(
				fs.readFileSync(`${this.config.storage}/fetches.json`, 'utf-8')
			);
			this.fetches.sort();
		} else {
			this.fetches = [];
		}
	}

	/**
	 * fetch data using the LDES client
	 */
	public async fetchData(): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			try {
				let options = {
					emitMemberOnce: true,
					disablePolling: true,
					// only fetch data added after latest fetch
					fromTime:
						this.fetches.length > 0 ? new Date(this.fetches[0]) : undefined,
				};

				let LDESClient = newEngine();
				let eventStreamSync = LDESClient.createReadStream(
					this.config.url,
					options
				);

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
	 * write fetched data to the output directory supplied in the config file
	 */
	public async writeData(): Promise<void> {
		return new Promise<void>(async (resolve, reject) => {
			try {
				const member_values = Object.values(this.members);
				if (member_values.length === 0) {
					// if there are no members, we are done
					return resolve();
				}

				// make directory where we will store newly fetched data
				const now = new Date().toISOString();
				mkdirSync(`${this.config.storage}/${now}`);

				// split members into multiple files
				const chunks = Array.from(
					new Array(Math.ceil(member_values.length / this.FILE_SIZE)),
					(_, i) =>
						member_values.slice(
							i * this.FILE_SIZE,
							i * this.FILE_SIZE + this.FILE_SIZE
						)
				);

				// write all chunks to a file
				await Promise.all(
					chunks.map((chunk, index) => {
						// files are named data<number>.json, where <number> is a 5-digit number
						// representing the chunk index
						const file_num = String(index).padStart(5, '0');
						fs.promises.writeFile(
							`${this.config.storage}/${now}/${this.DATA_FILE}${file_num}.json`,
							JSON.stringify(chunk)
						);
					})
				);

				// update the fetches index
				this.fetches.push(now);
				await fs.promises.writeFile(
					`${this.config.storage}/${this.FETCHES_INDEX}.json`,
					JSON.stringify(this.fetches)
				);

				return resolve();
			} catch (e) {
				console.error(e);
				return reject(e);
			}
		});
	}
}
