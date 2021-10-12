import { existsSync, mkdirSync } from 'fs';

import type { IBucketizer } from '@treecg/ldes-types';
import DatasourceContext from './data-source-strategy/DatasourceContext';
import LDESClientDatasource from './data-source-strategy/LDESClientDatasource';
import BasicFragmentStrategy from './fragment-strategy/BasicFragmentStrategy';
import FragmentContext from './fragment-strategy/FragmentContext';
import SubjectPagesFragmentStrategy from './fragment-strategy/SubjectPagesFragmentStrategy';
import SubstringFragmentStrategy from './fragment-strategy/SubstringFragmentStrategy';
import type { Config } from './utils/Config';
import type IData from './utils/interfaces/IData';
import type IFragmentStrategy from './utils/interfaces/IFragmentStrategy';

export class Data {
  private readonly config: Config;
  private readonly datasourceContext: DatasourceContext;
  private readonly fragmentContext: FragmentContext;

  private RDFData: IData[];

  public constructor(config: Config) {
    this.config = config;
    this.RDFData = [];

    console.log(`Testing current dir: ${this.config.storage}`);

    // Create necessary directories where data will be stored
    if (!existsSync(this.config.storage)) {
      mkdirSync(this.config.storage);
    }

    this.datasourceContext = new DatasourceContext(new LDESClientDatasource());
    this.setDatasource();

    this.fragmentContext = new FragmentContext(new SubjectPagesFragmentStrategy());
    this.setFragmentationStrategy();
  }

  public processData(): Promise<void> {
    return this.config.stream_data ? this.processDataStreamingly() : this.processDataMemory();
  }

  private async processDataMemory(): Promise<void> {
    const bucketizer = await this.fragmentContext.getStrategyBucketizer(this.config);

    await this.fetchData(bucketizer);

    const hypermediaControls = bucketizer.getBucketHypermediaControlsMap();
    await this.writeData(hypermediaControls);
  }

  private async processDataStreamingly(): Promise<void> {
    const ldes = this.datasourceContext.getLinkedDataEventStream(this.config.url);
    const bucketizer = await this.fragmentContext.getStrategyBucketizer(this.config);

    return new Promise(resolve => {
      const tasks: any[] = [];
      ldes.on('data', (member: IData) => {
        bucketizer.bucketize(member.quads, member.id);
        tasks.push(this.fragmentContext.fragment(member, this.config));
      });

      ldes.on('end', async () => {
        await Promise.all(tasks);

        const hypermediaControls = bucketizer.getBucketHypermediaControlsMap();
        resolve(this.fragmentContext.addHypermediaControls(hypermediaControls, this.config));
      });
    });
  }

  /**
   * Set the datasource strategy
   */
  private setDatasource(): void {
    this.datasourceContext.setDatasource(new LDESClientDatasource());
  }

  /**
   * Set the fragmentation strategy
   */
  private setFragmentationStrategy(): void {
    let strategy: IFragmentStrategy;
    switch (this.config.fragmentation_strategy) {
      case 'subject-pages': {
        strategy = new SubjectPagesFragmentStrategy();
        break;
      }
      case 'substring': {
        strategy = new SubstringFragmentStrategy();
        break;
      }
      case 'basic':
      default: {
        strategy = new BasicFragmentStrategy();
        break;
      }
    }

    this.fragmentContext.setStrategy(strategy);
  }

  /**
   * Fetch data using Datasource
   */
  public async fetchData(bucketizer: IBucketizer): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        this.RDFData = await this.datasourceContext.getData(this.config, bucketizer);
        return resolve();
      } catch (error: unknown) {
        console.error(error);
        return reject(error);
      }
    });
  }

  /**
   * Write fetched data to the output directory supplied in the config file
   */
  public writeData(hypermediaControls: Map<string, string[]>): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const tasks: any[] = [];
        this.RDFData.forEach(member => tasks.push(this.fragmentContext.fragment(member, this.config)));

        await Promise.all(tasks);
        await this.fragmentContext.addHypermediaControls(hypermediaControls, this.config);

        return resolve();
      } catch (error: unknown) {
        console.error(error);
        return reject(error);
      }
    });
  }
}
