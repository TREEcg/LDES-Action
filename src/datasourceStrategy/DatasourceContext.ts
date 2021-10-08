import type { IConfig } from '../config';
import type IData from '../IData';
import type IDatasource from './IDatasource';

class DatasourceContext {
  private datasource: IDatasource;

  constructor(datasource: IDatasource) {
    this.datasource = datasource;
  }

  public setDatasource(datasource: IDatasource) {
    this.datasource = datasource;
  }

  public getData(config: IConfig): Promise<IData[]> {
    return this.datasource.getData(config);
  }
}

export default DatasourceContext;
