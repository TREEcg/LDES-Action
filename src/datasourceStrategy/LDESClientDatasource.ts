import type * as RDF from 'rdf-js';
import { literal, namedNode, blankNode, quad } from '@rdfjs/data-model';
import { IConfig } from '../config';
import Datasource from '../types/Datasource';
import { newEngine } from '@treecg/actor-init-ldes-client';
import Member from '../types/Member';

class LDESClientDatasource implements Datasource {
	async getData(config: IConfig): Promise<Member[]> {
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

				eventStreamSync.on('data', (member: Member) => {
					data.push(member);
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
