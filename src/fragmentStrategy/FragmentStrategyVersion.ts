import IFragmentStrategy from './IFragmentStrategy';
import type * as RDF from 'rdf-js';
import fs from 'fs';
import date from "../utils/date";
const N3 = require('n3');

/**
 * Concrete Strategies implement the algorithm while following the base Strategy
 * interface. The interface makes them interchangeable in the Context.
 */
class FragmentStrategyVersion implements IFragmentStrategy {

    fragment(data: RDF.Quad[][], config: { storage: any }): void {
        data.forEach(quadArr => {
            let identifier = this.find(quadArr, 'http://purl.org/dc/terms/isVersionOf');
            let reference = identifier.substring(identifier.lastIndexOf('/') + 1);

            let generatedAtTime = this.find(quadArr, 'http://www.w3.org/ns/prov#generatedAtTime');
            let basicISODate = date.dateToBasicISODate(new Date(generatedAtTime));

            // check if directory does not exist
            if (!fs.existsSync(`${config.storage}/${reference}`)) {
                console.log('Directory not existing!');
                // make directory where we will store newly fetched data
                fs.mkdirSync(`${config.storage}/${reference}`);
            }

            // check if file not exists
            if (!fs.existsSync(`${config.storage}/${reference}/${basicISODate}.nt`)) {
                // make file where we will store newly fetched data
                let res = this.quadArratToNTriples(quadArr);
                fs.writeFileSync(`${config.storage}/${reference}/${basicISODate}.nt`, res);
            }

        });
    }

    find(data: RDF.Quad[], predicate: string): any {
        const found = data.find(element => element.predicate.value === predicate);
        return (found === undefined) ? null : found.object.value;
    }

    /*
    private toNtriples(data: RDF.Quad[]): string {
        const writer = new N3.Writer({ format: 'N-Triples' });

        data.forEach(quad => writer.addQuad(quad));
        let res: string = '';
        console.log(writer.end())
        writer.end((result: string) => {res = result; console.log(result)});
        return  res;
        

    }
    */

    private quadArratToNTriples(data: RDF.Quad[]): any {
        let res: string = '';
        data.forEach(quad => {
            res += `${quad.subject.value} <${quad.predicate.value}> ${quad.object.value} . \n`
        });
        return res;
    }

}

export default FragmentStrategyVersion;