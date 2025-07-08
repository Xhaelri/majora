import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  webpack(config) {
    // Find the default rule that handles SVGs
    const fileLoaderRule = config.module.rules.find(
      (rule) => rule.test instanceof RegExp && rule.test.test(".svg")
    );

    if (fileLoaderRule) {
      // Exclude SVGs from the default rule
      fileLoaderRule.exclude = /\.svg$/i;
    }
    
    // Add a new rule for SVGs to be handled by @svgr/webpack
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
};

export default nextConfig;