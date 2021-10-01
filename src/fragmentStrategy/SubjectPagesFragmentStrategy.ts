import FragmentStrategy from '../types/FragmentStrategy';
import type * as RDF from 'rdf-js';
import fs from 'fs';
import date from '../utils/date';
import { IConfig } from '../config';
import Member from '../types/Member';
const N3 = require('n3');

/**
 * Concrete Strategies implement the algorithm while following the base Strategy
 * interface. The interface makes them interchangeable in the Context.
 */
class SubjectPagesFragmentStrategy implements FragmentStrategy {
	fragment(data: Member[], config: IConfig): void {
		data.forEach((_data: Member) => {
			let identifier = this.find(
				_data.quads,
				'http://purl.org/dc/terms/isVersionOf'
			);
			let reference = identifier.substring(identifier.lastIndexOf('/') + 1);

			let generatedAtTime = this.find(
				_data.quads,
				'http://www.w3.org/ns/prov#generatedAtTime'
			);
			let basicISODate = date.dateToBasicISODate(new Date(generatedAtTime));

			// check if directory does not exist
			if (!fs.existsSync(`${config.storage}/${reference}`)) {
				//console.log('Directory not existing!');
				// make directory where we will store newly fetched data
				fs.mkdirSync(`${config.storage}/${reference}`);
			}

			// check if file not exists
			if (
				!fs.existsSync(`${config.storage}/${reference}/${basicISODate}.ttl`)
			) {
				// make file where we will store newly fetched data
				const writer = new N3.Writer({ format: 'N-Triples' });
				let serialised = writer.quadsToString(_data.quads);

				fs.writeFileSync(
					`${config.storage}/${reference}/${basicISODate}.ttl`,
					serialised
				);
			}
		});

		this.addSymbolicLinks(config);
	}

	find(data: any, predicate: string): any {
		const found = data.find(
			(element: RDF.Quad) => element.predicate.value === predicate
		);
		return found === undefined ? null : found.object.value;
	}

	addSymbolicLinks(config: IConfig): void {
		// get all directories in the storage directory
		const directories = fs
			.readdirSync(config.storage)
			.filter((file: string) =>
				fs.statSync(`${config.storage}/${file}`).isDirectory()
			);

		// get all filenames in the current directory
		directories.forEach((directory) => {
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
