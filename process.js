import { readJSON, writeJSON } from 'https://deno.land/x/flat@0.0.13/mod.ts'
import { ensureDir } from 'https://deno.land/std@0.105.0/fs/ensure_dir.ts'

// Read the downloaded_filename JSON-LD
const filename = Deno.args[0];
const data = await readJSON(filename);
console.log(data);

// Filter specific data we want to keep and write to a new JSON file
const members = data.member;

// Write a new JSON file with processed data
await ensureDir('connections');
const current_time = new Date().toISOString();
await writeJSON(`connections/${current_time}.json`, members);
console.log(`Wrote a post process file to ${current_time}.json`);