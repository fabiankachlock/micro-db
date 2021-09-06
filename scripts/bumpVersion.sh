#!/bin/sh

echo "bump $1 for node-micro-db"

if ! [ "$1" == "patch" ] || [ "$1" == "major" ] || [ "$1" == "minor" ]; then
	echo "unknown $1"
	exit 1
fi

if ! [ "$(git branch --show-current)" == "main" ]; then
 exit 1
fi

oldVersion=$(npm info node-micro-db version)

echo "on main..."
echo "old version $oldVersion"

echo "running checks..."
yarn test
yarn lint

echo "formatting..."
yarn format

echo "building package..."
yarn build

echo "bumping version"
newVersion=$(npm version $1)

echo "bumped version"
echo "new version $newVersion"

echo "publishing..."
git push --tags
npm publish --access=public
git push

echo "succesfully published $newVersion"
