import fs from "fs/promises";

export interface IConfig {
    data_source: string,    // HTTP(S) data source
    output_dir: string,     // directory where data will be written
    postprocess?: string    // path to postprocessing script, if necessary
}

export const getConfig = async (): Promise<IConfig> => {
    return JSON.parse(await fs.readFile('config.json', {encoding: 'utf8'}));
}