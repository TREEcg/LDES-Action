import type { IBucketizer } from '@treecg/ldes-types';
import type { IConfig } from '../Config';
import type Member from './Member';
/**
 * The FragmentStrategy interface declares operations common to all supported versions
 * of some algorithm.
 *
 * The Context uses this interface to call the algorithm defined by Concrete
 * Strategies.
 */
interface IFragmentStrategy {
  initBucketizer: (config: IConfig) => Promise<IBucketizer>;
  fragment: (data: Member, config: IConfig) => Promise<void>;
  addHypermediaControls: (hypermediaControls: Map<string, string[]>, config: IConfig) => Promise<void>;
}

export default IFragmentStrategy;
