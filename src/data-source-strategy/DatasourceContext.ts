import { IConfig } from "../utils/Config";
import IData from '../utils/interfaces/IData';
import IDatasource from "../utils/interfaces/IDatasource";
import { Readable } from 'stream';

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

    public getLinkedDataEventStream(url: string): Readable {
        return this.datasource.getLinkedDataEventStream(url);
    }
}

export default DatasourceContext;