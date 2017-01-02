#!/usr/local/bin/fish

function query_graph --description "query_graph <id> <query>"
    curl -o - -s -S "$MIND_API_URL/query/$argv[1]" -XPOST -H "Content-Type: application/json" -d $argv[2]
end

function new_node --description "new_node <payload:{ props, in, out, del }>"
    curl -o - -s -S "$MIND_API_URL/node" -XPOST -H "Content-Type: application/json" -d $argv[1]
end

function mutate_node --description "mutate_node <id> <payload:{ props, in, out, del }>"
    curl -o - -s -S "$MIND_API_URL/node/$argv[1]" -XPOST -H "Content-Type: application/json" -d $argv[2]
end

function mutate_graph --description "mutate_graph <payload:{ id: { props, in, out, del } }>"
    curl -o - -s -S "$MIND_API_URL/graph" -XPOST -H "Content-Type: application/json" -d $argv[1]
end
