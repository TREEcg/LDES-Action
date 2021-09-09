import type * as RDF from 'rdf-js';
import { IConfig } from '../config';
import IFragmentStrategy from './IFragmentStrategy';
/**
 * The FragmentStrategy interface declares operations common to all supported versions
 * of some algorithm.
 *
 * The Context uses this interface to call the algorithm defined by Concrete
 * Strategies.
 */
abstract class AFragmentStrategy implements IFragmentStrategy {
    abstract fragment(data: RDF.Quad[][], config: IConfig): void;

    // return the object value mathching a specific predicate
    find(data: RDF.Quad[], predicate: string): string {
        const found = data.find(element => element.predicate.value === predicate);
        return (found === undefined) ? 'undefined' : found.object.value;
    }

    // return a list of all the unique predicate values
    findAllMembers(data: RDF.Quad[]): string[] { 
        return [... new Set(data.map(element => element.subject.value))];
    }
}

export default AFragmentStrategy;