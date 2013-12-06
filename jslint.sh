#!/bin/sh
jsl +recurse --process ./src/*.js | grep -A 2 'lint\|warning'