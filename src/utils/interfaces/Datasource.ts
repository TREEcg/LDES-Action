import type { Readable } from 'stream';
import type { IBucketizer } from '@treecg/ldes-types';
import type { Member } from '@treecg/types';
import type { Config } from '../Config';

interface Datasource {
  getData: (config: Config, bucketizer: IBucketizer) => Promise<Member[]>;
  getLinkedDataEventStream: (url: string) => Readable;
}

export default Datasource;
