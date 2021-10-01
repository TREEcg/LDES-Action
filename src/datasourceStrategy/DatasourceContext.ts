import type * as RDF from 'rdf-js';
import { IConfig } from "../config";
import IMember from '../IMember';
import IDatasource from "./IDatasource";


class DatasourceContext {
    private datasource: IDatasource;

    constructor(datasource: IDatasource) {
        this.datasource = datasource;
    }

    public setDatasource(datasource: IDatasource) {
        this.datasource = datasource;
    }

    public getData(config: IConfig): Promise<IMember[]> {
        return this.datasource.getData(config);
    }
 
}

export default DatasourceContext;