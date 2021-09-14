"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const date_1 = __importDefault(require("../utils/date"));
const N3 = require('n3');
/**
 * Concrete Strategies implement the algorithm while following the base Strategy
 * interface. The interface makes them interchangeable in the Context.
 */
class SubjectPagesFragmentStrategy {
    fragment(data, config) {
        data.forEach((_data) => {
            let identifier = this.find(_data.quads, 'http://purl.org/dc/terms/isVersionOf');
            let reference = identifier.substring(identifier.lastIndexOf('/') + 1);
            let generatedAtTime = this.find(_data.quads, 'http://www.w3.org/ns/prov#generatedAtTime');
            let basicISODate = date_1.default.dateToBasicISODate(new Date(generatedAtTime));
            // check if directory does not exist
            if (!fs_1.default.existsSync(`${config.storage}/${reference}`)) {
                //console.log('Directory not existing!');
                // make directory where we will store newly fetched data
                fs_1.default.mkdirSync(`${config.storage}/${reference}`);
            }
            // check if file not exists
            if (!fs_1.default.existsSync(`${config.storage}/${reference}/${basicISODate}.ttl`)) {
                // make file where we will store newly fetched data     
                const writer = new N3.Writer({ format: 'N-Triples' });
                let serialised = writer.quadsToString(_data.quads);
                fs_1.default.writeFileSync(`${config.storage}/${reference}/${basicISODate}.ttl`, serialised);
            }
        });
        this.addSymbolicLinks(config);
    }
    find(data, predicate) {
        const found = data.find((element) => element.predicate.value === predicate);
        return (found === undefined) ? null : found.object.value;
    }
    addSymbolicLinks(config) {
        // get all directories in the storage directory
        const directories = fs_1.default.readdirSync(config.storage).filter((file) => fs_1.default.statSync(`${config.storage}/${file}`).isDirectory());
        // get all filenames in the current directory
        directories.forEach(directory => {
            const files = fs_1.default.readdirSync(`${config.storage}/${directory}`);
            // sort files array lexicographically to get the latest version
            let latest = files.sort()[files.length - 1];
            // create latest.ttl file
            // fs.writeFileSync(`${config.storage}/${directory}/latest.ttl`, '');
            // check if symbolic link already exists
            if (fs_1.default.existsSync(`${config.storage}/${directory}/latest.ttl`)) {
                // delete symbolic link
                fs_1.default.unlinkSync(`${config.storage}/${directory}/latest.ttl`);
                console.log(`unlinked ${config.storage}/${directory}/latest.ttl`);
            }
            // create symbolic link latets.ttl -> latest file
            //fs.symlinkSync(`/${config.storage}/${directory}/${latest}`, `${config.storage}/${directory}/latest.ttl`);
            fs_1.default.symlinkSync(`${latest}`, `${config.storage}/${directory}/latest.ttl`);
        });
    }
}
exports.default = SubjectPagesFragmentStrategy;
