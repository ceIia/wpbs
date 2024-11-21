import { serve } from "bun";

serve({
  async fetch(req) {
    const url = new URL(req.url);

    // serve wp assets
    if (
      url.pathname.startsWith("/wp-content") ||
      url.pathname.startsWith("/wp-includes")
    ) {
      return new Response(`serving asset at ${url.pathname}`, {
        headers: { "Content-Type": "text/plain" },
      });
    }

    // handle wp-json api
    if (url.pathname.startsWith("/wp-json/")) {
      const jsonResponse = JSON.stringify({
        message: `response from ${url.pathname}`,
        data: {
          attribute: "value",
          url: `https://www.some-domain.com${url.pathname}`,
        },
      });
      return new Response(jsonResponse, {
        headers: { "Content-Type": "application/json" },
      });
    }

    // handle page with buttons
    if (url.pathname === "/page-with-buttons") {
      return new Response(
        `<html>
          <body>
            <button href="https://www.some-domain.com/action">Click me</button>
            <button data-href="https://www.some-domain.com/data">Data action</button>
          </body>
        </html>`,
        {
          headers: { "Content-Type": "text/html" },
        }
      );
    }

    // handle page with custom components
    if (url.pathname === "/page-with-components") {
      return new Response(
        `<html>
          <body>
            <ppn-cta
              call-text="Click here to visit www.some-domain.com"
              cta-color="error"
              cta-radius="square"
              cta-position="right"
              call-href="https://www.some-domain.com/action"
            ></ppn-cta>
          </body>
        </html>`,
        {
          headers: { "Content-Type": "text/html" },
        }
      );
    }

    // handle page editor
    if (
      url.pathname === "/wp-admin/post.php" &&
      url.searchParams.has("action")
    ) {
      return new Response(
        `<html>
          <body>
            <div id="editor">
              <div class="wp-block-group">
                <div content="https://www.some-domain.com/page-content">
                  <ppn-cta 
                    call-href="https://www.some-domain.com/action"
                    call-text="Visit our site"
                  ></ppn-cta>
                </div>
              </div>
            </div>
          </body>
        </html>`,
        {
          headers: { "Content-Type": "text/html" },
        }
      );
    }

    // handle admin form submission (update to handle meta box content)
    if (url.pathname === "/wp-admin/post.php" && req.method === "POST") {
      const formData = await req.formData();
      const response: any = {
        redirect_to: formData.get("redirect_to"),
        site_url: formData.get("site_url"),
      };

      // Handle meta box content if present
      const metaContent = formData.get("meta_content") as string;
      if (metaContent) {
        response.meta_content = JSON.parse(metaContent);
      }

      return new Response(JSON.stringify(response), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // serve admin area
    if (
      url.pathname.startsWith("/wp-admin") ||
      url.pathname === "/wp-login.php"
    ) {
      return new Response(
        `<html>
          <head>
            <title>wp-admin</title>
            <meta property="og:image" content="https://www.some-domain.com/wp-content/meta.png" />
            <link rel="stylesheet" href="https://www.some-domain.com/wp-includes/css/admin.css">
            <script src="https://www.some-domain.com/wp-includes/js/admin.js"></script>
            <style>
              body {
                background: url("https://www.some-domain.com/wp-includes/css/image.png");
              }
            </style>
          </head>
          <body>
            <a href="https://www.some-domain.com/wp-admin/">admin dashboard</a>
            <img src="https://www.some-domain.com/wp-content/uploads/logo.png" />
            <script src="https://www.some-domain.com/wp-includes/js/admin-footer.js"></script>
            <form>
              <input type="text" 
                placeholder="https://www.some-domain.com/example"
                value="https://www.some-domain.com/page"
                defaultValue="https://www.some-domain.com/default"
              />
            </form>
          </body>
        </html>`,
        {
          headers: { "Content-Type": "text/html" },
        }
      );
    }

    // serve frontend
    return new Response(
      `<html>
        <head>
          <title>frontend</title>
          <link rel="canonical" href="https://www.some-domain.com/page" />
          <meta property="og:url" content="https://www.some-domain.com/page" />
          <meta name="twitter:domain" content="www.some-domain.com" />
          <link rel="alternate" href="https://www.some-domain.com/fr/page" hreflang="fr-FR" />
          <link rel="home" href="https://www.some-domain.com" />
          <meta property="og:image" content="https://www.some-domain.com/wp-content/uploads/image.jpg" />
          <link rel="stylesheet" href="https://www.some-domain.com/wp-includes/css/style.css" />
          <script src="https://www.some-domain.com/wp-includes/js/script.js"></script>
          <style>
            body {
              background: url("https://www.some-domain.com/wp-includes/css/background.png");
            }
          </style>
        </head>
        <body>
          <img src="https://www.some-domain.com/wp-content/uploads/image.jpg" />
          <script src="https://www.some-domain.com/wp-includes/js/footer.js"></script>
          <a href="https://www.some-domain.com/about">about</a>
          <a href="https://www.some-domain.com" class="brand">home</a>
          <form action="https://www.some-domain.com/submit">
            <input type="hidden" name="return_url" value="https://www.some-domain.com/thank-you" />
          </form>
        </body>
      </html>`,
      {
        headers: { "Content-Type": "text/html" },
      }
    );
  },
  port: 8080,
});
