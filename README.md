install nginx
`sudo brew (re)install nginx-full --with-subs-filter-module --with-sub`

config nginx
`sudo nano /opt/homebrew/etc/nginx/nginx.conf`

config hosts file
`sudo sh -c 'echo "127.0.0.1    wp.some-domain.com www.some-domain.com" >> /etc/hosts'`

run nginx
`sudo nginx -t && sudo brew services restart nginx-full && sudo brew services`

test
`bun test ./test.ts`
`curl http://wp.some-domain.com/wp-json/custom/v1`
`curl http://wp.some-domain.com/wp-admin/`
`curl http://wp.some-domain.com/`
