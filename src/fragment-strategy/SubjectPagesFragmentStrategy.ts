import { appendFileSync } from 'fs';
import { SubjectPageBucketizer } from '@treecg/ldes-subject-page-bucketizer';
import type { IBucketizer } from '@treecg/ldes-types';
import * as N3 from 'n3';
import type * as RDF from 'rdf-js';
import type { IConfig } from '../utils/Config';
import type IData from '../utils/interfaces/IData';
import type IFragmentStrategy from '../utils/interfaces/IFragmentStrategy';

/**
 * Concrete Strategies implement the algorithm while following the base Strategy
 * interface. The interface makes them interchangeable in the Context.
 */
class SubjectPagesFragmentStrategy implements IFragmentStrategy {
  public initBucketizer(config: IConfig): Promise<IBucketizer> {
    return new Promise(resolve => resolve(SubjectPageBucketizer.build(config.property_path)));
  }

  public async fragment(_data: IData, config: IConfig, bucketizer: IBucketizer): Promise<void> {
    const tasks: any[] = [];
    bucketizer.bucketize(_data.quads, _data.id);
    const bucketTriples = this.findBucketTriples(_data.quads);

    bucketTriples.forEach(triple => {
      const bucket = triple.object.value;
      const bucketPath = `${config.storage}/${bucket}.ttl`;
      _data.quads = _data.quads.filter(quad => !bucketTriples.includes(quad));
      tasks.push(this.writeToBucket(bucketPath, _data.quads));
    });
    await Promise.all(tasks);
  }

  public async addHypermediaControls(hypermediaControls: Map<string, string[]>, config: IConfig): Promise<void> {
    console.log(`[SubjectPagesFragmentStrategy]: Hypermedia controls are not necessary for this strategy`);
    return new Promise(resolve => resolve());
  }

  private findBucketTriples(quads: RDF.Quad[]): RDF.Quad[] {
    return quads.filter(quad => quad.predicate.value === 'https://w3id.org/ldes#bucket');
  }

  private async writeToBucket(bucketPath: string, quads: RDF.Quad[]): Promise<void> {
    const writer = new N3.Writer();
    writer.addQuads(quads);
    await new Promise<void>((resolve, reject) => {
      writer.end((error, result) => {
        if (error) {
          reject(new Error(error.stack));
        }

        appendFileSync(bucketPath, result);
        resolve();
      });
    });
  }

  private find(data: any, predicate: string): any {
    const found = data.find((element: RDF.Quad) => element.predicate.value === predicate);
    return found === undefined ? null : found.object.value;
  }
}

export default SubjectPagesFragmentStrategy;
