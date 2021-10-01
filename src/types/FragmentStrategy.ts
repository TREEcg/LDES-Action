import type * as RDF from 'rdf-js';
import { Config } from './Config';
import Dataset from './Dataset';

/**
 * The FragmentStrategy interface declares operations common to all supported versions
 * of some algorithm.
 *
 * The Context uses this interface to call the algorithm defined by Concrete
 * Strategies.
 */
interface FragmentStrategy {
	fragment(data: Dataset, config: Config): void;
}

export default FragmentStrategy;
