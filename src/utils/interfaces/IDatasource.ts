import type { Readable } from 'stream';
import type { IBucketizer } from '@treecg/ldes-types';
import type { IConfig } from '../Config';
import type IData from './IData';

interface IDatasource {
  getData: (config: IConfig, bucketizer: IBucketizer) => Promise<IData[]>;
  getLinkedDataEventStream: (url: string) => Readable;
}

export default IDatasource;
