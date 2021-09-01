import { newEngine } from '@treecg/actor-init-ldes-client';
import fs from 'fs';
import { existsSync, mkdirSync } from 'fs';
import { IConfig } from './config';
import { DataFactory, Store, Parser, Writer, Quad_Subject } from 'n3';
import namedNode = DataFactory.namedNode;

export class Data {
	// name of files where data will be stored
	private readonly DATA_FILE = 'data';

	private readonly config: IConfig;
	private readonly store: Store;
	private readonly fetches: Array<string>;
	private fetch_time: string | undefined;

	public constructor(config: IConfig) {
		this.config = config;
		this.store = new Store();

		// create necessary directories where data will be stored
		if (!existsSync(this.config.storage)) {
			mkdirSync(this.config.storage);
		}

		// load previous fetch times if they exist. We will use the most recent fetch time
		// to only fetch data that was added after this time.
		const fetch_times = fs.readdirSync(this.config.storage);
		const fetch_dates = fetch_times
			.map((dir) => new Date(dir))
			// @ts-ignore
			.filter((date) => !isNaN(date));
		this.fetches = fetch_dates.map((date) => date.toISOString());
		this.fetches.sort();
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
					mimeType: 'text/turtle',
					// only fetch data added after latest fetch
					fromTime:
						this.fetches.length > 0 ? new Date(this.fetches[0]) : undefined,
				};

				let LDESClient = newEngine();
				let eventStreamSync = LDESClient.createReadStream(
					this.config.url,
					options
				);
				const parser = new Parser({ format: 'text/turtle' });

				// read quads and add them to triple store
				// @ts-ignore
				parser.parse(eventStreamSync, (err, quad, prefs) => {
					if (err) {
						return reject(err);
					}
					if (prefs) {
						console.log('prefixes:', prefs);
					}
					if (quad) {
						this.store.addQuad(quad);
					} else {
						this.fetch_time = new Date().toISOString();
						return resolve();
					}
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
				if (this.store.countQuads(null, null, null, null) === 0) {
					// if there is no data, we are done
					return resolve();
				}

				// make directory where we will store newly fetched data
				mkdirSync(`${this.config.storage}/${this.fetch_time}`);

				let subjects: Array<Quad_Subject>;

				// if predicate was provided, sort the quads using this predicate
				if (this.config.predicate) {
					const quads = this.store.getQuads(
						null,
						namedNode(this.config.predicate),
						null,
						null
					);
					quads.sort((q1, q2) =>
						q1.object.value < q2.object.value
							? -1
							: q1.object.value > q2.object.value
							? 1
							: 0
					);

					// this removes duplicate subjects
					let temp: Map<string, Quad_Subject> = new Map(
						quads.map((quad) => [quad.subject.value, quad.subject])
					);
					subjects = Array.from(temp, ([_, subject]) => subject);
				} else {
					subjects = this.store.getSubjects(null, null, null);
				}

				console.log('subjects length:', subjects.length);

				// split quads into multiple chunks containing 'this.config.max_members' members
				const chunks = Array.from(
					new Array(Math.ceil(subjects.length / this.config.max_members)),
					(_, i) =>
						subjects.slice(
							i * this.config.max_members,
							i * this.config.max_members + this.config.max_members
						)
				);

				// write each chunk to its own file
				await Promise.all(
					chunks.map((chunk, index) => {
						let writer = new Writer();
						chunk.forEach((subject) =>
							writer.addQuads(this.store.getQuads(subject, null, null, null))
						);
						writer.end((err, result) => {
							if (err) {
								return reject(err);
							}
							// files are named <this.DATA_FILE><number>.ttl, where <number> is a 5-digit number
							// representing the chunk index
							const file_num = String(index).padStart(5, '0');
							fs.promises.writeFile(
								`${this.config.storage}/${this.fetch_time}/${this.DATA_FILE}${file_num}.ttl`,
								result
							);
						});
					})
				);

				return resolve();
			} catch (e) {
				console.error(e);
				return reject(e);
			}
		});
	}
}
