import type * as RDF from 'rdf-js';

interface IMember {
	id: string;
	quads: RDF.Quad[];
}

export default IMember;
