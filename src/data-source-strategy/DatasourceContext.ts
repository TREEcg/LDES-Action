import { IConfig } from "../utils/Config";
import IData from '../utils/IData';
import IDatasource from "./IDatasource";

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