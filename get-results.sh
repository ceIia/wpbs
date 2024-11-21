#!/bin/bash

mkdir -p route_docs

create_doc() {
    local route=$1
    local description=$2
    local method=${3:-GET}
    local body="$4"
    local format=${5:-plain}
    
    local filename="route_docs/$(echo $route | tr '/' '_').md"
    
    cat << EOF > "$filename"
# \`$route\`

$description

\`\`\`bash
http $method wp.some-domain.com$route $body
\`\`\`

\`\`\`${format}
EOF

    if [ "$method" = "POST" ]; then
        if [ "$format" = "json" ]; then
            eval "http POST http://wp.some-domain.com$route $body" | jq '.' > response.tmp
        else
            eval "http POST http://wp.some-domain.com$route $body" > response.tmp
        fi

        if [ $? -eq 0 ]; then
            cat response.tmp >> "$filename"
            rm response.tmp
        else
            echo "error making POST request to $route" >> "$filename"
        fi
    else
        if [ "$format" = "json" ]; then
            response=$(http http://wp.some-domain.com$route | jq '.')
        else
            response=$(http http://wp.some-domain.com$route)
        fi

        if [ $? -eq 0 ]; then
            echo "$response" >> "$filename"
        else
            echo "error making GET request to $route" >> "$filename"
        fi
    fi

    # Add final newline and closing backticks
    echo -e "\`\`\`" >> "$filename"
}

# frontend routes (HTML)
create_doc "/" "main frontend page with all the url rewriting goodness" "GET" "" "html"
create_doc "/page-with-buttons" "test page with button elements and their href attributes" "GET" "" "html"
create_doc "/page-with-components" "custom web components playground" "GET" "" "html"

# admin routes (HTML)
create_doc "/wp-admin" "wordpress admin dashboard simulation" "GET" "" "html"
create_doc "/wp-admin/post.php?post=123&action=edit" "post editor with wysiwyg content" "GET" "" "html"
create_doc "/wp-login.php" "login page (just a stub really)" "GET" "" "html"

# form submissions (JSON)
create_doc "/wp-admin/post.php" "form submission endpoint" "POST" \
    "-f redirect_to=https://www.some-domain.com/dashboard site_url=https://www.some-domain.com" "json"

# Alternative way to handle the complex POST command
json_data='{"cta":{"href":"https://www.some-domain.com/meta-action","text":"Visit www.some-domain.com"}}'
create_doc "/wp-admin/post.php" "meta box submission" "POST" "-f meta_content='$json_data'" "json"

# api routes (JSON)
create_doc "/wp-json/custom/v1" "example api endpoint that should stay untouched" "GET" "" "json"

# asset routes (plain)
create_doc "/wp-content/uploads/image.jpg" "content asset route"
create_doc "/wp-includes/css/style.css" "core asset route"

echo "created docs in route_docs/"