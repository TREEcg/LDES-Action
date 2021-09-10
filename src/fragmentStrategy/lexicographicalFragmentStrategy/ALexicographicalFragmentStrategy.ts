import type * as RDF from 'rdf-js';
import { IConfig } from "../../config";
import AFragmentStrategy from "../AFragmentStrategy";
import IFragmentStrategy from "../IFragmentStrategy";

abstract class ALexicographicalFragmentStrategy extends AFragmentStrategy implements IFragmentStrategy {
    abstract fragment(data: RDF.Quad[][], config: IConfig): void;

    sort(data: RDF.Quad[][], predicate: string): RDF.Quad[][] {
        return data.sort((a, b) => {
            let identifierA = this.find(a, predicate);
            let identifierB = this.find(b, predicate);
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