import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import type { State } from '@treecg/actor-init-ldes-client';

export const saveState = (state: State): void => {
  const folder = './.ldes';
  if (!existsSync(folder)) {
    mkdirSync(folder);
  }
  writeFileSync(`${folder}/state.json`, JSON.stringify(state));
};

export const loadState = (): State | null => {
  const folder = './.ldes';
  if (existsSync(`${folder}/state.json`)) {
    return JSON.parse(readFileSync(`${folder}/state.json`).toString());
  }
  return null;
};
