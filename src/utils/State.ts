import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';

export const saveState = (state: any): void => {
  const folder = './.ldes';
  if (!existsSync(folder)) {
    mkdirSync(folder);
  }
  writeFileSync(`${folder}/state.json`, JSON.stringify(state));
};

export const loadState = (): object => {
  const folder = './.ldes';
  if (existsSync(`${folder}/state.json`)) {
    return JSON.parse(readFileSync(`${folder}/state.json`).toString());
  }
  return {};
};
