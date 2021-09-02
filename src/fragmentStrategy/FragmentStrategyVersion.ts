import IFragmentStrategy from './IFragmentStrategy';
import type * as RDF from 'rdf-js';
import fs from 'fs';
import date from "../utils/date";

/**
 * Concrete Strategies implement the algorithm while following the base Strategy
 * interface. The interface makes them interchangeable in the Context.
 */
class FragmentStrategyVersion implements IFragmentStrategy {

    fragment(data: RDF.Quad[][], config: {storage: any}): void {
        data.forEach(quadArr => {
            let identifier = this.find(quadArr, 'http://purl.org/dc/terms/isVersionOf');
            let reference = identifier.substring(identifier.lastIndexOf('/') + 1);

            let generatedAtTime = this.find(quadArr, 'http://www.w3.org/ns/prov#generatedAtTime');
            let basicISODate = date.dateToBasicISODate(new Date(generatedAtTime));

            // check if directory exists
            if (!fs.existsSync(reference)) {
                console.log('Directory exists!');
                // make directory where we will store newly fetched data
                fs.mkdirSync(`${config.storage}/${reference}`);
            }

            // check if file exists
            if (!fs.existsSync(`${config.storage}/${reference}/${basicISODate}.nt`)) {
                // make file where we will store newly fetched data
                fs.writeFileSync(`${config.storage}/${reference}/${basicISODate}.nt`, JSON.stringify(quadArr));
            }

        });
    }

    find(data: RDF.Quad[], predicate: string): any {
        const found = data.find(element => element.predicate.value === predicate);
        return found?.object.value;
    }

}