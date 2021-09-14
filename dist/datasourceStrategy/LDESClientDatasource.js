"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const actor_init_ldes_client_1 = require("@treecg/actor-init-ldes-client");
class LDESClientDatasource {
    async getData(config) {
        return new Promise((resolve, reject) => {
            try {
                let options = {
                    emitMemberOnce: true,
                    disablePolling: true,
                    mimeType: 'text/turtle',
                    representation: "Quads",
                };
                let LDESClient = (0, actor_init_ldes_client_1.newEngine)();
                let eventStreamSync = LDESClient.createReadStream(config.url, options);
                let data = [];
                eventStreamSync.on('data', (member) => {
                    data.push(member);
                });
                eventStreamSync.on('end', () => {
                    console.log("No more data!");
                    resolve(data);
                });
            }
            catch (e) {
                console.error(e);
                return reject(e);
            }
        });
    }
}
exports.default = LDESClientDatasource;
