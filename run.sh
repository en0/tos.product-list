#!/usr/bin/env bash

rm -f output.csv

i=0
for cc in US CA GB AU; do
    node index.js --output output-${cc}.csv en-${cc}
    i=$[$i+1]
    if [ $i -eq 1 ]; then
        cat output-${cc}.csv > output.csv
    else
        tail -n+2 output-${cc}.csv >> output.csv
    fi
    rm -f output-${cc}.csv
done


