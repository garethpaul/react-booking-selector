.DEFAULT_GOAL := check

.PHONY: build check lint root-test test verify

ifneq ($(origin MAKEFILE_LIST),file)
$(error MAKEFILE_LIST must not be overridden)
endif
override REPO_ROOT := $(shell path='$(subst ','"'"',$(MAKEFILE_LIST))'; path=$$(printf '%s' "$$path" | /bin/sed 's/^ //'); directory=$$(/usr/bin/dirname -- "$$path"); CDPATH= cd -- "$$directory" && /bin/pwd -P)

check: verify

lint:
	cd "$(REPO_ROOT)" && corepack yarn lint

test:
	cd "$(REPO_ROOT)" && corepack yarn test

build:
	cd "$(REPO_ROOT)" && corepack yarn build

root-test:
	cd "$(REPO_ROOT)" && scripts/test-makefile-root.sh

verify: root-test
	cd "$(REPO_ROOT)" && corepack yarn verify
