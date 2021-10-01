import type * as RDF from 'rdf-js';
import { Config } from './Config';
import Member from './Member';
/**
 * The FragmentStrategy interface declares operations common to all supported versions
 * of some algorithm.
 *
 * The Context uses this interface to call the algorithm defined by Concrete
 * Strategies.
 */
interface FragmentStrategy {
	fragment(data: Member[], config: Config): void;
}

export default FragmentStrategy;
