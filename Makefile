.DEFAULT_GOAL := check

.PHONY: build check lint root-test test verify

override SHELL := /bin/sh
override .SHELLFLAGS := -c
ifneq ($(strip $(MAKEFILES)),)
$(error MAKEFILES must be empty; repository verification requires this Makefile to be loaded alone)
endif
override MAKEFILES :=
ifneq ($(origin MAKEFILE_LIST),file)
$(error MAKEFILE_LIST must not be overridden)
endif
override REPO_ROOT := $(shell path='$(subst ','"'"',$(MAKEFILE_LIST))'; path=$$(printf '%s' "$$path" | /usr/bin/sed 's/^ //'); [ -f "$$path" ] || exit 1; directory=$$(/usr/bin/dirname -- "$$path"); CDPATH= cd -- "$$directory" && /bin/pwd -P)
export REPO_ROOT
ifeq ($(strip $(REPO_ROOT)),)
$(error repository Makefile path could not be resolved)
endif

check: verify

lint:
	cd "$$REPO_ROOT" && corepack yarn lint

test:
	cd "$$REPO_ROOT" && corepack yarn test

build:
	cd "$$REPO_ROOT" && corepack yarn build

root-test:
	cd "$$REPO_ROOT" && scripts/test-makefile-root.sh

verify: root-test
	cd "$$REPO_ROOT" && corepack yarn verify
