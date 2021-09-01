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
      # Check out the repository, so it can read the files inside it and do other operations
      - name: Check out repo
        uses: actions/checkout@v2
      # Fetch, fragment and write data + deploy to GitHub Pages
      - name: Fetch and write data
        uses: TREEcg/gh-action-republish-ldes@development
        with:
          # url you want to fetch data from
          url: 'https://smartdata.dev-vlaanderen.be/base/gemeente'
          # output directory name 
          storage: 'output'
```

The `TREEcg/gh-action-republish-ldes` action will perform the following operations:
1. fetch data from the provided `url`
2. if `predicate` input was provided, refragment data 
3. split and store the data as [Turtle](https://www.w3.org/TR/turtle) files in the `storage` directory
4. commit and push all of the data to your repo
5. deploy the data to GitHub Pages on branch `gh_pages_branch` (if not provided, the default branch is `'gh-pages'`).

## Inputs

### `url`

URL to a LDES or tree:Collection dataset from which you want to fetch data.

### `storage`

Name of the output directory where the fetched data will be stored.

### `predicate` (optional)

URI of a predicate, used for fragmenting (sorting) the members. This predicate should be present in each member.

### `max_members` (optional)

Maximum amount of members stored per data file.\
**Default:** `500`

### `gh_pages_branch` (optional)

Branch where GitHub Pages will be deployed. The branch will be created if it doesn't exist yet.\
**Default:** `'gh-pages'`

## Outputs

### `delta_bytes`

A signed number describing the number of bytes that changed in this run.
