import type * as RDF from 'rdf-js';
import { Config } from './Config';
import Member from './Member';

interface Datasource {
	getData(config: Config): Promise<Member[]>;
}

export default Datasource;
