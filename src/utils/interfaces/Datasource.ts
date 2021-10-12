import type { Readable } from 'stream';
import type { IBucketizer } from '@treecg/ldes-types';
import type { Config } from '../Config';
import type Member from './Member';

interface Datasource {
  getData: (config: Config, bucketizer: IBucketizer) => Promise<Member[]>;
  getLinkedDataEventStream: (url: string) => Readable;
}

export default Datasource;
