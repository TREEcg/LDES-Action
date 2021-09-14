import { DataFactory,NamedNode,Quad } from 'rdf-data-factory';
import { materialize } from '@treecg/version-materialize-rdf.js'
import * as RDF from 'rdf-js';
import IData from '../IData';

export async function materializeVersion(data: IData[]) {
  //dit is een foreach kind of situation

  data.forEach((_data: IData) => {
    const factory: RDF.DataFactory = new DataFactory();
    let options = {
      "versionOfProperty": factory.namedNode('http://purl.org/dc/terms/isVersionOf'), // defaults to dcterms:isVersionOf
      "timestampProperty": factory.namedNode('http://purl.org/dc/terms/created'), // defaults to dcterms:created, but there may be good reasons to change this to e.g., prov:generatedAtTime
      "addRdfStreamProcessingTriple": true
    };
    _data.quads = materialize(_data.quads, options);

    let rdf =  factory.quad(
      factory.namedNode('test'),
      factory.namedNode('test'),
      factory.namedNode('test')
    );

    _data.quads.push(rdf);
  });



}