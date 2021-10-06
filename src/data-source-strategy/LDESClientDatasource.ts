import type * as RDF from 'rdf-js';
import { literal, namedNode, blankNode, quad } from '@rdfjs/data-model';
import { IConfig } from '../utils/Config';
import IDatasource from '../utils/interfaces/IDatasource';
import { newEngine } from '@treecg/actor-init-ldes-client';
import IData from '../utils/interfaces/IData';
import { Readable } from 'stream';

class LDESClientDatasource implements IDatasource {

    async getData(config: IConfig): Promise<IData[]> {
        return new Promise<IData[]>((resolve, reject) => {
            try {
                const ldes = this.getLinkedDataEventStream(config.url);

                let data: IData[] = [];

                ldes.on('data', (member: IData) => {
                    data.push(member);
                });

                ldes.on('end', () => {
                    console.log("No more data!");
                    resolve(data);
                });
            } catch (e) {
                console.error(e);
                return reject(e);
            }
        });
    }

    getLinkedDataEventStream(url: string): Readable {
        let options = {
            emitMemberOnce: true,
            disablePolling: true,
            mimeType: 'text/turtle',
            representation: "Quads",
        };

        let LDESClient = newEngine();
        return LDESClient.createReadStream(
            url,
            options
        );
    }

}

export default LDESClientDatasource;