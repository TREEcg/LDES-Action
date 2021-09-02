import type * as RDF from 'rdf-js';
/**
 * The FragmentStrategy interface declares operations common to all supported versions
 * of some algorithm.
 *
 * The Context uses this interface to call the algorithm defined by Concrete
 * Strategies.
 */
interface IFragmentStrategy {
    fragment(data: RDF.Quad[][], config: {}): void;
}

export default IFragmentStrategy;