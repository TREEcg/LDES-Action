import type { EventStream, State } from '@treecg/actor-init-ldes-client';
import { newEngine } from '@treecg/actor-init-ldes-client';
import type { Member, Bucketizer } from '@treecg/types';
import type { Config } from '../utils/Config';
import type Datasource from '../utils/interfaces/Datasource';
import { loadState, saveState } from '../utils/State';

class LDESClientDatasource implements Datasource {
  public async getData(
    config: Config,
    bucketizer: Bucketizer,
  ): Promise<Member[]> {
    return new Promise<Member[]>((resolve, reject) => {
      try {
        const ldes = this.getLinkedDataEventStream(config.url);

        const data: Member[] = [];

        ldes.on('data', (member: Member) => {
          bucketizer.bucketize(member.quads, member.id.value);
          data.push(member);
        });

        ldes.on('now only syncing', () => {
          console.log('now only syncing');
          ldes.pause();
        });

        ldes.on('pause', () => {
          saveState(ldes.exportState());

          console.log('No more data!');
          resolve(data);
        });
      } catch (error: unknown) {
        console.error(error);
        return reject(error);
      }
    });
  }

  public getLinkedDataEventStream(url: string): EventStream {
    const options = {
      emitMemberOnce: true,
      disableSynchronization: false,
      mimeType: 'text/turtle',
      representation: 'Quads',
    };

    const LDESClient = newEngine();
    const state: State | null = loadState();
    if (state === null) {
      return LDESClient.createReadStream(url, options);
    }

    return LDESClient.createReadStream(url, options, state);
  }
}

export default LDESClientDatasource;
