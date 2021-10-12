import type { Config } from './Config';
import type Member from './Member';
/**
 * The FragmentStrategy interface declares operations common to all supported versions
 * of some algorithm.
 *
 * The Context uses this interface to call the algorithm defined by Concrete
 * Strategies.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
interface FragmentStrategy {
  fragment: (data: Member[], config: Config) => void;
}

export default FragmentStrategy;
