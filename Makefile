.DEFAULT_GOAL := check

.PHONY: build check lint test verify

check: verify

lint:
	corepack yarn lint

test:
	corepack yarn test

build:
	corepack yarn build

verify:
	corepack yarn verify
