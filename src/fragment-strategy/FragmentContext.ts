import type { IBucketizer } from '@treecg/ldes-types';
import type { Config } from '../utils/Config';
import type FragmentStrategy from '../utils/interfaces/FragmentStrategy';
import type Member from '../utils/interfaces/Member';

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
  public constructor(strategy: FragmentStrategy) {
    this.strategy = strategy;
  }

  /**
   * Usually, the Context allows replacing a Strategy object at runtime.
   */
  public setStrategy(strategy: FragmentStrategy): void {
    this.strategy = strategy;
  }

  /**
   * The Context delegates some work to the Strategy object instead of
   * implementing multiple versions of the algorithm on its own.
   */
  public async fragment(data: Member, config: Config): Promise<void> {
    return this.strategy.fragment(data, config);
  }

  public async addHypermediaControls(
    hypermediaControls: Map<string, string[]>,
    config: Config,
  ): Promise<void> {
    return this.strategy.addHypermediaControls(hypermediaControls, config);
  }

  public getStrategyBucketizer(config: Config): Promise<IBucketizer> {
    return new Promise(resolve =>
      resolve(this.strategy.initBucketizer(config)));
  }
}

export default FragmentContext;
