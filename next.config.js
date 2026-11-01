const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias["@"] = path.resolve(__dirname, "src");
    return config;
  },
  async rewrites() {
    return [
      {
        // إعادة توجيه مسار المحافظة والتصنيف /[city]/[category] مع استثناء المسارات الخاصة
        source: "/:city((?!api|_next|b|admin|static|favicon\\.ico)[^/]+)/:category((?!api|_next|b|admin|static)[^/]+)",
        destination: "/:city/all/:category",
      },
    ];
  },
};

module.exports = nextConfig;
