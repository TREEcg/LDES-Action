import type { EventStream } from '@treecg/actor-init-ldes-client';

interface Datasource {
  getLinkedDataEventStream: (url: string, storage: string) => EventStream;
}

export default Datasource;
