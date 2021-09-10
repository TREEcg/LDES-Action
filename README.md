# gh-action-republish-ldes

`gh-action-republish-ldes` is a GitHub Action that replicates a
[Linked Data Event Stream](https://w3id.org/ldes/specification)
or [tree:Collection](https://w3id.org/tree/specification) and republishes it on GitHub Pages.

## Usage

Create a `.github/workflows/data.yaml` file in the repository where you want to fetch data. An example:

```yaml
# data.yaml

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
        uses: TREEcg/gh-action-republish-ldes@development
        with:
          # url you want to fetch
          url: 'https://smartdata.dev-vlaanderen.be/base/gemeente'
          # output directory name 
          storage: 'output'
```

The `TREEcg/gh-action-republish-ldes` action will perform the following operations:
1. fetch data from the provided `url`
2. split and store the fetched data across json files in the `storage` directory
3. commit and push all of the data to your repo
4. deploy the data to GitHub Pages on branch `gh_pages_branch` (if not provided, the default branch is `gh-pages`).

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
Default: `subject-pages`

### `fragmentation_page_size` (optional)

Amount of RDF objects that will be on a single page.
Default: `'50'`

## Outputs

### `delta_bytes`

A signed number describing the number of bytes that changed in this run.
