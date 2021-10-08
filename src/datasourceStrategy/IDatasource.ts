import type { IConfig } from '../config';
import type IData from '../IData';

interface IDatasource {
  getData: (config: IConfig) => Promise<IData[]>;
}

export default IDatasource;
