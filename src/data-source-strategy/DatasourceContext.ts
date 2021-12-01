import type { EventStream } from '@treecg/actor-init-ldes-client';
import type Datasource from '../utils/interfaces/Datasource';

class DatasourceContext {
  private datasource: Datasource;

  public constructor(datasource: Datasource) {
    this.datasource = datasource;
  }

  public setDatasource(datasource: Datasource): void {
    this.datasource = datasource;
  }

  public getLinkedDataEventStream(url: string, storage: string): EventStream {
    return this.datasource.getLinkedDataEventStream(url, storage);
  }
}

export default DatasourceContext;
