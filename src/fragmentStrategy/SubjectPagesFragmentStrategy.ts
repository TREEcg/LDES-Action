import fs from 'fs';
import type * as RDF from 'rdf-js';
import type { IConfig } from '../config';
import type IData from '../IData';
import date from '../utils/date';
import type IFragmentStrategy from './IFragmentStrategy';
const N3 = require('n3');

/**
 * Concrete Strategies implement the algorithm while following the base Strategy
 * interface. The interface makes them interchangeable in the Context.
 */
class SubjectPagesFragmentStrategy implements IFragmentStrategy {
  fragment(data: IData[], config: IConfig): void {
    data.forEach((_data: IData) => {
      const identifier = this.find(_data.quads, 'http://purl.org/dc/terms/isVersionOf');
      const reference = identifier.slice(Math.max(0, identifier.lastIndexOf('/') + 1));

      const generatedAtTime = this.find(_data.quads, 'http://www.w3.org/ns/prov#generatedAtTime');
      const basicISODate = date.dateToBasicISODate(new Date(generatedAtTime));

      // Check if directory does not exist
      if (!fs.existsSync(`${config.storage}/${reference}`)) {
        // Console.log('Directory not existing!');
        // make directory where we will store newly fetched data
        fs.mkdirSync(`${config.storage}/${reference}`);
      }

      // Check if file not exists
      if (!fs.existsSync(`${config.storage}/${reference}/${basicISODate}.ttl`)) {
        // Make file where we will store newly fetched data
        const writer = new N3.Writer({ format: 'N-Triples' });
        const serialised = writer.quadsToString(_data.quads);

        fs.writeFileSync(`${config.storage}/${reference}/${basicISODate}.ttl`, serialised);
      }
    });

    this.addSymbolicLinks(config);
  }

  find(data: any, predicate: string): any {
    const found = data.find((element: RDF.Quad) => element.predicate.value === predicate);
    return found === undefined ? null : found.object.value;
  }

  addSymbolicLinks(config: IConfig): void {
    // Get all directories in the storage directory
    const directories = fs.readdirSync(config.storage).filter(
      (file: string) => fs.statSync(`${config.storage}/${file}`).isDirectory(),
    );

    // Get all filenames in the current directory
    directories.forEach(directory => {
      const files: string[] = fs.readdirSync(`${config.storage}/${directory}`);

      // Sort files array lexicographically to get the latest version
      const latest = files.sort()[files.length - 1];

      // Create latest.ttl file
      // fs.writeFileSync(`${config.storage}/${directory}/latest.ttl`, '');
      // check if symbolic link already exists
      if (fs.existsSync(`${config.storage}/${directory}/latest.ttl`)) {
        // Delete symbolic link
        fs.unlinkSync(`${config.storage}/${directory}/latest.ttl`);
        console.log(`unlinked ${config.storage}/${directory}/latest.ttl`);
      }

      // Create symbolic link latets.ttl -> latest file
      // fs.symlinkSync(`/${config.storage}/${directory}/${latest}`, `${config.storage}/${directory}/latest.ttl`);
      fs.symlinkSync(`${latest}`, `${config.storage}/${directory}/latest.ttl`);
    });
  }
}

export default SubjectPagesFragmentStrategy;
