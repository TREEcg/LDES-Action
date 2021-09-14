"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Data = void 0;
const fs_1 = require("fs");
const FragmentContext_1 = __importDefault(require("./fragmentStrategy/FragmentContext"));
const SubjectPagesFragmentStrategy_1 = __importDefault(require("./fragmentStrategy/SubjectPagesFragmentStrategy"));
const DatasourceContext_1 = __importDefault(require("./datasourceStrategy/DatasourceContext"));
const LDESClientDatasource_1 = __importDefault(require("./datasourceStrategy/LDESClientDatasource"));
const OldLDESClientDatasource_1 = __importDefault(require("./datasourceStrategy/OldLDESClientDatasource"));
class Data {
    constructor(config) {
        this.config = config;
        this.RDFData = [];
        // create necessary directories where data will be stored
        if (!(0, fs_1.existsSync)(this.config.storage)) {
            (0, fs_1.mkdirSync)(this.config.storage);
        }
        this.datasourceContext = new DatasourceContext_1.default(new LDESClientDatasource_1.default());
        this.setDatasource();
        this.fragmentContext = new FragmentContext_1.default(new SubjectPagesFragmentStrategy_1.default());
        this.setFragmentationStrategy();
    }
    /**
     * set the datasource strategy
     */
    setDatasource() {
        let datasource;
        switch (this.config.datasource_strategy) {
            case "ldes-client": {
                datasource = new LDESClientDatasource_1.default();
                break;
            }
            case "old-ldes-client": {
                datasource = new OldLDESClientDatasource_1.default();
                break;
            }
            default: {
                datasource = new LDESClientDatasource_1.default();
                break;
            }
        }
        this.datasourceContext.setDatasource(datasource);
    }
    /**
     * set the fragmentation strategy
     */
    setFragmentationStrategy() {
        let strategy;
        switch (this.config.fragmentation_strategy) {
            case "subject-pages": {
                strategy = new SubjectPagesFragmentStrategy_1.default();
                break;
            }
            default: {
                strategy = new SubjectPagesFragmentStrategy_1.default();
                break;
            }
        }
        this.fragmentContext.setStrategy(strategy);
    }
    /**
     * fetch data using Datasource
     */
    async fetchData() {
        return new Promise(async (resolve, reject) => {
            try {
                //this.RDFData = await this.datasourceContext.getData(this.config);
                return resolve();
            }
            catch (e) {
                console.error(e);
                return reject(e);
            }
        });
    }
    /**
     * write fetched data to the output directory supplied in the config file
     */
    async writeData() {
        return new Promise(async (resolve, reject) => {
            try {
                // fragment data & write to files
                this.fragmentContext.fragment(this.RDFData, this.config);
                return resolve();
            }
            catch (e) {
                console.error(e);
                return reject(e);
            }
        });
    }
}
exports.Data = Data;
