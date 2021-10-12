import type { Readable } from 'stream';
import type { IBucketizer } from '@treecg/ldes-types';
import type { Config } from '../Config';
import type Member from './Member';

// eslint-disable-next-line @typescript-eslint/naming-convention
interface Datasource {
	getData: (config: Config, bucketizer: IBucketizer) => Promise<Member[]>;
	getLinkedDataEventStream: (url: string) => Readable;
}

export default Datasource;
