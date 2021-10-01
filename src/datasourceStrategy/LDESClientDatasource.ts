import type * as RDF from 'rdf-js';
import { literal, namedNode, blankNode, quad } from '@rdfjs/data-model';
import { Config } from '../types/Config';
import Datasource from '../types/Datasource';
import { newEngine } from '@treecg/actor-init-ldes-client';
import Member from '../types/Member';
import Metadata from '../types/Metadata';

class LDESClientDatasource implements Datasource {
	async getData(config: Config): Promise<Member[]> {
		return new Promise<Member[]>((resolve, reject) => {
			try {
				let options = {
					emitMemberOnce: true,
					disablePolling: true,
					mimeType: 'text/turtle',
					representation: 'Quads',
				};

				let LDESClient = newEngine();
				let eventStreamSync = LDESClient.createReadStream(config.url, options);

				let data: Member[] = [];
				let metadata: Metadata[] = [];

				eventStreamSync.on('data', (member: Member) => {
					data.push(member);
				});

				eventStreamSync.on('metadata', (_metadata: Metadata) => {
					// follows the structure of the TREE metadata extractor (https://github.com/TREEcg/tree-metadata-extraction#extracted-metadata)
					//if (_metadata.treeMetadata) console.log(_metadata.treeMetadata);
					//console.log(_metadata.url); // page from where metadata has been extracted

					console.log(_metadata);
					//console.log(metadata.treeMetadata.collections.values().next().value.member);

					metadata.push(_metadata);
				});

				eventStreamSync.on('end', () => {
					console.log('No more data!');
					resolve(data);
				});
			} catch (e) {
				console.error(e);
				return reject(e);
			}
		});
	}
}

export default LDESClientDatasource;
