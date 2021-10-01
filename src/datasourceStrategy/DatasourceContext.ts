import type * as RDF from 'rdf-js';
import { Config } from '../types/Config';
import Member from '../types/Member';
import Datasource from '../types/Datasource';

class DatasourceContext {
	private datasource: Datasource;

	constructor(datasource: Datasource) {
		this.datasource = datasource;
	}

	public setDatasource(datasource: Datasource) {
		this.datasource = datasource;
	}

	public getData(config: Config): Promise<Member[]> {
		return this.datasource.getData(config);
	}
}

export default DatasourceContext;
