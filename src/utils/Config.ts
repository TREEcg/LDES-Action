import * as core from '@actions/core';

export interface Config {
  // HTTP(S) data source
  url: string;

  // Directory where data will be written
  storage: string;

  // Branch used for deploying to GitHub Pages
  gh_pages_branch: string;

  // URL of the GitHub Pages deployment
  gh_pages_url: string;

  // GitHub username that makes the commits
  git_username: string;

  // GitHub email that makes the commits
  git_email: string;

  // Fragmentation strategy
  fragmentation_strategy: string;

  // Page size for fragmentation
  fragmentation_page_size: number;

  // Datasource strategy
  datasource_strategy: string;

  // Property path that will be resolved by bucketizer
  property_path: string;

  // Amount of time to wait for the datasource to fetch data in a single run
  timeout: number;

  // Announce the published LDES view to https://tree.linkeddatafragments.org/announcements/
  announce: boolean;
}

export function getConfig(): Config {
  return {
    url: core.getInput('url'),
    storage: core.getInput('storage'),
    gh_pages_branch: core.getInput('gh_pages_branch'),
    gh_pages_url: core.getInput('gh_pages_url'),
    git_username: core.getInput('git_username'),
    git_email: core.getInput('git_email'),
    fragmentation_strategy: core.getInput('fragmentation_strategy'),
    fragmentation_page_size: Number.parseInt(
      core.getInput('fragmentation_page_size'),
      10,
    ),
    datasource_strategy: core.getInput('datasource_strategy'),
    property_path: core.getInput('property_path'),
    timeout: Number.parseInt(core.getInput('timeout'), 10) || 1_000 * 60 * 60 * 1,
    announce: core.getBooleanInput('announce') || false,
  };
}
