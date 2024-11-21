# wordpress backend simulator

simulates wordpress responses for testing url rewriting shenanigans. local dev environment for testing frontend and backend url rewrites, because production is too much of a risk (if we could even get it to work).

## quickstart with docker

```bash
# add these to /etc/hosts
127.0.0.1    wp.some-domain.com www.some-domain.com

# fire it up
docker compose up --build
```

## test cases

1. core stuff

   - wp-json api responses (they stay untouched)
   - admin area url rewrites (scripts, styles, images)
   - frontend url rewrites (but only wp-content/includes)

2. html elements

   - buttons with href/data-href
   - custom components (`<ppn-cta>` and friends)
   - wysiwyg content
   - meta boxes

3. forms & inputs

   - form submissions with www urls
   - input values/placeholders
   - meta box content submissions

## available routes

### frontend

- `/` - main frontend page
- `/page-with-buttons` - button playground
- `/page-with-components` - custom components demo

### admin

- `/wp-admin` - admin dashboard
- `/wp-admin/post.php` - post editor (GET/POST)
- `/wp-login.php` - login page

### api & assets

- `/wp-json/*` - rest api endpoints
- `/wp-content/*` - content assets
- `/wp-includes/*` - core assets

## quick test

```bash
bun test ./test.ts             # run all tests
bun test --watch ./test.ts     # live reload mode

# or curl some endpoints
curl wp.some-domain.com/wp-json/custom/v1
curl wp.some-domain.com/wp-admin/
curl wp.some-domain.com/page-with-components
```

## project bits

- `server.ts` - where the magic happens
- `test.ts` - where the magic breaks
- `nginx.conf` - where regexes go to die
- `docker-compose.yml` / `Dockerfile` - keeps the chaos contained (kinda)
- `get-results.sh` - generates markdown results for each route

sources:

- openresty replace-filter-nginx-module: https://github.com/openresty/replace-filter-nginx-module
- bun test runner: https://bun.sh/docs/cli/test
