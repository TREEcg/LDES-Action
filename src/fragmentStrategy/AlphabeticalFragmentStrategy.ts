import IFragmentStrategy from './IFragmentStrategy';
import type * as RDF from 'rdf-js';
import fs from 'fs';
import date from "../utils/date";
import { IConfig } from '../config';
const N3 = require('n3');

/**
 * Concrete Strategies implement the algorithm while following the base Strategy
 * interface. The interface makes them interchangeable in the Context.
 */
class AlphabeticalFragmentStrategy implements IFragmentStrategy {

    fragment(data: RDF.Quad[][], config: IConfig): void {

        let sortedData: RDF.Quad[][] = this.sort(data, 'http://purl.org/dc/terms/isVersionOf');

        let pages: RDF.Quad[][] = [];
        let fragmentation_page_size = config.fragmentation_page_size || 100;

        for (let i = 0; i < sortedData.length; i++) {
            if (i % fragmentation_page_size === 0) {
                pages.push([]);
            }
            let index = Math.floor(i / fragmentation_page_size)
            pages[index] = pages[index].concat(sortedData[i]);
        }

        pages.forEach((page, index) => { 
            // make file where we will store newly fetched data     
            //const writer = new N3.Writer({ format: 'N-Triples' });
            const writer = new N3.Writer({ format: 'Turtle' });
            let serialised = writer.quadsToString(page);

            const fileName = String(index).padStart(5, '0');
            fs.writeFileSync(`${config.storage}/${fileName}.ttl`, serialised);
        });
        /*
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
                const writer = new N3.Writer({ format: 'N-Triples' });
                let serialised = writer.quadsToString(quadArr);

                fs.writeFileSync(`${config.storage}/${reference}/${basicISODate}.nt`, serialised);
            }

        });
        */
    }

    sort(data: RDF.Quad[][], predicate: string): RDF.Quad[][] {
        return data.sort((a, b) => {
            let identifierA = this.find(a, predicate);
            let identifierB = this.find(b, predicate);
            return identifierA.localeCompare(identifierB);
        });
    }

    find(data: RDF.Quad[], predicate: string): any {
        const found = data.find(element => element.predicate.value === predicate);
        return (found === undefined) ? null : found.object.value;
    }

}

export default AlphabeticalFragmentStrategy;