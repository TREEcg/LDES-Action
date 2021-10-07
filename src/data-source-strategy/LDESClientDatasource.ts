import type { Readable } from 'stream';
import { newEngine } from '@treecg/actor-init-ldes-client';
import type { IConfig } from '../utils/Config';
import type IData from '../utils/interfaces/IData';
import type IDatasource from '../utils/interfaces/IDatasource';

class LDESClientDatasource implements IDatasource {
  public async getData(config: IConfig): Promise<IData[]> {
    return new Promise<IData[]>((resolve, reject) => {
      try {
        const ldes = this.getLinkedDataEventStream(config.url);

        const data: IData[] = [];

        ldes.on('data', (member: IData) => {
          data.push(member);
        });

        ldes.on('end', () => {
          console.log('No more data!');
          resolve(data);
        });
      } catch (error: unknown) {
        console.error(error);
        return reject(error);
      }
    });
  }

  public getLinkedDataEventStream(url: string): Readable {
    const options = {
      emitMemberOnce: true,
      disablePolling: true,
      mimeType: 'text/turtle',
      representation: 'Quads',
    };

    const LDESClient = newEngine();
    return LDESClient.createReadStream(
      url,
      options,
    );
  }
}

export default LDESClientDatasource;
