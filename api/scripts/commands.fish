#!/usr/local/bin/fish

function new_node --description "new_node <subject> <predicate> <type> <body>"
    curl "$MIND_API_URL/graph/$argv[1]/$argv[2]" -XPOST -H "Content-Type: application/json" -d "{
        \"props\": { \"body\": \"$argv[4]\" },
        \"links\": { \"is\": \"$argv[3]\" }
    }"
end

function post_node --description "post_node <subject> <predicate> <payload:{ props, links }>"
    curl "$MIND_API_URL/graph/$argv[1]/$argv[2]" -XPOST -H "Content-Type: application/json" -d $argv[3]
end

function update_node --description "update_node <subject> <payload:{ props, links, removals }>"
    curl "$MIND_API_URL/graph/$argv[1]" -XPOST -H "Content-Type: application/json" -d $argv[2]
end

function link_nodes --description "link_nodes <subject> <predicate> <object>"
    curl "$MIND_API_URL/graph/$argv[1]/$argv[2]/$argv[3]" -XPOST -H "Content-Type: application/json" -d "{}" 
end

function query_graph --description "query_graph <subject> <query>"
    curl -v "$MIND_API_URL/query/$argv[1]" -XPOST -H "Content-Type: application/json" -d $argv[2]
end

function delete_link --description "delete_link <subject> <predicate> <object>"
    curl "$MIND_API_URL/graph/$argv[1]/$argv[2]/$argv[3]" -XDELETE
end
