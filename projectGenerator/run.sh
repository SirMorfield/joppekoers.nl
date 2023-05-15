#!/bin/bash

set -o errexit
cd "${0%/*}"

NAME="project-generator"
docker build -t $NAME .

INPUT=$PWD/../../projects/projects/
OUTPUT=$PWD/../frontend/static/img/projectImg/

echo "Input: $INPUT"
echo "Output: $OUTPUT"

docker run -it --rm -v "$INPUT:/input:ro" -v "$OUTPUT:/output" $NAME
