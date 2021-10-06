import type * as RDF from 'rdf-js';
import { literal, namedNode, blankNode, quad } from '@rdfjs/data-model';
import { IConfig } from '../utils/Config';
import IDatasource from './IDatasource';
import { newEngine } from '@treecg/actor-init-ldes-client';
import IData from '../utils/IData';

class LDESClientDatasource implements IDatasource {

    async getData(config: IConfig): Promise<IData[]> {
        return new Promise<IData[]>((resolve, reject) => {
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

                let data: IData[] = [];

                eventStreamSync.on('data', (member : IData) => {
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