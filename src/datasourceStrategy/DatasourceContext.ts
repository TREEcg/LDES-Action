import type * as RDF from 'rdf-js';
import { Config } from '../types/Config';
import Member from '../types/Member';
import Datasource from '../types/Datasource';
import Dataset from '../types/Dataset';

class DatasourceContext {
	private datasource: Datasource;

	constructor(datasource: Datasource) {
		this.datasource = datasource;
	}

	public setDatasource(datasource: Datasource) {
		this.datasource = datasource;
	}

	public getData(config: Config): Promise<Dataset> {
		return this.datasource.getData(config);
	}
}

export default DatasourceContext;
