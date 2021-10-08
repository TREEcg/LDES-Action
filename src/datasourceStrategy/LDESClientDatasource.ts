import { newEngine } from '@treecg/actor-init-ldes-client';
import type { IConfig } from '../config';
import type IData from '../IData';
import type IDatasource from './IDatasource';

class LDESClientDatasource implements IDatasource {
  async getData(config: IConfig): Promise<IData[]> {
    return new Promise<IData[]>((resolve, reject) => {
      try {
        const options = {
          emitMemberOnce: true,
          disablePolling: true,
          mimeType: 'text/turtle',
          representation: 'Quads',
        };

        const LDESClient = newEngine();
        const eventStreamSync = LDESClient.createReadStream(
          config.url,
          options,
        );

        const data: IData[] = [];

        eventStreamSync.on('data', (member: IData) => {
          data.push(member);
        });
        eventStreamSync.on('end', () => {
          console.log('No more data!');
          resolve(data);
        });
      } catch (error) {
        console.error(error);
        return reject(error);
      }
    });
  }
}

export default LDESClientDatasource;
