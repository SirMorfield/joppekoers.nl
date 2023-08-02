#!/bin/bash

set -o errexit
cd "${0%/*}"

NAME="project-generator"
docker build --target $NAME -t $NAME  ..

INPUT=$PWD/../../projects/projects
OUTPUT=$PWD/../../projects/generated
mkdir -p "$OUTPUT"
mkdir -p "$INPUT"

echo 'Input : ' $(realpath "$INPUT")
echo 'Output: ' $(realpath "$OUTPUT")

docker run -it --rm --volume "$INPUT:/input:ro" --volume "$OUTPUT:/output" $NAME
