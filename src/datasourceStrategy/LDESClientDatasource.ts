import type * as RDF from 'rdf-js';
import { literal, namedNode, blankNode, quad } from '@rdfjs/data-model';
import { IConfig } from '../config';
import IDatasource from './IDatasource';
import { newEngine } from '@treecg/actor-init-ldes-client';
import IMember from '../IMember';

class LDESClientDatasource implements IDatasource {

    async getData(config: IConfig): Promise<IMember[]> {
        return new Promise<IMember[]>((resolve, reject) => {
            try {
                let options = {
                    emitMemberOnce: true,
                    disablePolling: true,
                    mimeType: 'text/turtle',
                    representation: "Quads",
                };

                let LDESClient = newEngine();
                let eventStreamSync = LDESClient.createReadStream(
                    config.url,
                    options
                );

                let data: IMember[] = [];

                eventStreamSync.on('data', (member : IMember) => {
                    data.push(member);
                });
                eventStreamSync.on('end', () => {
                    console.log("No more data!");
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