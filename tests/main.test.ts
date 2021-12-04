import { Data } from '../src/data';

let config = {
    url: 'https://smartdata.dev-vlaanderen.be/base/gemeente',
    storage: 'test-output',
    gh_pages_branch: '',
    gh_pages_url: '',
    git_username: '',
    git_email: '',
    fragmentation_strategy: 'basic',
    fragmentation_page_size: 10,
    datasource_strategy: 'ldes-client',
    property_path: '',
    stream_data: true,
    timeout: 1_000 * 60 * 60 * 1,
  };

describe('main', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    test('test bucketizer: basic', async () => {
        const data_fetcher = new Data(config);
        await data_fetcher.processData();

    });
  
});