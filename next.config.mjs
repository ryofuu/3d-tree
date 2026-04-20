/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // three.js 系のライブラリは ESM を含むのでトランスパイル対象に含めておく
  transpilePackages: [
    "three",
    "@react-three/fiber",
    "@react-three/drei",
    "@react-three/postprocessing",
  ],
};

export default nextConfig;
