import type * as RDF from 'rdf-js';

interface Metadata {
	url: string;
	treeMetadata: TreeMetadata;
	//metadata: { treeMetadata: TreeMetadata };
}

interface TreeMetadata {
	collections: Collection;
	nodes: Node;
	relations: Relation;
}

/*
This is a copy from https://github.com/TREEcg/tree-metadata-extraction/blob/master/src/util/Util.ts
*/
interface Collection {
	'@context'?: string | object;
	'@id': string;
	'@type'?: string[];
	view?: URI[];
	subset?: URI[];
	member?: Member[];
	shape?: Shape[];
	totalItems?: Literal[];
	import?: URI[];
	importStream?: URI[];
	conditionalImport?: ConditionalImport[];
	[property: string]: any;
}

interface Node {
	'@context'?: string | object;
	'@id': string;
	'@type'?: string[];
	relation?: URI[]; // Note hydra:next / as:next links are added as Relations of type tree:relation with the target node as the target of the next relation
	search?: IriTemplate[];
	retentionPolicy?: RetentionPolicy[];
	import?: URI[];
	importStream?: URI[];
	conditionalImport?: ConditionalImport[];
	[property: string]: any;
}

interface Relation {
	'@context': any;
	'@id': string;
	'@type'?: string[];
	remainingItems?: Literal[];
	path?: any[];
	value?: any[];
	node?: URI[];
	import?: URI[];
	importStream?: URI[];
	conditionalImport?: ConditionalImport[];
}

interface Member {
	'@id'?: string;
	[property: string]: any;
}

interface Shape {
	'@id'?: string;
	[property: string]: any;
}

interface IriTemplate {
	'@id'?: string;
	[property: string]: any;
}
interface ConditionalImport {
	'@id'?: string;
	import?: any[];
	importStream?: any[];
	conditionalImport?: any[];
}

interface RetentionPolicy {
	'@id'?: string;
	'@type'?: string[];
	amount?: Literal[];
	versionKey?: string[];
	path?: any[];
	value?: any[];
}

interface Literal {
	'@value': string;
	'@type'?: string;
	'@language'?: string;
}

interface URI {
	'@id': string;
}

export default Metadata;
