import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    config.module = {
      ...config.module,
      rules: [
        ...(config.module?.rules || []),
        {
          test: /\.m?js/,
          resolve: {
            fullySpecified: false
          }
        },
        {
          test: /html2pdf\.js$/,
          type: 'javascript/auto'
        }
      ]
    };
    return config;
  },
  transpilePackages: ["react-speech-recognition", "regenerator-runtime", "html2pdf.js"],
};

export default nextConfig;
