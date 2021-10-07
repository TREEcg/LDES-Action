import { existsSync, mkdirSync } from 'fs';

import DatasourceContext from './data-source-strategy/DatasourceContext';
import LDESClientDatasource from './data-source-strategy/LdesClientDatasource';
import BasicFragmentStrategy from './fragment-strategy/BasicFragmentStrategy';
import FragmentContext from './fragment-strategy/FragmentContext';
import SubjectPagesFragmentStrategy from './fragment-strategy/SubjectPagesFragmentStrategy';
import SubstringFragmentStrategy from './fragment-strategy/SubstringFragmentStrategy';
import type { IConfig } from './utils/Config';
import type IData from './utils/interfaces/IData';
import type IFragmentStrategy from './utils/interfaces/IFragmentStrategy';

export class Data {
  private readonly config: IConfig;
  private readonly datasourceContext: DatasourceContext;
  private readonly fragmentContext: FragmentContext;

  private RDFData: IData[];

  public constructor(config: IConfig) {
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

  public async processDataMemory(): Promise<void> {
    await this.fetchData();
    await this.writeData();
  }

  public async processDataStreamingly(): Promise<void> {
    const ldes = this.datasourceContext.getLinkedDataEventStream(this.config.url);
    const bucketizer = await this.fragmentContext.initBucketizer(this.config);

    return new Promise(resolve => {
      const tasks: any[] = [];
      ldes.on('data', (member: IData) => {
        tasks.push(this.fragmentContext.fragment(member, this.config, bucketizer));
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
  public async fetchData(): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        this.RDFData = await this.datasourceContext.getData(this.config);
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
  public writeData(): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const bucketizer = await this.fragmentContext.initBucketizer(this.config);

        const tasks: any[] = [];
        this.RDFData.forEach(member => tasks.push(this.fragmentContext.fragment(member, this.config, bucketizer)));
        await Promise.all(tasks);

        const hypermediaControls = bucketizer.getBucketHypermediaControlsMap();
        await this.fragmentContext.addHypermediaControls(hypermediaControls, this.config);

        return resolve();
      } catch (error: unknown) {
        console.error(error);
        return reject(error);
      }
    });
  }
}
