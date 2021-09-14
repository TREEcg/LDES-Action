"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.materializeVersion = void 0;
const rdf_data_factory_1 = require("rdf-data-factory");
const version_materialize_rdf_js_1 = require("@treecg/version-materialize-rdf.js");
async function materializeVersion(data) {
    //dit is een foreach kind of situation
    data.forEach((_data) => {
        const factory = new rdf_data_factory_1.DataFactory();
        let options = {
            "versionOfProperty": factory.namedNode('http://purl.org/dc/terms/isVersionOf'),
            "timestampProperty": factory.namedNode('http://purl.org/dc/terms/created'),
            "addRdfStreamProcessingTriple": true
        };
        _data.quads = (0, version_materialize_rdf_js_1.materialize)(_data.quads, options);
    });
}
exports.materializeVersion = materializeVersion;
