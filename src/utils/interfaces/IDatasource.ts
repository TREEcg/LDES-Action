import type * as RDF from 'rdf-js';
import { IConfig } from '../Config';
import IData from './IData';
import { Readable } from 'stream';

interface IDatasource {
    getData(config: IConfig): Promise<IData[]>;
    getLinkedDataEventStream(url: string): Readable;
}

export default IDatasource;