import type * as RDF from 'rdf-js';
import { literal, namedNode, blankNode, quad } from '@rdfjs/data-model';
import { IConfig } from '../config';
import Datasource from '../types/Datasource';
import * as N3 from 'n3';
import { newEngine } from '@treecg/actor-init-ldes-client';
import Member from '../types/Member';

class OldLDESClientDatasource implements Datasource {
	private store: N3.Store;

	constructor() {
		this.store = new N3.Store();
	}

	async getData(config: IConfig): Promise<Member[]> {
		await this.fetchData(config);
		return await this.reshapeData();
	}

	private async fetchData(config: IConfig): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			try {
				let options = {
					emitMemberOnce: true,
					disablePolling: true,
					mimeType: 'text/turtle',
				};

				let LDESClient = newEngine();
				let eventStreamSync = LDESClient.createReadStream(config.url, options);

				// @ Here should come the RDF.Quad[][] implementation when it is finished in the library!
				// It should replace the current N3 Parser implementation.
				const parser = new N3.Parser({ format: 'text/turtle' });

				// read quads and add them to triple store
				// @ts-ignore
				parser.parse(eventStreamSync, (err, quad, prefs) => {
					if (err) {
						throw err;
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

	/*
	 * This code should be deprecatable when issue https://github.com/TREEcg/event-stream-client/issues/22 is fixed
	 */
	private async reshapeData(): Promise<Member[]> {
		return new Promise<Member[]>((resolve, reject) => {
			try {
				let reshapedData: Member[] = [];

				let uniqueSubjects = this.store.getSubjects(null, null, null);

				uniqueSubjects.forEach((subject) => {
					let subjectQuads = this.store.getQuads(subject, null, null, null);

					// N3.Quad to RDF.Quad
					let reshapedSubjectQuads: RDF.Quad[] = [];
					subjectQuads.forEach((_quad) => {
						let quadSubject = _quad.subject;
						let quadPredicate = _quad.predicate;
						let quadObject = _quad.object;
						let quadGraph = _quad.graph;

						let reshapedQuad = quad(
							quadSubject,
							quadPredicate,
							quadObject,
							quadGraph
						);

						reshapedSubjectQuads.push(reshapedQuad);
					});

					reshapedData.push({
						id: subject.value,
						quads: reshapedSubjectQuads,
					});
				});

				return resolve(reshapedData);
			} catch (e) {
				console.error(e);
				return reject(e);
			}
		});
	}
}

export default OldLDESClientDatasource;
