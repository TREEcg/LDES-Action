import type { Readable } from 'stream';
import type { IConfig } from '../Config';
import type IData from './IData';

interface IDatasource {
  getData: (config: IConfig) => Promise<IData[]>;
  getLinkedDataEventStream: (url: string) => Readable;
}

export default IDatasource;
