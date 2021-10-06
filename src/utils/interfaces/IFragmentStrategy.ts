import { IConfig } from '../Config';
import IData from './IData';
import { IBucketizer } from '@treecg/ldes-types';
/**
 * The FragmentStrategy interface declares operations common to all supported versions
 * of some algorithm.
 *
 * The Context uses this interface to call the algorithm defined by Concrete
 * Strategies.
 */
interface IFragmentStrategy {
    initBucketizer(config: IConfig): Promise<IBucketizer>;
    fragment(data: IData, config: IConfig, bucketizer: IBucketizer): Promise<void>;
    addHypermediaControls(hypermediaControls: Map<string, string[]>, config: IConfig): Promise<void>
}

export default IFragmentStrategy;