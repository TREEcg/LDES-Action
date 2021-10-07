import IFragmentStrategy from '../utils/interfaces/IFragmentStrategy';
import type * as RDF from 'rdf-js';
import { IConfig } from '../utils/Config';
import IData from '../utils/interfaces/IData';
import * as N3 from 'n3';
import { SubjectPageBucketizer } from '@treecg/ldes-subject-page-bucketizer';
import { appendFileSync } from 'fs';
import { IBucketizer } from '@treecg/ldes-types';

/**
 * Concrete Strategies implement the algorithm while following the base Strategy
 * interface. The interface makes them interchangeable in the Context.
 */
class SubjectPagesFragmentStrategy implements IFragmentStrategy {

    public initBucketizer(config: IConfig): Promise<IBucketizer> {
        return new Promise(resolve => resolve(SubjectPageBucketizer.build(config.property_path)));
    }

    async fragment(_data: IData, config: IConfig, bucketizer: IBucketizer): Promise<void> {
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

    async addHypermediaControls(hypermediaControls: Map<string, string[]>, config: IConfig): Promise<void> {
        console.log(`[SubjectPagesFragmentStrategy]: Hypermedia controls are not necessary for this strategy`);
        return new Promise(resolve => resolve());
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

    find(data: any, predicate: string): any {
        const found = data.find((element: RDF.Quad) => element.predicate.value === predicate);
        return (found === undefined) ? null : found.object.value;
    }
}

export default SubjectPagesFragmentStrategy;