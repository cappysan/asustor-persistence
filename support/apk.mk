# SPDX-License-Identifier: MIT
#
.PHONY: all apk

all: apk

apk: ## build the apk package
	fakeroot support/apkg.py create apk --destination .
	realpath cappysan-*.apk
