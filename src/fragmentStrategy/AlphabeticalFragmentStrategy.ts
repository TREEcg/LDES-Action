import IFragmentStrategy from './IFragmentStrategy';
import type * as RDF from 'rdf-js';
import { literal, namedNode, blankNode, quad } from '@rdfjs/data-model';
import fs from 'fs';
import { IConfig } from '../config';
import IData from '../IData';
const N3 = require('n3');

/**
 * Concrete Strategies implement the algorithm while following the base Strategy
 * interface. The interface makes them interchangeable in the Context.
 */
class AlphabeticalFragmentStrategy implements IFragmentStrategy {

    fragment(data: IData[], config: IConfig): void {

        let sortedData: IData[] = this.sort(data, 'http://purl.org/dc/terms/isVersionOf');

        let pages: RDF.Quad[][] = [];
        let fragmentation_page_size = config.fragmentation_page_size || 100;

        for (let i = 0; i < sortedData.length; i++) {
            if (i % fragmentation_page_size === 0) {
                pages.push([]);
            }
            let index = Math.floor(i / fragmentation_page_size)
            pages[index] = pages[index].concat(sortedData[i].quads);
        }

        pages.forEach((page, index) => {
            let fileLocation = this.getFileLocation(index, config);
            // next page
            let nextPage = (index + 1 < pages.length) ? this.getFileLocation(index + 1, config) : null;
            // previous page
            let previousPage = (index > 0) ? this.getFileLocation(index - 1, config) : null;

            // add hypermedia
            page = page.concat(this.createHypermedia(page, config, fileLocation, nextPage, previousPage));

            // make file where we will store newly fetched data     
            const writer = new N3.Writer({ format: 'Turtle' });
            let serialised = writer.quadsToString(page);

            fs.writeFileSync(fileLocation, serialised);
        });
    }
  
    sort(data: IData[], predicate: string): IData[] {
        return data.sort((a, b) => {
            let identifierA = this.find(a.quads, predicate);
            let identifierB = this.find(b.quads, predicate);
            return identifierA.localeCompare(identifierB);
        });
    }

    find(data: RDF.Quad[], predicate: string): any {
        const found = data.find(element => element.predicate.value === predicate);
        return (found === undefined) ? null : found.object.value;
    }

    findAllMembers(data: RDF.Quad[]): string[] { 
        return [... new Set(data.map(element => element.subject.value))];
    }

    getFileLocation(index: number, config: IConfig): string {
        // file location
        const fileName = String(index).padStart(5, '0');
        return `${config.storage}/${fileName}.ttl`;
    }

    createHypermedia(data: RDF.Quad[], config: IConfig, fileLocation: string, nextPage: string | null, previousPage: string | null): RDF.Quad[] {
        let hypermedia: RDF.Quad[] = [];
        // add tree:member
        let treeMembers: string[] = this.findAllMembers(data);
        treeMembers.forEach(member => {
            hypermedia.push(quad(namedNode("https://smartdata.dev-vlaanderen.be/base/gemeente"), namedNode("https://w3id.org/tree#member"), namedNode(member)));
        });
        //  add tree:view
        hypermedia.push(quad(namedNode("https://smartdata.dev-vlaanderen.be/base/gemeente"), namedNode("https://w3id.org/tree#view"), namedNode(`${config.gh_pages_url}/${fileLocation}`)));

        // add tree:relation
        if (nextPage) {
            hypermedia.push(quad(namedNode(`${config.gh_pages_url}/${fileLocation}`), namedNode("https://w3id.org/tree#relation"), blankNode("Relation_Next")));
            hypermedia.push(quad(blankNode("Relation_Next"), namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), namedNode("https://w3id.org/tree#Relation")));
            hypermedia.push(quad(blankNode("Relation_Next"), namedNode("https://w3id.org/tree#node"), namedNode(`${config.gh_pages_url}/${nextPage}`)));
        }
        if (previousPage) {
            hypermedia.push(quad(namedNode(`${config.gh_pages_url}/${fileLocation}`), namedNode("https://w3id.org/tree#relation"), blankNode("Relation_Previous")));
            hypermedia.push(quad(blankNode("Relation_Previous"), namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), namedNode("https://w3id.org/tree#Relation")));
            hypermedia.push(quad(blankNode("Relation_Previous"), namedNode("https://w3id.org/tree#node"), namedNode(`${config.gh_pages_url}/${previousPage}`)));
        }

        return hypermedia;
    }

}

export default AlphabeticalFragmentStrategy;