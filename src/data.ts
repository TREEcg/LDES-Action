import { newEngine } from '@treecg/actor-init-ldes-client';
import fs from 'fs';
import { existsSync, mkdirSync } from 'fs';
import { IConfig } from './config';
import * as N3 from 'n3';

import date from "./utils/date";
import type * as RDF from 'rdf-js';
import { literal, namedNode, blankNode, quad } from '@rdfjs/data-model';
import FragmentContext from './fragmentStrategy/FragmentContext';
import VersionFragmentStrategy from './fragmentStrategy/VersionFragmentStrategy';
import IFragmentStrategy from './fragmentStrategy/IFragmentStrategy';
import AlphabeticalFragmentStrategy from './fragmentStrategy/AlphabeticalFragmentStrategy';
import DatasourceContext from './datasourceStrategy/DatasourceContext';
import LDESClientDatasource from './datasourceStrategy/LDESClientDatasource';
import IDatasource from './datasourceStrategy/IDatasource';

export class Data {

	private readonly config: IConfig;
	private datasourceContext: DatasourceContext;
	private fragmentContext: FragmentContext;

	private RDFData: RDF.Quad[][];

	public constructor(config: IConfig) {
		this.config = config;
		this.RDFData = [];

		// create necessary directories where data will be stored
		if (!existsSync(this.config.storage)) {
			mkdirSync(this.config.storage);
		}

		this.datasourceContext = new DatasourceContext(new LDESClientDatasource());
		this.setDatasource();
		
		this.fragmentContext = new FragmentContext(new VersionFragmentStrategy());
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
			case "alphabetical": {
				strategy = new AlphabeticalFragmentStrategy();
				break;
			}
			case "version": {
				strategy = new VersionFragmentStrategy();
				break;
			}
			default: {
				strategy = new VersionFragmentStrategy();
				break;
			}
		}

		this.fragmentContext.setStrategy(strategy);

	}

	/**
	 * fetch data using the LDES client
	 
	public async fetchData(): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			try {
				let options = {
					emitMemberOnce: true,
					disablePolling: true,
					mimeType: 'text/turtle',
				};

				let LDESClient = newEngine();
				let eventStreamSync = LDESClient.createReadStream(
					this.config.url,
					options
				);

				// @ Here should come the RDF.Quad[][] implementation when it is finished in the library!
				// It should replace the current N3 Parser implementation.

				const parser = new N3.Parser({ format: 'text/turtle' });

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
						return resolve();
					}
				});
			} catch (e) {
				console.error(e);
				return reject(e);
			}
		});
	}
	*/

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

	/*
	// This code should be deprecatable when issue https://github.com/TREEcg/event-stream-client/issues/22 is fixed
	private reshapeData(): RDF.Quad[][] {
		let reshapedData: RDF.Quad[][] = [];

		let uniqueSubjects = this.store.getSubjects(null, null, null);
		console.log(uniqueSubjects[0].value);

		uniqueSubjects.forEach((subject) => {
			let subjectQuads = this.store.getQuads(subject, null, null, null);

			// N3.Quad to RDF.Quad
			
			let reshapedSubjectQuads: RDF.Quad[] = [];
			subjectQuads.forEach((_quad) => {
				let quadSubject = _quad.subject;
				let quadPredicate = _quad.predicate;
				let quadObject = _quad.object;
				let quadGraph = _quad.graph;

				let reshapedQuad = quad(quadSubject, quadPredicate,	quadObject,	quadGraph);

				reshapedSubjectQuads.push(reshapedQuad);
			});

			reshapedData.push(reshapedSubjectQuads);
			
			//console.log(subjectQuads);
			//console.log(reshapedSubjectQuads);
		});

		return reshapedData;
	}
	*/
}
