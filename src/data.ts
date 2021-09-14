import { existsSync, mkdirSync } from 'fs';
import { IConfig } from './config';

import type * as RDF from 'rdf-js';
import FragmentContext from './fragmentStrategy/FragmentContext';
import SubjectPagesFragmentStrategy from './fragmentStrategy/SubjectPagesFragmentStrategy';
import IFragmentStrategy from './fragmentStrategy/IFragmentStrategy';
import DatasourceContext from './datasourceStrategy/DatasourceContext';
import LDESClientDatasource from './datasourceStrategy/LDESClientDatasource';
import IDatasource from './datasourceStrategy/IDatasource';
import OldLDESClientDatasource from './datasourceStrategy/OldLDESClientDatasource';
import IData from './IData';

export class Data {

	private readonly config: IConfig;
	private datasourceContext: DatasourceContext;
	private fragmentContext: FragmentContext;

	private RDFData: IData[];

	public constructor(config: IConfig) {
		this.config = config;
		this.RDFData = [];

		// create necessary directories where data will be stored
		if (!existsSync(this.config.storage)) {
			mkdirSync(this.config.storage);
		}

		this.datasourceContext = new DatasourceContext(new LDESClientDatasource());
		this.setDatasource();
		
		this.fragmentContext = new FragmentContext(new SubjectPagesFragmentStrategy());
		this.setFragmentationStrategy();

	}

	/**
	 * set the datasource strategy
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
	 * set the fragmentation strategy
	 */
	private setFragmentationStrategy(): void {
		let strategy: IFragmentStrategy;
		switch (this.config.fragmentation_strategy) {
			case "subject-pages": {
				strategy = new SubjectPagesFragmentStrategy();
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
	 * fetch data using Datasource
	 */
	public async fetchData():  Promise<void> {
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
	 * write fetched data to the output directory supplied in the config file
	 */
	public async writeData(): Promise<void> {
		return new Promise<void>(async (resolve, reject) => {
			try {
				// fragment data & write to files
				this.fragmentContext.fragment(this.RDFData, this.config);

				return resolve();
			} catch (e) {
				console.error(e);
				return reject(e);
			}
		});
	}

}
