import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental:{
    // Allow admins to upload product pictures through server actions
    serverActions:{ bodySizeLimit: "25mb" },
  },
  images:{
    remotePatterns:[
      {protocol:"https",hostname:"cdn.sanity.io"}
    ]
  }
};

export default nextConfig;
