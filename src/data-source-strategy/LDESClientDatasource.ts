import type { EventStream } from '@treecg/actor-init-ldes-client';
import { newEngine } from '@treecg/actor-init-ldes-client';
import type Datasource from '../utils/interfaces/Datasource';
import type { LDESActionState } from '../utils/State';
import { loadState } from '../utils/State';

class LDESClientDatasource implements Datasource {
  public getLinkedDataEventStream(url: string, storage: string): EventStream {
    const options = {
      emitMemberOnce: true,
      disableSynchronization: false,
      mimeType: 'text/turtle',
      representation: 'Quads',
    };

    const LDESClient = newEngine();
    const state: LDESActionState | null = loadState(storage);
    if (state === null) {
      return LDESClient.createReadStream(url, options);
    }

    return LDESClient.createReadStream(url, options, state.LDESClientState);
  }
}

export default LDESClientDatasource;
