import * as React from "react";
import { withPrefix } from "gatsby";
import useSiteMetadata from "@utils/useSiteMetadata";
import useSiteSettings from "@utils/useSiteSettings";

export const HtmlAttributes = {
  lang: "en"
};

/*
  TODO: implement title using Gatsby Head API
  <title>{`${summit.name} - ${title}`}</title>
*/
export const Head = () => {
  const {
    title,
    description
  } = useSiteMetadata();
  const { favicons } = useSiteSettings();
  return (
    <>
      <title>{`${title}`}</title>
      <meta key="meta-description" name="description" content={description} />
      <meta key="meta-theme-color" name="theme-color" content="#fff" />
      <meta key="meta-og-type" property="og:type" content="business.business" />
      <meta key="meta-og-title" property="og:title" content={title} />
      <meta key="meta-og-url" property="og:url" content="/" />
      {favicons?.favicon180 &&
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href={`${withPrefix('/')}${favicons.favicon180.substring(1)}`}
      />
      }
      {favicons?.favicon32 &&
      <link
        rel="icon"
        sizes="32x32"
        href={`${withPrefix('/')}${favicons.favicon32.substring(1)}`}
      />
      }
      {favicons?.favicon16 &&
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href={`${withPrefix('/')}${favicons.favicon16.substring(1)}`}
      />
      }
      <link
        key="font-awesome"
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" integrity="sha512-SfTiTlX6kk+qitfevl/7LibUOeJWlt9rbyDn92a1DqWOw9vWG2MFoays0sgObmWazO5BQPiFucnnEAjpAB+/Sw=="
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
      />
      <link
        key="awesome-bootstrap-checkbox"
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/awesome-bootstrap-checkbox/1.0.2/awesome-bootstrap-checkbox.min.css" integrity="sha512-zAQ4eQ+PGbYf6BknDx0m2NhTcOnHWpMdJCFaPvcv5BpMTR5edqr/ZRuluUcNave6IEpRCoT67/3hVVmm5ODpqA=="
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
      />
      <link key="fonts" rel="stylesheet" type="text/css" href={withPrefix("/fonts/fonts.css")} />
    </>
  );
};

export const HeadComponents = [
  <Head key="head" />
];

export const PreBodyComponents = [
  <link
    key="bootstrap"
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/bootstrap@3.3.7/dist/css/bootstrap.min.css"
    integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u"
    crossOrigin="anonymous"
  />
];