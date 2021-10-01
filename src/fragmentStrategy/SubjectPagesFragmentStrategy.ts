import IFragmentStrategy from './IFragmentStrategy';
import type * as RDF from 'rdf-js';
import fs from 'fs';
import date from "../utils/date";
import { IConfig } from '../config';
import IData from '../IData';
import N3 from 'n3';
const ldes = require('@ldes/subject-page-bucketizer');

/**
 * Concrete Strategies implement the algorithm while following the base Strategy
 * interface. The interface makes them interchangeable in the Context.
 */
class SubjectPagesFragmentStrategy implements IFragmentStrategy {

    fragment(data: IData[], config: IConfig): void {
        data.forEach((_data: IData) => {
            const bucketizer = new ldes.SubstringBucketizer(config.property_path);
            bucketizer.bucketize(_data.quads, _data.id);
            const bucketTriples = this.findBucketTriples(_data.quads);

            bucketTriples.forEach(bucket => {
                const writer = new N3.Writer();
                const bucketPath = `${config.storage}/${bucket}.ttl`;
                _data.quads = _data.quads.filter(quad => !bucketTriples.includes(quad));
                writer.addQuads(_data.quads);
                writer.end((error, result) => {
                    if (error) {
                        throw new Error(error.stack);
                    }

                    fs.appendFileSync(bucketPath, result);
                });
            });

        });

        this.addSymbolicLinks(config);
    }

    findBucketTriples(quads: RDF.Quad[]): RDF.Quad[] {
        return quads.filter(quad => quad.predicate.value === 'https://w3id.org/ldes#bucket');
    }

    find(data: any, predicate: string): any {
        const found = data.find((element: RDF.Quad) => element.predicate.value === predicate);
        return (found === undefined) ? null : found.object.value;
    }

    addSymbolicLinks(config: IConfig): void {
        // get all directories in the storage directory
        const directories = fs.readdirSync(config.storage).filter(
            (file: string) => fs.statSync(`${config.storage}/${file}`).isDirectory()
        );

        // get all filenames in the current directory
        directories.forEach(directory => {
            const files: string[] = fs.readdirSync(`${config.storage}/${directory}`);

            // sort files array lexicographically to get the latest version
            let latest = files.sort()[files.length - 1];

            // create latest.ttl file
            // fs.writeFileSync(`${config.storage}/${directory}/latest.ttl`, '');
            // check if symbolic link already exists
            if (fs.existsSync(`${config.storage}/${directory}/latest.ttl`)) {
                // delete symbolic link
                fs.unlinkSync(`${config.storage}/${directory}/latest.ttl`);
                console.log(`unlinked ${config.storage}/${directory}/latest.ttl`);
            }

            // create symbolic link latets.ttl -> latest file
            //fs.symlinkSync(`/${config.storage}/${directory}/${latest}`, `${config.storage}/${directory}/latest.ttl`);
            fs.symlinkSync(`${latest}`, `${config.storage}/${directory}/latest.ttl`);
        });
    }

}

export default SubjectPagesFragmentStrategy;