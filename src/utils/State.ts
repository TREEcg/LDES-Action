import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import type { State } from '@treecg/actor-init-ldes-client';

export const saveState = (clientState: State, buckerizerState: any, storage: string): void => {
  const folder = `./.ldes/${storage}`;
  if (!existsSync(folder)) {
    mkdirSync(folder, { recursive: true });
  }
  const state: LDESActionState = {
    LDESClientState: clientState,
    BucketizerState: buckerizerState,
  };
  writeFileSync(`${folder}/state.json`, JSON.stringify(state));
};

export const loadState = (storage: string): LDESActionState | null => {
  const folder = `./.ldes/${storage}`;
  if (existsSync(`${folder}/state.json`)) {
    return JSON.parse(readFileSync(`${folder}/state.json`).toString());
  }
  return null;
};

export interface LDESActionState {
  LDESClientState: State;
  BucketizerState: any;
}
