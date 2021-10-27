import { existsSync, mkdirSync, writeFileSync } from 'fs';

import type * as RDF from '@rdfjs/types';
import type { Member, Bucketizer, RelationParameters } from '@treecg/types';
import DatasourceContext from './data-source-strategy/DatasourceContext';
import LDESClientDatasource from './data-source-strategy/LDESClientDatasource';
import BucketizerFragmentStrategy from './fragment-strategy/BucketizerFragmentStrategy';
import FragmentContext from './fragment-strategy/FragmentContext';
import type { Config } from './utils/Config';
import { FileExtension } from './utils/FileExtension';

export class Data {
  private readonly config: Config;
  private readonly datasourceContext: DatasourceContext;
  private readonly fragmentContext: FragmentContext;

  private RDFData: Member[];

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

    this.fragmentContext = new FragmentContext(
      new BucketizerFragmentStrategy(),
    );
  }

  public processData(): Promise<void> {
    return this.config.stream_data ?
      this.processDataStreamingly() :
      this.processDataMemory();
  }

  private async processDataMemory(): Promise<void> {
    const bucketizer = await this.fragmentContext.getStrategy().initBucketizer(this.config);
    await this.fetchData(bucketizer);

    const hypermediaControls = bucketizer.getBucketHypermediaControlsMap();
    await this.writeData(hypermediaControls);
  }

  private async processDataStreamingly(): Promise<void> {
    const ldes = this.datasourceContext.getLinkedDataEventStream(
      this.config.url,
    );
    const bucketizer = await this.fragmentContext.getStrategy().initBucketizer(this.config);

    return new Promise(resolve => {
      const tasks: any[] = [];

      ldes.on('data', (member: Member) => {
        const extension = this.getOutputExtension(member.quads);
        this.fragmentContext.setFileExtension(extension);

        bucketizer.bucketize(member.quads, member.id.value);
        tasks.push(this.fragmentContext.fragment(member, this.config));
      });

      ldes.on('end', async () => {
        const exportedState = ldes.exportState();
        if (!existsSync('./.ldes/')) {
          mkdirSync('./.ldes/');
        }
        writeFileSync('./.ldes/state.json', JSON.stringify(exportedState));

        await Promise.all(tasks);

        const hypermediaControls = bucketizer.getBucketHypermediaControlsMap();
        resolve(
          this.fragmentContext.addHypermediaControls(
            hypermediaControls,
            this.config,
          ),
        );
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
   * Fetch data using Datasource
   */
  public async fetchData(bucketizer: Bucketizer): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        this.RDFData = await this.datasourceContext.getData(
          this.config,
          bucketizer,
        );
        return resolve();
      } catch (error: unknown) {
        console.error(error);
        return reject(error);
      }
    });
  }

  /**
   * Write fetched data and hypermediacontrols to the output directory supplied in the config file
   */
  public writeData(hypermediaControls: Map<string, RelationParameters[]>): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const tasks: any[] = [];
        this.RDFData.forEach(member => {
          const extension = this.getOutputExtension(member.quads);
          this.fragmentContext.setFileExtension(extension);

          tasks.push(this.fragmentContext.fragment(member, this.config));
        });

        await Promise.all(tasks);
        await this.fragmentContext.addHypermediaControls(
          hypermediaControls,
          this.config,
        );

        return resolve();
      } catch (error: unknown) {
        console.error(error);
        return reject(error);
      }
    });
  }

  private getOutputExtension(quads: RDF.Quad[]): FileExtension {
    const graphlessQuads = quads.filter(quad => quad.graph.termType === 'DefaultGraph');
    return graphlessQuads.length > 0 ? FileExtension.Turtle : FileExtension.TriG;
  }
}
