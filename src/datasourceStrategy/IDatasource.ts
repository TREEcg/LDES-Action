import type * as RDF from 'rdf-js';
import { IConfig } from '../config';

interface IDatasource {
    getData(config: IConfig): Promise<RDF.Quad[][]>;
}

export default IDatasource;