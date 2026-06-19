.DEFAULT_GOAL := check

.PHONY: build check lint test verify

override REPO_ROOT := $(abspath $(dir $(lastword $(MAKEFILE_LIST))))

check: verify

lint:
	cd "$(REPO_ROOT)" && corepack yarn lint

test:
	cd "$(REPO_ROOT)" && corepack yarn test

build:
	cd "$(REPO_ROOT)" && corepack yarn build

verify:
	cd "$(REPO_ROOT)" && corepack yarn verify
