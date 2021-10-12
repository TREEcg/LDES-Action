import { appendFileSync } from 'fs';
import type * as RDF from '@rdfjs/types';
import { SubstringBucketizer } from '@treecg/ldes-substring-bucketizer';
import type { IBucketizer } from '@treecg/ldes-types';
import * as N3 from 'n3';
import { DataFactory } from 'rdf-data-factory';
import type { Config } from '../utils/Config';
import type FragmentStrategy from '../utils/interfaces/FragmentStrategy';
import type Member from '../utils/interfaces/Member';

class SubstringFragmentStrategy implements FragmentStrategy {
	public factory: RDF.DataFactory;

	public constructor() {
		this.factory = new DataFactory();
	}

	public initBucketizer(config: Config): Promise<IBucketizer> {
		return new Promise((resolve) =>
			resolve(
				SubstringBucketizer.build(
					config.property_path,
					config.fragmentation_page_size
				)
			)
		);
	}

	public async fragment(_data: Member, config: Config): Promise<void> {
		const tasks: any[] = [];
		const bucketTriples = this.findBucketTriples(_data.quads);

		_data.quads = _data.quads.filter((quad) => !bucketTriples.includes(quad));
		_data.quads.push(
			this.factory.quad(
				this.factory.namedNode(config.url),
				this.factory.namedNode('https://w3id.org/tree#member'),
				this.factory.namedNode(_data.id)
			)
		);

		bucketTriples.forEach(async (triple) => {
			const bucket = triple.object.value;
			const bucketPath = `${config.storage}/${bucket}.ttl`;
			await this.writeToBucket(bucketPath, _data.quads);
		});
		await Promise.all(tasks);
	}

	public async addHypermediaControls(
		hypermediaControls: Map<string, string[]>,
		config: Config
	): Promise<void> {
		const tasks: any[] = [];
		let pages: string[] = [];
		const githubPagesUrl = config.gh_pages_url.includes('https')
			? config.gh_pages_url
			: `https://${config.gh_pages_url}`;
		const outputDirPath = `${githubPagesUrl}/${config.storage}`;

		hypermediaControls.forEach((relations: string[], node: string) => {
			const bucketPath = `${config.storage}/${node}.ttl`;

			pages = [...new Set([...pages, ...relations, node])];

			const triples = this.createHypermediaControlTriples(
				relations,
				outputDirPath,
				node
			);
			tasks.push(this.writeToBucket(bucketPath, triples));
		});

		pages.map(async (page) =>
			tasks.push(
				this.addCollectionLink(page, outputDirPath, config.url, config.storage)
			)
		);
		await Promise.all(tasks);
	}

	private createHypermediaControlTriples(
		controls: string[],
		outputDirPath: string,
		bucket: string
	): RDF.Quad[] {
		const result: RDF.Quad[] = [];
		const bucketPath = `${outputDirPath}/${bucket}.ttl`;

		controls.forEach((control) => {
			const nodePath = `${outputDirPath}/${control}.ttl`;
			const blankNode = this.factory.blankNode();
			result.push(
				this.factory.quad(
					this.factory.namedNode(bucketPath),
					this.factory.namedNode('https://w3id.org/tree#relation'),
					blankNode
				),
				this.factory.quad(
					blankNode,
					this.factory.namedNode(
						'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
					),
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

			const treeValueTriples: RDF.Quad[] = values.map((treeValue) =>
				this.factory.quad(
					blankNode,
					this.factory.namedNode('https://w3id.org/tree#value'),
					this.factory.literal(
						treeValue,
						this.factory.namedNode('http://www.w3.org/2001/XMLSchema#string')
					)
				)
			);

			result.push(...treeValueTriples);
		});

		return result;
	}

	private addCollectionLink(
		bucket: string,
		outputDirPath: string,
		collectionUri: string,
		storage: string
	): Promise<void> {
		const predicate =
			bucket === 'root'
				? 'https://w3id.org/tree#view'
				: 'http://rdfs.org/ns/void#subset';
		const bucketFilePath = `${storage}/${bucket}.ttl`;

		const quad = this.factory.quad(
			this.factory.namedNode(collectionUri),
			this.factory.namedNode(predicate),
			this.factory.namedNode(bucketFilePath)
		);

		return this.writeToBucket(bucketFilePath, [quad]);
	}

	private findBucketTriples(quads: RDF.Quad[]): RDF.Quad[] {
		return quads.filter(
			(quad) => quad.predicate.value === 'https://w3id.org/ldes#bucket'
		);
	}

	private async writeToBucket(
		bucketPath: string,
		quads: RDF.Quad[]
	): Promise<void> {
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
