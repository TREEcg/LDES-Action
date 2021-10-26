import type { Readable } from 'stream';
import type { Member, Bucketizer } from '@treecg/types';
import type { Config } from '../Config';

interface Datasource {
  getData: (config: Config, bucketizer: Bucketizer) => Promise<Member[]>;
  getLinkedDataEventStream: (url: string) => Readable;
}

export default Datasource;
