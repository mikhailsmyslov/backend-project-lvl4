install:
	npm install

start:
	npx nodemon --exec gulp server

build:
	rm -rf dist
	npm run build

publish:
	npm publish --dry-run

lint:
	npx eslint .

test:
	npm test

test-coverage:
	npm test -- --coverage

test-silent:
	npm test --  --silent

test-watch:
	npm test -- --watch
