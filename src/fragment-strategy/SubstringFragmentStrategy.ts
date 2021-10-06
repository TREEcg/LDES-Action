import { IConfig } from "../utils/Config";
import IData from "../utils/IData";
import IFragmentStrategy from "./IFragmentStrategy";
import { SubstringBucketizer } from '@treecg/ldes-substring-bucketizer';
import type * as RDF from '@rdfjs/types';
import * as N3 from 'n3';
import { appendFileSync } from 'fs';
import { DataFactory } from "rdf-data-factory";

class SubstringFragmentStrategy implements IFragmentStrategy {
  public factory: RDF.DataFactory;

  public constructor() {
    this.factory = new DataFactory();
  }

  async fragment(data: IData[], config: IConfig): Promise<void> {
    const bucketizer = await SubstringBucketizer.build(config.property_path, config.fragmentation_page_size);
    const tasks: any[] = [];

    data.forEach((_data: IData) => {
      bucketizer.bucketize(_data.quads, _data.id);
      const bucketTriples = this.findBucketTriples(_data.quads);

      _data.quads = _data.quads.filter(quad => !bucketTriples.includes(quad));
      _data.quads.push(this.factory.quad(
        this.factory.namedNode(config.url),
        this.factory.namedNode('https://w3id.org/tree#member'),
        this.factory.namedNode(_data.id)
      ))

      bucketTriples.forEach(triple => {
        const bucket = triple.object.value;
        const bucketPath = `${config.storage}/${bucket}.ttl`;
        tasks.push(this.writeToBucket(bucketPath, _data.quads));
      });

    });
    await Promise.all(tasks);

    const hypermediaControls = bucketizer.getBucketHypermediaControlsMap();

    let pages: string[] = [];
    const githubPagesUrl = config.gh_pages_url.includes('https') ? config.gh_pages_url : `https://${config.gh_pages_url}`;
    const outputDirPath = `${githubPagesUrl}/${config.storage}`;

    hypermediaControls.forEach((relations: string[], node: string) => {
      const bucketPath = `${config.storage}/${node}.ttl`;

      pages = [...new Set([...pages, ...relations, node])];

      const triples = this.createHypermediaControlTriples(relations, outputDirPath, node);
      tasks.push(this.writeToBucket(bucketPath, triples));
    });

    pages.map(page => tasks.push(this.addCollectionLink(page, outputDirPath, config.url, config.storage)))

    await Promise.all(tasks);
  }

  createHypermediaControlTriples(controls: string[], outputDirPath: string, bucket: string): RDF.Quad[] {
    const result: RDF.Quad[] = [];
    const bucketPath = `${outputDirPath}/${bucket}.ttl`;

    controls.forEach(control => {
      const nodePath = `${outputDirPath}/${control}.ttl`
      const blankNode = this.factory.blankNode();
      result.push(
        this.factory.quad(
          this.factory.namedNode(bucketPath),
          this.factory.namedNode('https://w3id.org/tree#relation'),
          blankNode
        ),
        this.factory.quad(
          blankNode,
          this.factory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
          this.factory.namedNode('https://w3id.org/tree#SubstringRelation')
        ),
        this.factory.quad(
          blankNode,
          this.factory.namedNode('https://w3id.org/tree#node'),
          this.factory.namedNode(nodePath)
        )
      );

      const values = [];
      if (control.includes('+')) {
        values.push(...control.split('+'));
      } else {
        values.push(control);
      }

      const treeValueTriples: RDF.Quad[] = values.map(treeValue => {
        return this.factory.quad(
          blankNode,
          this.factory.namedNode('https://w3id.org/tree#value'),
          this.factory.literal(treeValue, this.factory.namedNode('http://www.w3.org/2001/XMLSchema#string'))
        )
      });

      result.push(...treeValueTriples);
    });

    return result;
  }

  addCollectionLink(bucket: string, outputDirPath: string, collectionUri: string, storage: string): Promise<void> {
    const predicate = bucket === 'root' ? 'https://w3id.org/tree#view' : 'http://rdfs.org/ns/void#subset';
    const bucketFilePath = `${storage}/${bucket}.ttl`;

    const quad = this.factory.quad(
      this.factory.namedNode(collectionUri),
      this.factory.namedNode(predicate),
      this.factory.namedNode(bucketFilePath)
    )

    return this.writeToBucket(bucketFilePath, [quad]);
  }

  findBucketTriples(quads: RDF.Quad[]): RDF.Quad[] {
    return quads.filter(quad => quad.predicate.value === 'https://w3id.org/ldes#bucket');
  }

  async writeToBucket(bucketPath: string, quads: RDF.Quad[]): Promise<void> {
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

export default SubstringFragmentStrategy;