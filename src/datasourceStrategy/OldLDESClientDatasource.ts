import { quad } from '@rdfjs/data-model';
import { newEngine } from '@treecg/actor-init-ldes-client';
import * as N3 from 'n3';
import type * as RDF from 'rdf-js';
import type { IConfig } from '../config';
import type IData from '../IData';
import type IDatasource from './IDatasource';

class OldLDESClientDatasource implements IDatasource {
  private readonly store: N3.Store;

  constructor() {
    this.store = new N3.Store();
  }

  async getData(config: IConfig): Promise<IData[]> {
    await this.fetchData(config);
    return await this.reshapeData();
  }

  private async fetchData(config: IConfig): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        const options = {
          emitMemberOnce: true,
          disablePolling: true,
          mimeType: 'text/turtle',
        };

        const LDESClient = newEngine();
        const eventStreamSync = LDESClient.createReadStream(
          config.url,
          options,
        );

        // @ Here should come the RDF.Quad[][] implementation when it is finished in the library!
        // It should replace the current N3 Parser implementation.
        const parser = new N3.Parser({ format: 'text/turtle' });

        // Read quads and add them to triple store
        // @ts-expect-error
        parser.parse(eventStreamSync, (err, quad, prefs) => {
          if (err) {
            throw err;
          }
          if (prefs) {
            console.log('prefixes:', prefs);
          }
          if (quad) {
            this.store.addQuad(quad);
          } else {
            return resolve();
          }
        });
      } catch (error) {
        console.error(error);
        return reject(error);
      }
    });
  }

  // This code should be deprecatable when issue https://github.com/TREEcg/event-stream-client/issues/22 is fixed
  private async reshapeData(): Promise<IData[]> {
    return new Promise<IData[]>((resolve, reject) => {
      try {
        const reshapedData: IData[] = [];

        const uniqueSubjects = this.store.getSubjects(null, null, null);

        uniqueSubjects.forEach(subject => {
          const subjectQuads = this.store.getQuads(subject, null, null, null);

          // N3.Quad to RDF.Quad
          const reshapedSubjectQuads: RDF.Quad[] = [];
          subjectQuads.forEach(_quad => {
            const quadSubject = _quad.subject;
            const quadPredicate = _quad.predicate;
            const quadObject = _quad.object;
            const quadGraph = _quad.graph;

            const reshapedQuad = quad(quadSubject, quadPredicate, quadObject, quadGraph);

            reshapedSubjectQuads.push(reshapedQuad);
          });

          reshapedData.push({
            id: subject.value,
            quads: reshapedSubjectQuads,
          });
        });

        return resolve(reshapedData);
      } catch (error) {
        console.error(error);
        return reject(error);
      }
    });
  }
}

export default OldLDESClientDatasource;
