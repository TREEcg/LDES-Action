import type { Member, Bucketizer, RelationParameters } from '@treecg/types';
import type { Config } from '../utils/Config';
import { FileExtension } from '../utils/FileExtension';
import type FragmentStrategy from '../utils/interfaces/FragmentStrategy';

/**
 * The FragmentContext defines the interface of interest to clients.
 */
class FragmentContext {
  /**
   * @type {FragmentStrategy} The Context maintains a reference to one of the Strategy
   * objects. The Context does not know the concrete class of a strategy. It
   * should work with all strategies via the Strategy interface.
   */
  private readonly strategy: FragmentStrategy;

  /**
   * @type {FileExtension} Holds the file extension of the buckets.
   * Default set to Turtle, but can be changed at runtime
   */
  private fileExtension: FileExtension;

  /**
   * Usually, the Context accepts a strategy through the constructor, but also
   * provides a setter to change it at runtime.
   */
  public constructor(strategy: FragmentStrategy) {
    this.strategy = strategy;
    this.fileExtension = FileExtension.Turtle;
  }

  /**
   * The Context delegates some work to the Strategy object instead of
   * implementing multiple versions of the algorithm on its own.
   */
  public async fragment(data: Member, config: Config): Promise<void> {
    return this.strategy.fragment(data, config, this.fileExtension);
  }

  public async addHypermediaControls(
    hypermediaControls: Map<string, RelationParameters[]>,
    config: Config,
  ): Promise<void> {
    return this.strategy.addHypermediaControls(hypermediaControls, config, this.fileExtension);
  }

  public getStrategyBucketizer(config: Config): Promise<Bucketizer> {
    return new Promise(resolve =>
      resolve(this.strategy.initBucketizer(config)));
  }

  public getStrategy(): FragmentStrategy {
    return this.strategy;
  }

  public setFileExtension(extension: FileExtension): void {
    this.fileExtension = extension;
  }
}

export default FragmentContext;
