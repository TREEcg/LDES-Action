import type * as RDF from 'rdf-js';
import { IConfig } from '../config';
import IMember from '../IMember';
/**
 * The FragmentStrategy interface declares operations common to all supported versions
 * of some algorithm.
 *
 * The Context uses this interface to call the algorithm defined by Concrete
 * Strategies.
 */
interface IFragmentStrategy {
	fragment(data: IMember[], config: IConfig): void;
}

export default IFragmentStrategy;
