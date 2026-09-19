/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["msedge-tts", "ws", "tesseract.js"],
  },
};

export default nextConfig;
