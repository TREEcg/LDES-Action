import type * as RDF from 'rdf-js';
import { literal, namedNode, blankNode, quad } from '@rdfjs/data-model';

export function getDummyData(): RDF.Quad[][] {
    let dummyData: RDF.Quad[][] = [];

    let object1: RDF.Quad[] = [];
    object1.push(quad(namedNode("https://smartdata.dev-vlaanderen.be/base/gemeente#053bcba5c91afecab628e53bf3773ebef27f0a07"), namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), namedNode("https://data.vlaanderen.be/ns/generiek#Gemeente")))
    object1.push(quad(namedNode("https://smartdata.dev-vlaanderen.be/base/gemeente#053bcba5c91afecab628e53bf3773ebef27f0a07"), namedNode("http://purl.org/dc/terms/isVersionOf"), namedNode("https://data.vlaanderen.be/id/gemeente/23100")))
    object1.push(quad(namedNode("https://smartdata.dev-vlaanderen.be/base/gemeente#053bcba5c91afecab628e53bf3773ebef27f0a07"), namedNode("http://www.w3.org/ns/prov#generatedAtTime"), literal("2002-08-13T16:33:18+02:00", namedNode("http://www.w3.org/2001/XMLSchema#dateTime"))))
    object1.push(quad(namedNode("https://smartdata.dev-vlaanderen.be/base/gemeente#053bcba5c91afecab628e53bf3773ebef27f0a07"), namedNode("http://www.w3.org/ns/adms#versionNotes"), literal("MunicipalityWasNamed")))
    object1.push(quad(namedNode("https://smartdata.dev-vlaanderen.be/base/gemeente#053bcba5c91afecab628e53bf3773ebef27f0a07"), namedNode("http://www.w3.org/2000/01/rdf-schema#label"), literal("Linkebeek")))
    object1.push(quad(namedNode("https://smartdata.dev-vlaanderen.be/base/gemeente#053bcba5c91afecab628e53bf3773ebef27f0a07"), namedNode("https://basisregisters.vlaanderen.be/ns/adres#Gemeente.officieleTaal"), literal("nl")))
    object1.push(quad(namedNode("https://smartdata.dev-vlaanderen.be/base/gemeente#053bcba5c91afecab628e53bf3773ebef27f0a07"), namedNode("https://basisregisters.vlaanderen.be/ns/adres#Gemeente.status"), namedNode("https://data.vlaanderen.be/id/concept/gemeentestatus/inGebruik")))
    dummyData.push(object1);

    let object2: RDF.Quad[] = [];
    object2.push(quad(namedNode("https://smartdata.dev-vlaanderen.be/base/gemeente#e1efbcd9d944880e507b77726eee58427ac32b3b"), namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), namedNode("https://data.vlaanderen.be/ns/generiek#Gemeente")))
    object2.push(quad(namedNode("https://smartdata.dev-vlaanderen.be/base/gemeente#e1efbcd9d944880e507b77726eee58427ac32b3b"), namedNode("http://purl.org/dc/terms/isVersionOf"), namedNode("https://data.vlaanderen.be/id/gemeente/23100")))
    object2.push(quad(namedNode("https://smartdata.dev-vlaanderen.be/base/gemeente#e1efbcd9d944880e507b77726eee58427ac32b3b"), namedNode("http://www.w3.org/ns/prov#generatedAtTime"), literal("2008-08-13T16:33:18+02:00", namedNode("http://www.w3.org/2001/XMLSchema#dateTime"))))
    object2.push(quad(namedNode("https://smartdata.dev-vlaanderen.be/base/gemeente#e1efbcd9d944880e507b77726eee58427ac32b3b"), namedNode("http://www.w3.org/ns/adms#versionNotes"), literal("MunicipalityWasNamed")))
    object2.push(quad(namedNode("https://smartdata.dev-vlaanderen.be/base/gemeente#e1efbcd9d944880e507b77726eee58427ac32b3b"), namedNode("http://www.w3.org/2000/01/rdf-schema#label"), literal("Linkebeek")))
    object2.push(quad(namedNode("https://smartdata.dev-vlaanderen.be/base/gemeente#e1efbcd9d944880e507b77726eee58427ac32b3b"), namedNode("https://basisregisters.vlaanderen.be/ns/adres#Gemeente.officieleTaal"), literal("nl")))
    object2.push(quad(namedNode("https://smartdata.dev-vlaanderen.be/base/gemeente#e1efbcd9d944880e507b77726eee58427ac32b3b"), namedNode("https://basisregisters.vlaanderen.be/ns/adres#Gemeente.faciliteitenTaal"), literal("fr")))
    object2.push(quad(namedNode("https://smartdata.dev-vlaanderen.be/base/gemeente#e1efbcd9d944880e507b77726eee58427ac32b3b"), namedNode("https://basisregisters.vlaanderen.be/ns/adres#Gemeente.status"), namedNode("https://data.vlaanderen.be/id/concept/gemeentestatus/inGebruik")))
    dummyData.push(object2);

    let object3: RDF.Quad[] = [];
    object3.push(quad(namedNode("https://smartdata.dev-vlaanderen.be/base/gemeente#6277b93006aa818c450feba1035410e4269b6dd3"), namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), namedNode("https://data.vlaanderen.be/ns/generiek#Gemeente")))
    object3.push(quad(namedNode("https://smartdata.dev-vlaanderen.be/base/gemeente#6277b93006aa818c450feba1035410e4269b6dd3"), namedNode("http://purl.org/dc/terms/isVersionOf"), namedNode("https://data.vlaanderen.be/id/gemeente/37015")))
    object3.push(quad(namedNode("https://smartdata.dev-vlaanderen.be/base/gemeente#6277b93006aa818c450feba1035410e4269b6dd3"), namedNode("http://www.w3.org/ns/prov#generatedAtTime"), literal("2002-08-13T16:33:18+02:00", namedNode("http://www.w3.org/2001/XMLSchema#dateTime"))))
    object3.push(quad(namedNode("https://smartdata.dev-vlaanderen.be/base/gemeente#6277b93006aa818c450feba1035410e4269b6dd3"), namedNode("http://www.w3.org/ns/adms#versionNotes"), literal("MunicipalityWasNamed")))
    object3.push(quad(namedNode("https://smartdata.dev-vlaanderen.be/base/gemeente#6277b93006aa818c450feba1035410e4269b6dd3"), namedNode("http://www.w3.org/2000/01/rdf-schema#label"), literal("Tielt")))
    object3.push(quad(namedNode("https://smartdata.dev-vlaanderen.be/base/gemeente#6277b93006aa818c450feba1035410e4269b6dd3"), namedNode("https://basisregisters.vlaanderen.be/ns/adres#Gemeente.officieleTaal"), literal("nl")))
    object3.push(quad(namedNode("https://smartdata.dev-vlaanderen.be/base/gemeente#6277b93006aa818c450feba1035410e4269b6dd3"), namedNode("https://basisregisters.vlaanderen.be/ns/adres#Gemeente.status"), namedNode("https://data.vlaanderen.be/id/concept/gemeentestatus/inGebruik")))
    dummyData.push(object3);

    return dummyData;
}