import { existsSync, mkdirSync } from 'fs';
import { IConfig } from './utils/Config';

import FragmentContext from './fragment-strategy/FragmentContext';
import SubjectPagesFragmentStrategy from './fragment-strategy/SubjectPagesFragmentStrategy';
import IFragmentStrategy from './utils/interfaces/IFragmentStrategy';
import DatasourceContext from './data-source-strategy/DatasourceContext';
import LDESClientDatasource from './data-source-strategy/LDESClientDatasource';
import IDatasource from './utils/interfaces/IDatasource';
import OldLDESClientDatasource from './data-source-strategy/OldLDESClientDatasource';
import IData from './utils/interfaces/IData';
import SubstringFragmentStrategy from './fragment-strategy/SubstringFragmentStrategy';

export class Data {

	private readonly config: IConfig;
	private datasourceContext: DatasourceContext;
	private fragmentContext: FragmentContext;

	private RDFData: IData[];

	public constructor(config: IConfig) {
		this.config = config;
		this.RDFData = [];

		console.log('Testing current dir: ' + this.config.storage);

		// Create necessary directories where data will be stored
		if (!existsSync(this.config.storage)) {
			mkdirSync(this.config.storage);
		}

		this.datasourceContext = new DatasourceContext(new LDESClientDatasource());
		this.setDatasource();

		this.fragmentContext = new FragmentContext(new SubjectPagesFragmentStrategy());
		this.setFragmentationStrategy();

	}

	public async processDataMemory(): Promise<void> {
		await this.fetchData();
		await this.writeData();
	}

	public async processDataStreamingly(): Promise<void> {
		const ldes = this.datasourceContext.getLinkedDataEventStream(this.config.url);
		const bucketizer = await this.fragmentContext.initBucketizer(this.config);

		return new Promise((resolve, reject) => {
			ldes.on('data', (member: IData) => {
				this.fragmentContext.fragment(member, this.config, bucketizer);
			})

			ldes.on('end', () => {
				const hypermediaControls = bucketizer.getBucketHypermediaControlsMap();
				resolve(this.fragmentContext.addHypermediaControls(hypermediaControls, this.config));
			});
		})
	}

	/**
	 * Set the datasource strategy
	 */
	private setDatasource(): void {
		let datasource: IDatasource;

		switch (this.config.datasource_strategy) {
			case "ldes-client": {
				datasource = new LDESClientDatasource();
				break;
			}
			case "old-ldes-client": {
				datasource = new OldLDESClientDatasource();
				break;
			}
			default: {
				datasource = new LDESClientDatasource();
				break;
			}
		}

		this.datasourceContext.setDatasource(datasource);
	}

	/**
	 * Set the fragmentation strategy
	 */
	private setFragmentationStrategy(): void {
		let strategy: IFragmentStrategy;

		switch (this.config.fragmentation_strategy) {
			case "subject-pages": {
				strategy = new SubjectPagesFragmentStrategy();
				break;
			}
			case "substring": {
				strategy = new SubstringFragmentStrategy();
				break;
			}
			default: {
				strategy = new SubjectPagesFragmentStrategy();
				break;
			}
		}

		this.fragmentContext.setStrategy(strategy);
	}

	/**
	 * Fetch data using Datasource
	 */
	public async fetchData(): Promise<void> {
		return new Promise<void>(async (resolve, reject) => {
			try {
				this.RDFData = await this.datasourceContext.getData(this.config);
				return resolve();
			} catch (e) {
				console.error(e);
				return reject(e);
			}
		});
	}

	/**
	 * Write fetched data to the output directory supplied in the config file
	 */
	public writeData(): Promise<void> {
		return new Promise<void>(async (resolve, reject) => {
			try {
				const bucketizer = await this.fragmentContext.initBucketizer(this.config);

				const tasks: any[] = [];
				this.RDFData.forEach(member => tasks.push(this.fragmentContext.fragment(member, this.config, bucketizer)));
				await Promise.all(tasks);

				const hypermediaControls = bucketizer.getBucketHypermediaControlsMap();
				await this.fragmentContext.addHypermediaControls(hypermediaControls, this.config);

				return resolve();
			} catch (e) {
				console.error(e);
				return reject(e);
			}
		});
	}
}
