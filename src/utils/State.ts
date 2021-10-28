import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import type { State } from '@treecg/actor-init-ldes-client';

export const saveState = (state: State, storage: string): void => {
  const folder = `./.ldes/${storage}`;
  if (!existsSync(folder)) {
    mkdirSync(folder, { recursive: true });
  }
  writeFileSync(`${folder}/state.json`, JSON.stringify(state));
};

export const loadState = (storage: string): State | null => {
  const folder = `./.ldes/${storage}`;
  if (existsSync(`${folder}/state.json`)) {
    return JSON.parse(readFileSync(`${folder}/state.json`).toString());
  }
  return null;
};
