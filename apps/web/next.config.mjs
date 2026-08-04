/** @type {import("next").NextConfig} */
const nextConfig = {
  output: "standalone",
  transpilePackages: [
    "@narau/ui",
    "@narau/validation",
    "@narau/analytics",
    "@narau/database",
    "@narau/email",
  ],
  serverExternalPackages: ["@prisma/client", "nodemailer"],
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
