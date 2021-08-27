const client = require('@treecg/actor-init-ldes-client');
main()

function main() {
    try {
        let url = "https://smartdata.dev-vlaanderen.be/base/gemeente";
        let options = {
            "pollingInterval": 5000, // millis
            "mimeType": "application/ld+json",
            "emitMemberOnce": true,
            "disablePolling": true,
        };
        let LDESClient = new client.newEngine();
        let eventstreamSync = LDESClient.createReadStream(url, options);
        const processedPages = [
            'https://smartdata.dev-vlaanderen.be/base/gemeente?page=1',
            'https://smartdata.dev-vlaanderen.be/base/gemeente?page=2'
        ];
        eventstreamSync.ignorePages(processedPages);
        eventstreamSync.on('data', (data) => {
            let obj = JSON.parse(data);
            //console.log("data");
        });
        eventstreamSync.on('end', () => {
            console.log("No more data!");
        });
    } catch (e) {
        console.error(e);
    }
}