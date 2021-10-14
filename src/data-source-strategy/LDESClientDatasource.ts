import type { Readable } from 'stream';
import { newEngine } from '@treecg/actor-init-ldes-client';
import type { IBucketizer } from '@treecg/ldes-types';
import type { Config } from '../utils/Config';
import type Datasource from '../utils/interfaces/Datasource';
import type Member from '../utils/interfaces/Member';

class LDESClientDatasource implements Datasource {
  public async getData(
    config: Config,
    bucketizer: IBucketizer,
  ): Promise<Member[]> {
    return new Promise<Member[]>((resolve, reject) => {
      try {
        const ldes = this.getLinkedDataEventStream(config.url);

        const data: Member[] = [];

        ldes.on('data', (member: Member) => {
          bucketizer.bucketize(member.quads, member.id);
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
    return LDESClient.createReadStream(url, options);
  }
}

export default LDESClientDatasource;
