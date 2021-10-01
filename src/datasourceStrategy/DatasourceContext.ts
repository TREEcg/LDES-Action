import type * as RDF from 'rdf-js';
import { IConfig } from '../config';
import Member from '../types/Member';
import Datasource from './Datasource';

class DatasourceContext {
	private datasource: Datasource;

	constructor(datasource: Datasource) {
		this.datasource = datasource;
	}

	public setDatasource(datasource: Datasource) {
		this.datasource = datasource;
	}

	public getData(config: IConfig): Promise<Member[]> {
		return this.datasource.getData(config);
	}
}

export default DatasourceContext;
