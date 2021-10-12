import type * as RDF from 'rdf-js';

// eslint-disable-next-line @typescript-eslint/naming-convention
interface Member {
	id: string;
	quads: RDF.Quad[];
}

export default Member;
