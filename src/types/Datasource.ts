import type * as RDF from 'rdf-js';
import { Config } from './Config';
import Dataset from './Dataset';

interface Datasource {
	getData(config: Config): Promise<Dataset>;
}

export default Datasource;
