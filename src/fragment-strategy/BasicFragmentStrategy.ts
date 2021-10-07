import { appendFileSync } from 'fs';
import type * as RDF from '@rdfjs/types';
import { BasicBucketizer } from '@treecg/ldes-basic-bucketizer';
import type { IBucketizer } from '@treecg/ldes-types';
import * as N3 from 'n3';
import { DataFactory } from 'rdf-data-factory';
import type { IConfig } from '../utils/Config';
import type IData from '../utils/interfaces/IData';
import type IFragmentStrategy from '../utils/interfaces/IFragmentStrategy';

class BasicFragmentStrategy implements IFragmentStrategy {
  public factory: RDF.DataFactory;

  public constructor() {
    this.factory = new DataFactory();
  }

  public initBucketizer(config: IConfig): Promise<IBucketizer> {
    return new Promise(resolve =>
      resolve(BasicBucketizer.build(config.fragmentation_page_size)));
  }

  public async fragment(data: IData, config: IConfig, bucketizer: IBucketizer): Promise<void> {
    bucketizer.bucketize(data.quads, data.id);
    const bucketTriples = this.findBucketTriples(data.quads);

    data.quads = data.quads.filter(quad => !bucketTriples.includes(quad));

    data.quads.push(this.factory.quad(
      this.factory.namedNode(config.url),
      this.factory.namedNode('https://w3id.org/tree#member'),
      this.factory.namedNode(data.id),
    ));

    bucketTriples.forEach(async triple => {
      const bucket = triple.object.value;
      const bucketPath = `${config.storage}/${bucket}.ttl`;
      await this.writeToBucket(bucketPath, data.quads);
    });
  }

  public async addHypermediaControls(hypermediaControls: Map<string, string[]>, config: IConfig): Promise<void> {
    const tasks: any[] = [];
    const githubPagesUrl = config.gh_pages_url.includes('https') ? config.gh_pages_url : `https://${config.gh_pages_url}`;
    const outputDirPath = `${githubPagesUrl}/${config.storage}`;

    hypermediaControls.forEach((relations: string[], node: string) => {
      // In this fragment strategy, each node has only one relation
      const nextPage = relations[0];
      const bucketPath = `${config.storage}/${node}.ttl`;

      const hypermediaControlTriples = this.createHypermediaControlTriples(nextPage, outputDirPath, node, config.url);
      tasks.push(this.writeToBucket(bucketPath, hypermediaControlTriples));
    });

    await Promise.all(tasks);
  }

  private createHypermediaControlTriples(
    nextPage: string,
    outputDirPath: string,
    bucket: string,
    collectionUri: string,
  ): RDF.Quad[] {
    const result: RDF.Quad[] = [];

    const bucketPath = `${outputDirPath}/${bucket}.ttl`;
    const nextPagePath = `${outputDirPath}/${nextPage}.ttl`;
    const blankNode = this.factory.blankNode();

    result.push(
      this.factory.quad(
        this.factory.namedNode(bucketPath),
        this.factory.namedNode('https://w3id.org/tree#relation'),
        blankNode,
      ),
      this.factory.quad(
        blankNode,
        this.factory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
        this.factory.namedNode('https://w3id.org/tree#Relation'),
      ),
      this.factory.quad(
        blankNode,
        this.factory.namedNode('https://w3id.org/tree#node'),
        this.factory.namedNode(nextPagePath),
      ),
      this.factory.quad(
        this.factory.namedNode(collectionUri),
        this.factory.namedNode('http://rdfs.org/ns/void#subset'),
        this.factory.namedNode(bucketPath),
      ),
    );

    return result;
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
}

export default BasicFragmentStrategy;
