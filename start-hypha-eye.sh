#!/usr/bin/env bash

usage="./start-hypha-eye [build|image]"
if [ $# -ne 1 ]; then
    echo $usage
    exit 1
fi

if [[ $1 != 'build' && $1 != 'image' ]]; then
    echo $usage
    exit 1
fi

script_path="$(dirname $(realpath ${BASH_SOURCE[0]}))"

pushd $script_path

#cp .env.$1 .env

if [[ $1 = build ]]; then
  docker-compose -p hypha-eye up --build -d
#else
  #docker-compose -f docker-compose.yml -f docker-compose.prod.yml -p doc-cache-$1 up -d
fi

popd
