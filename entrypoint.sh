#!/bin/sh -l

node -v
# run main
node ./dist/index.js
# run post
node ./dist/post/index.js
