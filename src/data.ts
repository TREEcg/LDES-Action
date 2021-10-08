import { existsSync, mkdirSync } from 'fs';

import type { IConfig } from './config';
import DatasourceContext from './datasourceStrategy/DatasourceContext';
import type IDatasource from './datasourceStrategy/IDatasource';
import LDESClientDatasource from './datasourceStrategy/LDESClientDatasource';
import OldLDESClientDatasource from './datasourceStrategy/OldLDESClientDatasource';
import FragmentContext from './fragmentStrategy/FragmentContext';
import type IFragmentStrategy from './fragmentStrategy/IFragmentStrategy';
import SubjectPagesFragmentStrategy from './fragmentStrategy/SubjectPagesFragmentStrategy';
import type IData from './IData';

export class Data {
  private readonly config: IConfig;
  private readonly datasourceContext: DatasourceContext;
  private readonly fragmentContext: FragmentContext;

  private RDFData: IData[];

  public constructor(config: IConfig) {
    this.config = config;
    this.RDFData = [];

    // Create necessary directories where data will be stored
    if (!existsSync(this.config.storage)) {
      mkdirSync(this.config.storage);
    }

    this.datasourceContext = new DatasourceContext(new LDESClientDatasource());
    this.setDatasource();

    this.fragmentContext = new FragmentContext(new SubjectPagesFragmentStrategy());
    this.setFragmentationStrategy();
  }

  /**
   * Set the datasource strategy
   */
  private setDatasource(): void {
    let datasource: IDatasource;
    switch (this.config.datasource_strategy) {
      case 'ldes-client': {
        datasource = new LDESClientDatasource();
        break;
      }
      case 'old-ldes-client': {
        datasource = new OldLDESClientDatasource();
        break;
      }
      default: {
        datasource = new LDESClientDatasource();
        break;
      }
    }
    this.datasourceContext.setDatasource(datasource);
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
      default: {
        strategy = new SubjectPagesFragmentStrategy();
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
      } catch (error) {
        console.error(error);
        return reject(error);
      }
    });
  }

  /**
   * Write fetched data to the output directory supplied in the config file
   */
  public async writeData(): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        // Fragment data & write to files
        this.fragmentContext.fragment(this.RDFData, this.config);

        return resolve();
      } catch (error) {
        console.error(error);
        return reject(error);
      }
    });
  }
}
