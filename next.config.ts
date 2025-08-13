import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
  // Make sure environment variables are available at build time
  serverExternalPackages: ["@prisma/client"],
  typescript: {
    // Skip type checking only in production
    ignoreBuildErrors: process.env.NODE_ENV === "production",
  },
  eslint: {
    // Skip ESLint only in production
    ignoreDuringBuilds: process.env.NODE_ENV === "production",
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
};
const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
