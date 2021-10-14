import type { Readable } from 'stream';
import type { IBucketizer } from '@treecg/ldes-types';
import type { Member } from '@treecg/types';
import type { Config } from '../utils/Config';
import type Datasource from '../utils/interfaces/Datasource';

class DatasourceContext {
  private datasource: Datasource;

  public constructor(datasource: Datasource) {
    this.datasource = datasource;
  }

  public setDatasource(datasource: Datasource): void {
    this.datasource = datasource;
  }

  public getData(config: Config, bucketizer: IBucketizer): Promise<Member[]> {
    return this.datasource.getData(config, bucketizer);
  }

  public getLinkedDataEventStream(url: string): Readable {
    return this.datasource.getLinkedDataEventStream(url);
  }
}

export default DatasourceContext;
