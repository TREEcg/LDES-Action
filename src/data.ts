import { existsSync, mkdirSync } from 'fs';

import type * as RDF from '@rdfjs/types';
import type { Member } from '@treecg/types';
import DatasourceContext from './data-source-strategy/DatasourceContext';
import LDESClientDatasource from './data-source-strategy/LDESClientDatasource';
import BucketizerFragmentStrategy from './fragment-strategy/BucketizerFragmentStrategy';
import FragmentContext from './fragment-strategy/FragmentContext';
import type { Config } from './utils/Config';
import { FileExtension } from './utils/FileExtension';
import { saveState } from './utils/State';

export class Data {
  private readonly config: Config;
  private readonly datasourceContext: DatasourceContext;
  private readonly fragmentContext: FragmentContext;

  private readonly RDFData: Member[];

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
    return this.processDataStreamingly();
  }

  private async processDataStreamingly(): Promise<void> {
    const ldes = this.datasourceContext.getLinkedDataEventStream(
      this.config.url,
      this.config.storage,
    );
    const bucketizer = await this.fragmentContext.getStrategy().initBucketizer(this.config);

    return new Promise(resolve => {
      const tasks: any[] = [];

      // If run takes longer than x minutes, pause the LDES Client
      const timeout = setTimeout(() => ldes.pause(), this.config.timeout);

      ldes.on('data', (member: Member) => {
        const extension = this.getOutputExtension(member.quads);
        this.fragmentContext.setFileExtension(extension);

        bucketizer.bucketize(member.quads, member.id.value);
        tasks.push(this.fragmentContext.fragment(member, this.config));
      });

      ldes.on('now only syncing', () => {
        timeout.unref();
        console.log('Now only syncing');
        ldes.pause();
      });

      ldes.on('pause', async () => {
        console.log('Export LDES Client State');
        saveState(ldes.exportState(), bucketizer.exportState(), this.config.storage);

        await Promise.all(tasks);

        const hypermediaControls = bucketizer.getBucketHypermediaControlsMap();
        const propertyPathQuads = bucketizer.getPropertyPathQuads();

        resolve(
          this.fragmentContext.addHypermediaControls(
            hypermediaControls,
            propertyPathQuads,
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

  private getOutputExtension(quads: RDF.Quad[]): FileExtension {
    const graphlessQuads = quads.filter(quad => quad.graph.termType === 'DefaultGraph');
    return graphlessQuads.length > 0 ? FileExtension.Turtle : FileExtension.TriG;
  }
}
