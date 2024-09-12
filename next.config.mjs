/** @type {import('next').NextConfig} */
const nextConfig = {
  api: {
    bodyParser: false,
  },
  env: {
    BAIDU_AK: process.env.BAIDU_AK,
    BAIDU_SK: process.env.BAIDU_SK,
  },
};

export default nextConfig;
