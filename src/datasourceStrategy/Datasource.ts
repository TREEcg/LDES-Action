import type * as RDF from 'rdf-js';
import { IConfig } from '../config';
import Member from '../types/Member';

interface Datasource {
	getData(config: IConfig): Promise<Member[]>;
}

export default Datasource;
