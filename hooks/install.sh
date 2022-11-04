#!/bin/sh

# move to current directory, so execution is always relative to this file
cd "${0%/*}"
me=`basename "$0"`
cp -f $(find . -type f -not -name $me) ../.git/hooks
