/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Allow all HTTPS domains
      {
        protocol: "https",
        hostname: "**",
      },
      // Allow all HTTP domains (for development)
      {
        protocol: "http",
        hostname: "**",
      },
    ],
    dangerouslyAllowSVG: true,
    unoptimized: false,
  },
};

export default nextConfig;
