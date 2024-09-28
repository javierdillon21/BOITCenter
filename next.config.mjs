/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@mui/x-charts"],
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/:path*',
  //       destination: 'http://10.191.204.61/proactivanet/api/:path*',
  //     },
  //   ]
  // },
  //   async headers() {
  //     return [
  //       {
  //         source: "/api/:path*",
  //         headers: [
  //           { key: "Access-Control-Allow-Credentials", value: "true" },
  //           { key: "Access-Control-Allow-Origin", value: "*" }, // replace this your actual origin
  //           {
  //             key: "Access-Control-Allow-Methods",
  //             value: "GET,DELETE,PATCH,POST,PUT",
  //           },
  //           {
  //             key: "Access-Control-Allow-Headers",
  //             value:
  //               "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
  //           },
  //         ],
  //       },
  //     ];
  //   },
};

export default nextConfig;
