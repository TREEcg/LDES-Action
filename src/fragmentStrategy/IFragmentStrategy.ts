import type { IConfig } from '../config';
import type IData from '../IData';
/**
 * The FragmentStrategy interface declares operations common to all supported versions
 * of some algorithm.
 *
 * The Context uses this interface to call the algorithm defined by Concrete
 * Strategies.
 */
interface IFragmentStrategy {
  fragment: (data: IData[], config: IConfig) => void;
}

export default IFragmentStrategy;
