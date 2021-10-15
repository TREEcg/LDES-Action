import type { IBucketizer as Bucketizer } from '@treecg/ldes-types';
import type { Member } from '@treecg/types';
import type { Config } from '../Config';
/**
 * The FragmentStrategy interface declares operations common to all supported versions
 * of some algorithm.
 *
 * The Context uses this interface to call the algorithm defined by Concrete
 * Strategies.
 */
interface FragmentStrategy {
  initBucketizer: (config: Config) => Promise<Bucketizer>;
  fragment: (data: Member, config: Config) => Promise<void>;
  addHypermediaControls: (
    hypermediaControls: Map<string, string[]>,
    config: Config
  ) => Promise<void>;
}

export default FragmentStrategy;
