import type { Member, Bucketizer, RelationParameters } from '@treecg/types';
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
  fragment: (data: Member, config: Config, fileExtension: string) => Promise<void>;
  addHypermediaControls: (
    hypermediaControls: Map<string, RelationParameters[]>,
    config: Config,
    fileExtension: string,
  ) => Promise<void>;
}
export default FragmentStrategy;
