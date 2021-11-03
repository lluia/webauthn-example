const withTM = require("next-transpile-modules")(["@simplewebauthn/browser"]); // pass the modules you would like to see transpiled

/** @type {import('next').NextConfig} */
module.exports = withTM({
  reactStrictMode: true,
});
