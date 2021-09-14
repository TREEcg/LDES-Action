"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const data_model_1 = require("@rdfjs/data-model");
const N3 = __importStar(require("n3"));
const actor_init_ldes_client_1 = require("@treecg/actor-init-ldes-client");
class OldLDESClientDatasource {
    constructor() {
        this.store = new N3.Store();
    }
    async getData(config) {
        await this.fetchData(config);
        return await this.reshapeData();
    }
    async fetchData(config) {
        return new Promise((resolve, reject) => {
            try {
                let options = {
                    emitMemberOnce: true,
                    disablePolling: true,
                    mimeType: 'text/turtle',
                };
                let LDESClient = (0, actor_init_ldes_client_1.newEngine)();
                let eventStreamSync = LDESClient.createReadStream(config.url, options);
                // @ Here should come the RDF.Quad[][] implementation when it is finished in the library!
                // It should replace the current N3 Parser implementation.
                const parser = new N3.Parser({ format: 'text/turtle' });
                // read quads and add them to triple store
                // @ts-ignore
                parser.parse(eventStreamSync, (err, quad, prefs) => {
                    if (err) {
                        throw (err);
                    }
                    if (prefs) {
                        console.log('prefixes:', prefs);
                    }
                    if (quad) {
                        this.store.addQuad(quad);
                    }
                    else {
                        return resolve();
                    }
                });
            }
            catch (e) {
                console.error(e);
                return reject(e);
            }
        });
    }
    /*
     * This code should be deprecatable when issue https://github.com/TREEcg/event-stream-client/issues/22 is fixed
     */
    async reshapeData() {
        return new Promise((resolve, reject) => {
            try {
                let reshapedData = [];
                let uniqueSubjects = this.store.getSubjects(null, null, null);
                uniqueSubjects.forEach((subject) => {
                    let subjectQuads = this.store.getQuads(subject, null, null, null);
                    // N3.Quad to RDF.Quad			
                    let reshapedSubjectQuads = [];
                    subjectQuads.forEach((_quad) => {
                        let quadSubject = _quad.subject;
                        let quadPredicate = _quad.predicate;
                        let quadObject = _quad.object;
                        let quadGraph = _quad.graph;
                        let reshapedQuad = (0, data_model_1.quad)(quadSubject, quadPredicate, quadObject, quadGraph);
                        reshapedSubjectQuads.push(reshapedQuad);
                    });
                    reshapedData.push({
                        id: subject.value,
                        quads: reshapedSubjectQuads
                    });
                });
                return resolve(reshapedData);
            }
            catch (e) {
                console.error(e);
                return reject(e);
            }
        });
    }
}
exports.default = OldLDESClientDatasource;
