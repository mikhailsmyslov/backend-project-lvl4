install:
	npm install

start:
	NODE_ENV=development npx nodemon --exec gulp server

build:
	rm -rf public
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

rebuild-dev-db:
	npx sequelize db:drop --env development
	npx sequelize db:create --env development
	npx sequelize db:migrate --env development
	npx sequelize db:seed:all --env development
