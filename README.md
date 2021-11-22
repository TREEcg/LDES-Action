# LDES-Action
![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/TREEcg/LDES-Action)

`LDES-Action` is a GitHub Action that replicates a
[Linked Data Event Stream](https://w3id.org/ldes/specification)
or [tree:Collection](https://w3id.org/tree/specification) and republishes it on GitHub Pages.

## Usage

Create a `.github/workflows/data.yaml` file in the repository where you want to fetch data. An example:

```yaml
# data.yaml

# make workflow concurrent
concurrency: ci-${{ github.ref }}

# trigger workflow:
on:
  # - on push to branch 'main'
  push:
    branches:
      - main
  # - on schedule, every 30 minutes
  schedule:
    - cron: '*/30 * * * *'
  # - manually 
  workflow_dispatch:

jobs:
  scheduled:
    runs-on: ubuntu-latest
    steps:
      # Check out the repository so it can read the files inside of it and do other operations
      - name: Check out repo
        uses: actions/checkout@v2
      # Fetch dataset, write data to json, push data to the repo and setup GitHub Pages
      - name: Fetch and write data
        uses: TREEcg/LDES-Action@v2
        with:
          # url you want to fetch
          url: 'https://smartdata.dev-vlaanderen.be/base/gemeente'
          # output directory name 
          storage: 'output'
```

The `TREEcg/LDES-Action` action will perform the following operations:
1. fetch data from the provided `url`
2. split and store the fetched data across turtle files in the `storage` directory
3. commit and push all of the data to your repo
4. deploy the data to GitHub Pages on branch `main`.

## Inputs

### `url`

URL to a LDES or tree:Collection dataset from which you want to fetch data.

### `storage`

Name of the output directory where the fetched data will be stored.

### `gh_pages_url` (optional)

URL where GitHub Pages will be deployed.  
Default: `http(s)://<username>.github.io/<repository> or http(s)://<organization>.github.io/<repository>`

### `fragmentation_strategy` (optional)

Fragmentation strategy that will be deployed.  
Default: `basic`  
possibele values:
- `subject-pages`: [LDES Subject Page Bucketizer documentation](https://github.com/TREEcg/bucketizers/tree/main/packages/bucketizer-subject-page)
- `substring`: [LDES Substring Bucketizer documentation](https://github.com/TREEcg/bucketizers/tree/main/packages/bucketizer-substring)
- `basic`: [LDES Basic Bucketizer documentation](https://github.com/TREEcg/bucketizers/tree/main/packages/bucketizer-basic)

### `fragmentation_page_size` (optional)

Amount of RDF objects that will be on a single page.  
Default: `'50'`

### `datasource_strategy` (optional)

Datasource strategy to use.  
Default: `ldes-client` (only one implemented at this point)

### `property_path` (optional)

Property path to be used by bucketizers.

### `stream_data` (optional)

Boolean whether to stream the LDES members or the load them in memory.  
Default: `false`

### `timeout` (optional)

Amount of time in milliseconds to wait for the datasource to fetch data in a single run, after which the datasource (LDES Client) will be paused. Take in mind that a single job execution run is limited to [6 hours](https://docs.github.com/en/actions/learn-github-actions/usage-limits-billing-and-administration). As a safety it is currently recommended to keer timeout under 5 hours.  
Default: `3600000` (1 hour)

## Outputs

### `delta_bytes`

A signed number describing the number of bytes that changed in this run.

# Development
## Test
Create a private `.env` file following this structure, with your wanted environment variables:

```
INPUT_URL="https://smartdata.dev-vlaanderen.be/base/gemeente"
INPUT_STORAGE="output"
INPUT_GIT_USERNAME="<YOUR_GIT_USERNAME>"
INPUT_GIT_EMAIL="<YOUR_GIT_EMAIL>"
INPUT_FRAGMENTATION_STRATEGY="alphabetical"
INPUT_FRAGMENTATION_PAGE_SIZE="100"
INPUT_DATASOURCE_STRATEGY="ldes-client"
```

Run the code to test it and check the output folder.

`npm run test`

## Compile
Compile this Node.js project into a single file (see [ncc](https://github.com/vercel/ncc)), this is needed if you want to use this as a GitHub Action:

`npm run dist`
