# repository

Repository of js-dos bundles

## How to build

1. yarn install
2. yarn run build

## How to deploy

1. yarn run build
2. cd _site
3. aws s3 sync . s3://dos.zone

Optionally you can specify --delete in (3), if so you need to redeploy dos.zone.app.
