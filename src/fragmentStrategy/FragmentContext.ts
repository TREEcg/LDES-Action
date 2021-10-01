import FragmentStrategy from '../types/FragmentStrategy';
import type * as RDF from 'rdf-js';
import { Config } from '../types/Config';
import Member from '../types/Member';
import Dataset from '../types/Dataset';

/**
 * The FragmentContext defines the interface of interest to clients.
 */
class FragmentContext {
	/**
	 * @type {Strategy} The Context maintains a reference to one of the Strategy
	 * objects. The Context does not know the concrete class of a strategy. It
	 * should work with all strategies via the Strategy interface.
	 */
	private strategy: FragmentStrategy;

	/**
	 * Usually, the Context accepts a strategy through the constructor, but also
	 * provides a setter to change it at runtime.
	 */
	constructor(strategy: FragmentStrategy) {
		this.strategy = strategy;
	}

	/**
	 * Usually, the Context allows replacing a Strategy object at runtime.
	 */
	public setStrategy(strategy: FragmentStrategy) {
		this.strategy = strategy;
	}

	/**
	 * The Context delegates some work to the Strategy object instead of
	 * implementing multiple versions of the algorithm on its own.
	 */
	public fragment(data: Dataset, config: Config): void {
		this.strategy.fragment(data, config);
	}
}

export default FragmentContext;
