#!/usr/bin/env bash

source .env

rm -f $OUTPUT

i=0
for cc in US CA GB AU; do
    node index.js --output output-${cc}.csv en-${cc}
    i=$[$i+1]
    if [ $i -eq 1 ]; then
        cat output-${cc}.csv > $OUTPUT
    else
        tail -n+2 output-${cc}.csv >> $OUTPUT
    fi
    rm -f output-${cc}.csv
done

echo Report Runtime: $(date "+%R %D %Z")
echo Output File: $OUTPUT
echo Public URL: $PUBLIC

open "https://docs.google.com/spreadsheets/d/1i2Zabd85hTWyJJX0RXcdAwyRmICzQVKNF0arbZ8bXe4/edit#gid=409052318"
echo $PUBLIC | pbcopy
# echo $PUBLIC | xclip -i -sel clip
