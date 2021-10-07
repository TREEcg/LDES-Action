import IFragmentStrategy from '../utils/interfaces/IFragmentStrategy';
import { IConfig } from '../utils/Config';
import IData from '../utils/interfaces/IData';
import { IBucketizer } from '@treecg/ldes-types';

/**
 * The FragmentContext defines the interface of interest to clients.
 */
class FragmentContext {
    /**
     * @type {Strategy} The Context maintains a reference to one of the Strategy
     * objects. The Context does not know the concrete class of a strategy. It
     * should work with all strategies via the Strategy interface.
     */
    private strategy: IFragmentStrategy;

    /**
     * Usually, the Context accepts a strategy through the constructor, but also
     * provides a setter to change it at runtime.
     */
    constructor(strategy: IFragmentStrategy) {
        this.strategy = strategy;
    }

    /**
     * Usually, the Context allows replacing a Strategy object at runtime.
     */
    public setStrategy(strategy: IFragmentStrategy) {
        this.strategy = strategy;
    }

    public initBucketizer(config: IConfig): Promise<IBucketizer> {
        return this.strategy.initBucketizer(config);
    }

    /**
     * The Context delegates some work to the Strategy object instead of
     * implementing multiple versions of the algorithm on its own.
     */
    public async fragment(data: IData, config: IConfig, bucketizer: IBucketizer): Promise<void> {
        return this.strategy.fragment(data, config, bucketizer);
    }

    public async addHypermediaControls(hypermediaControls: Map<string, string[]>, config: IConfig): Promise<void> {
        return this.strategy.addHypermediaControls(hypermediaControls, config);
    }
}

export default FragmentContext;