import React from "react";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";

function NotFound() {
  return (
    <Layout title="Page Not Found" description="The page you are looking for could not be found.">
      <main className="container margin-vert--xl">
        <div className="row">
          <div className="col col--6 col--offset-3">
            <h1 className="hero__title">Page Not Found</h1>
            <p>
              The page you are looking for does not exist. It may have been moved or removed.
            </p>
            <div>
              <Link className="button button--primary button--lg margin-right--md" to="/">
                Go to Homepage
              </Link>
              <Link className="button button--secondary button--lg" to="/docs/get-started/">
                Browse Documentation
              </Link>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}

export default NotFound;
