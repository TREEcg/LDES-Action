import type * as RDF from 'rdf-js';
import { IConfig } from '../utils/Config';
import IData from '../utils/IData';

interface IDatasource {
    getData(config: IConfig): Promise<IData[]>;
}

export default IDatasource;