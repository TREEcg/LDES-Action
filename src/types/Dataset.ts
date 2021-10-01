import type * as RDF from 'rdf-js';
import Member from './Member';
import Metadata from './Metadata';

interface Dataset {
	data: Member[];
	metadata: Metadata[];
}

export default Dataset;