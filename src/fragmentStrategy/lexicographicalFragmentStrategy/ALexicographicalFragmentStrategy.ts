import type * as RDF from 'rdf-js';
import { IConfig } from "../../config";
import IData from '../../IData';
import AFragmentStrategy from "../AFragmentStrategy";
import IFragmentStrategy from "../IFragmentStrategy";

abstract class ALexicographicalFragmentStrategy extends AFragmentStrategy implements IFragmentStrategy {
    abstract fragment(data: IData[], config: IConfig): void;

    sort(data: IData[], predicate: string): IData[] {
        return data.sort((a, b) => {
            let identifierA = this.find(a.quads, predicate);
            let identifierB = this.find(b.quads, predicate);
            return identifierA.localeCompare(identifierB);
        });
    }

    getFileLocation(index: number, config: IConfig): string {
        // file location
        const fileName = String(index).padStart(5, '0');
        return `${config.storage}/${fileName}.ttl`;
    }
}


export default ALexicographicalFragmentStrategy;