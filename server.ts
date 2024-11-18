import { serve } from "bun";

serve({
  fetch(req) {
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
          url: `https://wp.some-domain.com${url.pathname}`,
        },
      });
      return new Response(jsonResponse, {
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
          <link rel="stylesheet" href="https://www.some-domain.com/wp-includes/css/admin.css">
        </head>
        <body>
          <a href="https://www.some-domain.com/wp-admin/">admin dashboard</a>
          <img src="https://www.some-domain.com/wp-content/uploads/logo.png" />
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
        <title>wp-frontend</title>
        <link rel="stylesheet" href="https://www.some-domain.com/wp-content/themes/style.css">
        <link rel="canonical" href="https://www.some-domain.com${url.pathname}" />
      </head>
      <body>
        <script src="https://www.some-domain.com/wp-includes/js/script.js"></script>
        <img src="https://www.some-domain.com/wp-content/uploads/image.jpg" />
        <a href="https://www.some-domain.com/about">about us</a>
      </body>
    </html>`,
      {
        headers: { "Content-Type": "text/html" },
      }
    );
  },
  port: 8080,
});