#!/bin/fsh

function new_node --description "new_node <subject> <predicate> <type> <body>"
    curl "localhost:9051/nodes/$argv[1]/$argv[2]" -XPOST -H "Content-Type: application/json" -d "{
        \"is\": \"$argv[3]\",
        \"body\": \"$argv[4]\"
    }"
end

function query_node --description "query_node <subject> <predicate>"
    curl "localhost:9051/query/$argv[1]" -XPOST -H "Content-Type: application/json" -d "{
        \"body\": true,
        \"$argv[2]\": { \"body\": true }
    }"
end

function query_graph --description "query_graph <subject> <query>"
    curl "localhost:9051/query/$argv[1]" -XPOST -H "Content-Type: application/json" -d $argv[2]
end