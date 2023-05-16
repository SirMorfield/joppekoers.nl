#!/bin/bash

set -o errexit
cd "${0%/*}"

NAME="project-generator"
docker build --target $NAME -t $NAME  ..

INPUT=$PWD/../../projects/projects
OUTPUT=$PWD/../frontend/static/img/projectImg
EXPORT=$PWD/../frontend/src/lib/ProjectCard.svelte

echo "Input: $INPUT"
echo "Output: $OUTPUT"
echo "Export: $EXPORT"

docker run -it --rm --volume "$INPUT:/input:ro" --volume "$OUTPUT:/output" --volume "$EXPORT:/export" $NAME
