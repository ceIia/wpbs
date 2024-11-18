install nginx

```bash
sudo brew (re)install nginx-full --with-subs-filter-module --with-sub
```

config nginx

```bash
sudo nano /opt/homebrew/etc/nginx/nginx.conf
```

config hosts file

```bash
sudo sh -c 'echo "127.0.0.1    wp.some-domain.com www.some-domain.com" >> /etc/hosts'
```

run nginx

```bash
sudo nginx -t && sudo brew services restart nginx-full && sudo brew services
```

test

```bash
bun test ./test.ts
curl http://wp.some-domain.com/wp-json/custom/v1
curl http://wp.some-domain.com/wp-admin/
curl http://wp.some-domain.com/
```
