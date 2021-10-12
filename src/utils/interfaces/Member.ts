import type * as RDF from 'rdf-js';

interface Member {
  id: string;
  quads: RDF.Quad[];
}

export default Member;
