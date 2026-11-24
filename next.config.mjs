/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
  experimental: {
    // Photos are shrunk in the browser before upload, so 4 MB is plenty
    // and stays under Vercel's 4.5 MB request limit.
    serverActions: { bodySizeLimit: "4mb" },
  },
};
export default nextConfig;
