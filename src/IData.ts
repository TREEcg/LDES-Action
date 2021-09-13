import type * as RDF from 'rdf-js';

interface IData {
    id: string,
    quads: RDF.Quad[],
}

export default IData;