#!/bin/bash

set -o errexit
cd "${0%/*}"

NAME="project-generator"
docker build --target $NAME -t $NAME  ..

INPUT=$PWD/../../projects/projects
OUTPUT=$PWD/../projects/generated

echo "Input: $INPUT"
echo "Output: $OUTPUT"

docker run -it --rm --volume "$INPUT:/input:ro" --volume "$OUTPUT:/output" $NAME
