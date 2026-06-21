.DEFAULT_GOAL := check

.PHONY: __repository-make-authority build check lint root-test test verify

override SHELL := /bin/sh
override .SHELLFLAGS := -c
ifneq ($(filter command line override,$(origin MAKEFLAGS)),)
$(error MAKEFLAGS must not be overridden for repository verification)
endif
override REPOSITORY_MAKE_FIRST_FLAGS := $(firstword $(MAKEFLAGS))
ifneq ($(filter -%,$(REPOSITORY_MAKE_FIRST_FLAGS)),)
override REPOSITORY_MAKE_FIRST_FLAGS :=
endif
override REPOSITORY_MAKE_SHORT_FLAGS := $(REPOSITORY_MAKE_FIRST_FLAGS) $(filter-out --%,$(filter -%,$(MAKEFLAGS)))
ifneq ($(findstring n,$(REPOSITORY_MAKE_SHORT_FLAGS)),)
$(error non-executing or error-ignoring MAKEFLAGS are not supported for repository verification)
endif
ifneq ($(findstring t,$(REPOSITORY_MAKE_SHORT_FLAGS)),)
$(error non-executing or error-ignoring MAKEFLAGS are not supported for repository verification)
endif
ifneq ($(findstring q,$(REPOSITORY_MAKE_SHORT_FLAGS)),)
$(error non-executing or error-ignoring MAKEFLAGS are not supported for repository verification)
endif
ifneq ($(findstring i,$(REPOSITORY_MAKE_SHORT_FLAGS)),)
$(error non-executing or error-ignoring MAKEFLAGS are not supported for repository verification)
endif
ifneq ($(strip $(MAKEFILES)),)
$(error MAKEFILES must be empty; repository verification requires this Makefile to be loaded alone)
endif
override MAKEFILES :=
ifneq ($(origin MAKEFILE_LIST),file)
$(error MAKEFILE_LIST must not be overridden)
endif
override REPOSITORY_MAKEFILE := $(value MAKEFILE_LIST)
override REPO_ROOT := $(shell path='$(subst ','"'"',$(value MAKEFILE_LIST))'; path=$$(printf '%s' "$$path" | /usr/bin/sed 's/^ //'); [ -f "$$path" ] || exit 1; directory=$$(/usr/bin/dirname -- "$$path"); CDPATH= cd -- "$$directory" && /bin/pwd -P)
export REPO_ROOT
ifeq ($(strip $(REPO_ROOT)),)
$(error repository Makefile path could not be resolved)
endif

build check lint root-test test verify: __repository-make-authority

__repository-make-authority::
	@expected='$(subst ','"'"',$(value REPOSITORY_MAKEFILE))'; actual='$(subst ','"'"',$(value MAKEFILE_LIST))'; [ "$$actual" = "$$expected" ] || { printf '%s\n' 'additional Makefiles are not supported for repository verification' >&2; exit 2; }

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
