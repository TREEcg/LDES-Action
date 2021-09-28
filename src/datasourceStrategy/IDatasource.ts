import type * as RDF from 'rdf-js';
import { IConfig } from '../config';
import IMember from '../IMember';

interface IDatasource {
    getData(config: IConfig): Promise<IMember[]>;
}

export default IDatasource;