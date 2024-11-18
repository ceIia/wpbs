import { describe, it, expect } from "bun:test";
import { fetch } from "bun";

const FRONTEND_URL = "http://wp.some-domain.com";
const ADMIN_URL = "http://wp.some-domain.com/wp-admin/";

describe("nginx config tests", () => {
  it("should serve front-end with correct asset URLs", async () => {
    const response = await fetch(`${FRONTEND_URL}/`);
    const html = await response.text();

    // check canonical link not replaced
    expect(html).toContain(
      '<link rel="canonical" href="https://www.some-domain.com/'
    );
    // check script src rewritten
    expect(html).toContain(
      '<script src="https://wp.some-domain.com/wp-includes/js/script.js"></script>'
    );
    // check image src rewritten
    expect(html).toContain(
      '<img src="https://wp.some-domain.com/wp-content/uploads/image.jpg" />'
    );
    // check anchor href not rewritten
    expect(html).toContain(
      '<a href="https://www.some-domain.com/about">about us</a>'
    );
  });

  it("should serve admin area with correct asset URLs", async () => {
    const response = await fetch(`${ADMIN_URL}`);
    const html = await response.text();

    // check stylesheet link rewritten
    expect(html).toContain(
      '<link rel="stylesheet" href="https://wp.some-domain.com/wp-includes/css/admin.css">'
    );
    // check anchor href rewritten
    expect(html).toContain(
      '<a href="https://wp.some-domain.com/wp-admin/">admin dashboard</a>'
    );
    // check image src rewritten
    expect(html).toContain(
      '<img src="https://wp.some-domain.com/wp-content/uploads/logo.png" />'
    );
  });

  it("should not rewrite meta tags in front-end", async () => {
    const response = await fetch(`${FRONTEND_URL}/`);
    const html = await response.text();

    // check meta tags not rewritten
    expect(html).toContain(
      '<link rel="canonical" href="https://www.some-domain.com/'
    );
  });

  it("should not modify /wp-json/ API responses", async () => {
    const response = await fetch(`${FRONTEND_URL}/wp-json/custom/v1`);
    const json = await response.json();

    // verify json response
    expect(response.headers.get("Content-Type")).toContain("application/json");

    // check response data unchanged
    expect(json).toEqual({
      message: "response from /wp-json/custom/v1",
      data: {
        attribute: "value",
        url: `https://wp.some-domain.com/wp-json/custom/v1`,
      },
    });
  });
});