import type { Readable } from 'stream';
import type { IBucketizer } from '@treecg/ldes-types';
import type { IConfig } from '../Config';
import type Member from './Member';

interface IDatasource {
  getData: (config: IConfig, bucketizer: IBucketizer) => Promise<Member[]>;
  getLinkedDataEventStream: (url: string) => Readable;
}

export default IDatasource;
