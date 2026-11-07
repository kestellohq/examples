#!/bin/sh
# Build the Vue pages of every example (or the ones named) with Kestello's build, from the
# repository root so the paths written into the built files are the same on every machine.
#
#   sh tools/build.sh                  every package with resources/js
#   sh tools/build.sh plugins/hello    one
set -eu

root=$(cd "$(dirname "$0")/.." && pwd)
cd "$root"

if [ ! -f kestello/core/build/build.mjs ]; then
    echo "error: there is no Kestello checkout in kestello/. Run: sh tools/setup.sh" >&2
    exit 1
fi

if [ $# -eq 0 ]; then
    for dir in plugins/* themes/*; do
        [ -d "$dir/resources/js" ] && set -- "$@" "$dir"
    done
fi
# build.mjs resolves folders against Kestello's root, so pass absolute paths
for target in "$@"; do
    shift
    set -- "$@" "$root/${target%/}"
done

node kestello/core/build/build.mjs "$@"
