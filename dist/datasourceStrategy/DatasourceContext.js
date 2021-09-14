"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DatasourceContext {
    constructor(datasource) {
        this.datasource = datasource;
    }
    setDatasource(datasource) {
        this.datasource = datasource;
    }
    getData(config) {
        return this.datasource.getData(config);
    }
}
exports.default = DatasourceContext;
