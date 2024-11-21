import { describe, it, expect, beforeEach } from "bun:test";
import { fetch } from "bun";

const FRONTEND_URL = "http://wp.some-domain.com";
const ADMIN_URL = "http://wp.some-domain.com/wp-admin";

function normalizeHtml(html: string): string {
  return html
    .replace(/\s+/g, " ") // Replace multiple spaces/newlines with single space
    .replace(/>\s+</g, "><") // Remove whitespace between tags
    .trim(); // Remove leading/trailing whitespace
}

function containsHtml(container: string, snippet: string): boolean {
  return normalizeHtml(container).includes(normalizeHtml(snippet));
}

describe("wordpress proxy", () => {
  // Test API endpoints (should not be modified)
  it("should not modify wp-json responses", async () => {
    const res = await fetch(`${FRONTEND_URL}/wp-json/custom/v1`);
    const data = await res.json();
    expect(data.data.url).toBe("https://www.some-domain.com/wp-json/custom/v1");
  });

  // Test admin area URL replacements
  describe("admin area", () => {
    let html: string;

    beforeEach(async () => {
      const res = await fetch(ADMIN_URL);
      html = await res.text();
    });

    it("should replace urls in <script> tags", () => {
      expect(html).toContain(
        '<script src="https://wp.some-domain.com/wp-includes/js/admin.js">'
      );
      expect(html).toContain(
        '<script src="https://wp.some-domain.com/wp-includes/js/admin-footer.js">'
      );
    });

    it("should replace urls in <link> tags", () => {
      expect(html).toContain(
        '<link rel="stylesheet" href="https://wp.some-domain.com/wp-includes/css/admin.css">'
      );
    });

    it("should replace urls in <img> tags", () => {
      expect(html).toContain(
        '<img src="https://wp.some-domain.com/wp-content/uploads/logo.png"'
      );
    });

    it("should replace urls in css url() functions", () => {
      expect(html).toContain(
        'url("https://wp.some-domain.com/wp-includes/css/image.png")'
      );
    });

    it("should replace urls in admin navigation links", () => {
      expect(html).toContain('<a href="https://wp.some-domain.com/wp-admin/">');
    });

    it("should replace wp-content urls in meta tags", () => {
      expect(html).toContain(
        '<meta property="og:image" content="https://wp.some-domain.com/wp-content/meta.png"'
      );
    });
  });

  // Test frontend URL replacements
  describe("frontend", () => {
    let html: string;

    beforeEach(async () => {
      const res = await fetch(FRONTEND_URL);
      html = await res.text();
    });

    it("should replace urls in <script> tags", () => {
      expect(html).toContain(
        '<script src="https://wp.some-domain.com/wp-includes/js/script.js">'
      );
      expect(html).toContain(
        '<script src="https://wp.some-domain.com/wp-includes/js/footer.js">'
      );
    });

    it("should replace urls in <link> tags", () => {
      expect(html).toContain(
        '<link rel="stylesheet" href="https://wp.some-domain.com/wp-includes/css/style.css"'
      );
    });

    it("should replace urls in <img> tags", () => {
      expect(html).toContain(
        '<img src="https://wp.some-domain.com/wp-content/uploads/image.jpg"'
      );
    });

    it("should replace urls in css url() functions", () => {
      expect(html).toContain(
        'url("https://wp.some-domain.com/wp-includes/css/background.png")'
      );
    });

    it("should replace urls in meta tags with wp-content/wp-includes", () => {
      expect(html).toContain(
        '<meta property="og:image" content="https://wp.some-domain.com/wp-content/uploads/image.jpg"'
      );
    });
  });

  describe("frontend - urls that should not be replaced", () => {
    let html: string;

    beforeEach(async () => {
      const res = await fetch(FRONTEND_URL);
      html = await res.text();
    });

    it("should not replace canonical urls", () => {
      expect(html).toContain(
        '<link rel="canonical" href="https://www.some-domain.com/page"'
      );
    });

    it("should not replace seo meta tags", () => {
      expect(html).toContain(
        '<meta property="og:url" content="https://www.some-domain.com/page"'
      );
      expect(html).toContain(
        '<meta name="twitter:domain" content="www.some-domain.com"'
      );
    });

    it("should not replace alternate language urls", () => {
      expect(html).toContain(
        '<link rel="alternate" href="https://www.some-domain.com/fr/page"'
      );
    });

    it("should not replace home link", () => {
      expect(html).toContain(
        '<link rel="home" href="https://www.some-domain.com"'
      );
    });

    it("should not replace regular navigation links", () => {
      expect(html).toContain('<a href="https://www.some-domain.com/about">');
      expect(html).toContain(
        '<a href="https://www.some-domain.com" class="brand">'
      );
    });

    it("should not replace form urls", () => {
      expect(html).toContain(
        '<form action="https://www.some-domain.com/submit">'
      );
      expect(html).toContain('value="https://www.some-domain.com/thank-you"');
    });
  });
});

describe("URL handling in HTML elements", () => {
  it("should preserve www URLs in button elements", async () => {
    const response = await fetch(`${FRONTEND_URL}/page-with-buttons`);
    const html = await response.text();

    expect(html).toContain(
      '<button href="https://www.some-domain.com/action">'
    );
    expect(html).toContain(
      '<button data-href="https://www.some-domain.com/data">'
    );
  });

  it("should preserve www URLs in custom web components", async () => {
    const response = await fetch(`${FRONTEND_URL}/page-with-components`);
    const html = await response.text();

    expect(
      containsHtml(
        html,
        `<ppn-cta
          call-text="Click here to visit www.some-domain.com"
          cta-color="error"
          cta-radius="square"
          cta-position="right"
          call-href="https://www.some-domain.com/action"
        ></ppn-cta>`
      )
    ).toBe(true);
  });
});

describe("URL handling in WYSIWYG contexts", () => {
  it("should preserve www URLs when loading page editor content", async () => {
    const response = await fetch(`${ADMIN_URL}/post.php?post=123&action=edit`);
    const html = await response.text();

    expect(
      containsHtml(
        html,
        '<div content="https://www.some-domain.com/page-content">'
      )
    ).toBe(true);

    expect(
      containsHtml(
        html,
        '<ppn-cta call-href="https://www.some-domain.com/action"'
      )
    ).toBe(true);
  });

  it("should preserve www URLs when saving meta box content", async () => {
    const formData = new FormData();
    formData.append(
      "meta_content",
      JSON.stringify({
        cta: {
          href: "https://www.some-domain.com/meta-action",
          text: "Visit www.some-domain.com",
        },
      })
    );

    const response = await fetch(`${ADMIN_URL}/post.php`, {
      method: "POST",
      body: formData,
    });

    const responseData = await response.json();
    expect(responseData.meta_content.cta.href).toBe(
      "https://www.some-domain.com/meta-action"
    );
  });
});

describe("Form submissions and input handling", () => {
  it("should preserve www urls in form submissions", async () => {
    const formData = new FormData();
    formData.append("redirect_to", "https://www.some-domain.com/dashboard");
    formData.append("site_url", "https://www.some-domain.com");

    const response = await fetch(`${ADMIN_URL}/post.php`, {
      method: "POST",
      body: formData,
    });

    const responseData = await response.json();

    expect(responseData.redirect_to).toBe(
      "https://www.some-domain.com/dashboard"
    );
    expect(responseData.site_url).toBe("https://www.some-domain.com");
  });

  it("should not rewrite input values and placeholders in admin", async () => {
    const response = await fetch(`${ADMIN_URL}`);
    const html = await response.text();

    expect(html).toContain('placeholder="https://www.some-domain.com/example"');
    expect(html).toContain('value="https://www.some-domain.com/page"');
    expect(html).toContain(
      'defaultValue="https://www.some-domain.com/default"'
    );
  });
});

describe("WP JSON API handling", () => {
  it("should not modify /wp-json/ API responses", async () => {
    const response = await fetch(`${FRONTEND_URL}/wp-json/custom/v1`);
    const json = await response.json();

    expect(response.headers.get("Content-Type")).toContain("application/json");

    expect(json).toEqual({
      message: "response from /wp-json/custom/v1",
      data: {
        attribute: "value",
        url: `https://www.some-domain.com/wp-json/custom/v1`,
      },
    });
  });
});
