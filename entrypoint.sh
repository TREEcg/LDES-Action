#!/bin/sh -l

echo "Node version:"
node -v

echo "Environment variables:"
printenv

# run main script
node dist/index.js

# run post script
node dist/post/index.js