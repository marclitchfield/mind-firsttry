#!/usr/local/bin/fish

function new_node --description "new_node <subject> <predicate> <type> <body>"
    curl "$MIND_API_URL/graph/$argv[1]/$argv[2]" -XPOST -H "Content-Type: application/json" -d "{
        \"is\": \"$argv[3]\",
        \"body\": \"$argv[4]\"
    }"
end

function post_node --description "new_node <subject> <predicate> <properties>"
    curl -v "$MIND_API_URL/graph/$argv[1]/$argv[2]" -XPOST -H "Content-Type: application/json" -d $argv[3]
end

function link_nodes --description "link_nodes <subject> <predicate> <object>"
    curl "$MIND_API_URL/graph/$argv[1]/$argv[2]/$argv[3]" -XPOST -H "Content-Type: application/json" -d "{}" 
end

function query_node --description "query_node <subject> <predicate>"
    curl "$MIND_API_URL/query/$argv[1]" -XPOST -H "Content-Type: application/json" -d "{
        \"body\": true,
        \"$argv[2]\": { \"body\": true }
    }"
end

function query_graph --description "query_graph <subject> <query>"
    curl "$MIND_API_URL/query/$argv[1]" -XPOST -H "Content-Type: application/json" -d $argv[2]
end

function delete_link --description "delete_link <subject> <predicate> <object>"
    curl "$MIND_API_URL/graph/$argv[1]/$argv[2]/$argv[3]" -XDELETE
end
