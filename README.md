# gh-action-republish-ldes
gh-action-republish-ldes is a GitHub Action that replicates a Linked Data Event Stream or tree:Collection and 
republishes it on GitHub Pages.

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
      # Fetch the dataset, write the data to json files and push the files to the repo
      - name: Fetch and write data
        uses: TREEcg/gh-action-republish-ldes@development
        with:
          # url you want to fetch
          url: 'https://smartdata.dev-vlaanderen.be/base/gemeente'
          # output directory name 
          storage: 'output'
```

The `scheduled` job will fetch the dataset, split it into multiple json files and write these files to a new directory inside `storage`, which will be named after the date when we performed the fetch.

## Inputs

### `url`

URL to a LDES or tree:Collection dataset from which you want to fetch data.

### `storage`

Name of the output directory where the fetched data will be stored.

### `postprocess` (optional)

Path to a JavaScript file for postprocessing the data in `storage`. *(not implemented yet)*

### `gh_pages_branch` (optional)

Branch where GitHub Pages will be deployed. The branch will be created if it doesn't exist yet.\
Default: `'gh-pages'`


## Outputs

### `delta_bytes`

A signed number describing the number of bytes that changed in this run.
