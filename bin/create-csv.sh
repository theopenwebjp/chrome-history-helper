#!/usr/bin/env bash
pwd
mkdir -p ./results/

sqlite3 ./results/History <<EOF
.headers on
.mode csv
.output ./results/my-history.csv
SELECT datetime(last_visit_time/1000000-11644473600,'unixepoch','localtime'), url FROM urls ORDER BY last_visit_time DESC;
EOF