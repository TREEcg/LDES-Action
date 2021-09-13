import type * as RDF from 'rdf-js';
import { IConfig } from '../config';
import IData from '../IData';

interface IDatasource {
    getData(config: IConfig): Promise<IData[]>;
}

export default IDatasource;