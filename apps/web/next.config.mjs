/** @type {import("next").NextConfig} */
const nextConfig = {
  output: "standalone",
  transpilePackages: [
    "@dailycurio/ui",
    "@dailycurio/validation",
    "@dailycurio/analytics",
    "@dailycurio/database",
    "@dailycurio/email",
  ],
  serverExternalPackages: ["@prisma/client", "nodemailer"],
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
