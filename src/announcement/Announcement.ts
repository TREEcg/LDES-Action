import path from 'path';
import { getResourceAsStore } from '@dexagod/rdf-retrieval';
import { createViewAnnouncement, postAnnouncement } from '@treecg/ldes-announcements';
import type { Config } from '../utils/Config';

export async function sendAnnouncement(config: Config): Promise<any> {
  const configNotBasic = config.fragmentation_strategy === 'substring' ||
    config.fragmentation_strategy === 'subject-page';
  const rootFileName = configNotBasic ? 'root.ttl' : '0.ttl';

  // TODO: Verify that this works when deploying with the action
  const storageLocation = path.join(module.path, '../../', config.storage, rootFileName);
  const store = await getResourceAsStore(storageLocation);

  const announcementConfig = {
    bucketizer: config.fragmentation_strategy,
    creatorName: config.git_username,
    creatorURL: `https://github.com/${config.git_username}`,
    originalLDESURL: config.url,
    pageSize: config.fragmentation_page_size.toString(),
    propertyPath: config.property_path,
    viewId: `${config.gh_pages_url}/${config.storage}/${rootFileName}`,
  };
  // NOTE: Parse gh pages bit more?
  const announcement = await createViewAnnouncement(store, announcementConfig);
  return await postAnnouncement(announcement, 'https://tree.linkeddatafragments.org/announcements/');
}
