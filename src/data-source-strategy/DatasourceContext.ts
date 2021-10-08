import type { Readable } from 'stream';
import type { IBucketizer } from '@treecg/ldes-types';
import type { IConfig } from '../utils/Config';
import type IData from '../utils/interfaces/IData';
import type IDatasource from '../utils/interfaces/IDatasource';

class DatasourceContext {
  private datasource: IDatasource;

  public constructor(datasource: IDatasource) {
    this.datasource = datasource;
  }

  public setDatasource(datasource: IDatasource): void {
    this.datasource = datasource;
  }

  public getData(config: IConfig, bucketizer: IBucketizer): Promise<IData[]> {
    return this.datasource.getData(config, bucketizer);
  }

  public getLinkedDataEventStream(url: string): Readable {
    return this.datasource.getLinkedDataEventStream(url);
  }
}

export default DatasourceContext;
