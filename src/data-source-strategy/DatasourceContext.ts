import type { EventStream } from '@treecg/actor-init-ldes-client';
import type { Member, Bucketizer } from '@treecg/types';
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

  public getData(config: Config, bucketizer: Bucketizer): Promise<Member[]> {
    return this.datasource.getData(config, bucketizer);
  }

  public getLinkedDataEventStream(url: string): EventStream {
    return this.datasource.getLinkedDataEventStream(url);
  }
}

export default DatasourceContext;
