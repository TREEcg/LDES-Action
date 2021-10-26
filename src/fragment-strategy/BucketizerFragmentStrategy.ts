import { appendFileSync } from 'fs';
import type * as RDF from '@rdfjs/types';
import { SubstringBucketizer, SubjectPageBucketizer, BasicBucketizer } from '@treecg/bucketizers';
import type { Bucketizer, BucketizerOptions, Member, RelationParameters } from '@treecg/types';
import * as N3 from 'n3';
import { DataFactory } from 'rdf-data-factory';
import type { Config } from '../utils/Config';
import type FragmentStrategy from '../utils/interfaces/FragmentStrategy';
import { sanitize } from '../utils/Sanitizer';

class BucketizerFragmentStrategy implements FragmentStrategy {
  private readonly bucketNode: RDF.NamedNode;
  private readonly factory: RDF.DataFactory;

  public constructor() {
    this.factory = new DataFactory();
    this.bucketNode = this.factory.namedNode('https://w3id.org/ldes#bucket');
  }

  public async initBucketizer(config: Config): Promise<Bucketizer> {
    const bucketizerOptions: BucketizerOptions = {
      propertyPath: config.property_path,
      pageSize: config.fragmentation_page_size,
    };

    switch (config.fragmentation_strategy) {
      case 'substring':
        console.log(`[BucketizerFragmentStrategy]: setting strategy to substrings.`);
        return SubstringBucketizer.build(bucketizerOptions);

      case 'subject-page':
        console.log(`[BucketizerFragmentStrategy]: setting strategy to subject pages.`);
        return SubjectPageBucketizer.build(bucketizerOptions);

      case 'basic':
      default:

        console.log(`[BucketizerFragmentStrategy]: setting strategy to basic.`);
        return BasicBucketizer.build(bucketizerOptions);
    }
  }

  public async fragment(member: Member, config: Config, fileExtension: string): Promise<void> {
    const tasks: Promise<void>[] = [];
    const bucketQuads = this.findBucketQuads(member.quads);

    member.quads = member.quads.filter(quad => !quad.predicate.equals(this.bucketNode));
    member.quads.push(this.getTreeMemberQuad(config.url, member.id.value));

    bucketQuads.forEach(quad => {
      const bucket = quad.object.value;
      const bucketPath = `${config.storage}/${sanitize(bucket)}.${fileExtension}`;
      tasks.push(this.writeToBucket(bucketPath, member.quads));
    });

    await Promise.all(tasks);
  }

  public async addHypermediaControls(
    hypermediaControls: Map<string, RelationParameters[]>,
    config: Config,
    fileExtension: string,
  ): Promise<void> {
    const githubPagesUrl = config.gh_pages_url.includes('https') ?
      config.gh_pages_url :
      `https://${config.gh_pages_url}`;
    const outputDirPath = `${githubPagesUrl}/${config.storage}`;
    const tasks: Promise<void>[] = [];

    // Array containing all pages with data, extracted from the map with hypermediacontrols
    let pages: string[] = [];

    hypermediaControls.forEach((relations: RelationParameters[], node: string) => {
      const bucketPath = `${config.storage}/${sanitize(node)}.${fileExtension}`;
      const otherPages = relations.map(relation => relation.nodeId);
      pages = [...new Set([...pages, ...otherPages, node])];

      const controlQuads = this.createHypermediaControlQuads(
        relations,
        node,
        outputDirPath,
        fileExtension,
      );
      tasks.push(this.writeToBucket(bucketPath, controlQuads));
    });

    pages.map(async page =>
      tasks.push(
        this.addCollectionLink(page, outputDirPath, config.url, config.storage, fileExtension),
      ));
    await Promise.all(tasks);
  }

  private writeToBucket(
    bucketPath: string,
    quads: RDF.Quad[],
  ): Promise<void> {
    const writer = new N3.Writer();
    writer.addQuads(quads);

    return new Promise<void>((resolve, reject) => {
      writer.end((error, result) => {
        if (error) {
          reject(new Error(error.stack));
        }

        appendFileSync(bucketPath, result);
        resolve();
      });
    });
  }

  private createHypermediaControlQuads(
    relations: RelationParameters[],
    node: string,
    outputDirPath: string,
    fileExtension: string,
  ): RDF.Quad[] {
    const hypermediaControls: RDF.Quad[] = [];
    const bucketPath = `${outputDirPath}/${sanitize(node)}.${fileExtension}`;

    relations.forEach(relation => {
      const relationPath = `${outputDirPath}/${sanitize(relation.nodeId)}.${fileExtension}`;
      const blankNode = this.factory.blankNode();

      hypermediaControls.push(
        this.factory.quad(
          this.factory.namedNode(bucketPath),
          this.factory.namedNode('https://w3id.org/tree#relation'),
          blankNode,
        ),
        this.factory.quad(
          blankNode,
          this.factory.namedNode(
            'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
          ),
          this.factory.namedNode(relation.type),
        ),
        this.factory.quad(
          blankNode,
          this.factory.namedNode('https://w3id.org/tree#node'),
          this.factory.namedNode(relationPath),
        ),
      );

      if (relation.value && relation.value.length > 0) {
        relation.value.forEach(treeValue => {
          hypermediaControls.push(
            this.factory.quad(
              blankNode,
              this.factory.namedNode('https://w3id.org/tree#value'),
              treeValue.termType === 'NamedNode' ? <RDF.NamedNode>treeValue : <RDF.Literal>treeValue,
            ),
          );
        });
      }
    });

    return hypermediaControls;
  }

  private addCollectionLink(
    bucket: string,
    outputDirPath: string,
    collectionUri: string,
    storage: string,
    fileExtension: string,
  ): Promise<void> {
    const predicate = bucket === 'root' ? 'https://w3id.org/tree#view' : 'http://rdfs.org/ns/void#subset';
    const bucketFilePath = `${storage}/${sanitize(bucket)}.${fileExtension}`;

    const quad = this.factory.quad(
      this.factory.namedNode(collectionUri),
      this.factory.namedNode(predicate),
      this.factory.namedNode(`${outputDirPath}/${sanitize(bucket)}.${fileExtension}`),
    );

    return this.writeToBucket(bucketFilePath, [quad]);
  }

  private getTreeMemberQuad(ldesUri: string, memberId: string): RDF.Quad {
    return this.factory.quad(
      this.factory.namedNode(ldesUri),
      this.factory.namedNode('https://w3id.org/tree#member'),
      this.factory.namedNode(memberId),
    );
  }

  private findBucketQuads(quads: RDF.Quad[]): RDF.Quad[] {
    return quads.filter(quad => quad.predicate.equals(this.bucketNode));
  }
}

export default BucketizerFragmentStrategy;
