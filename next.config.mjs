/* eslint-disable */
/** @type {import("next").NextConfig} */

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        // headers required for @nillion/client-wasm's wasm artefact
        headers: [
          {key: "Cross-Origin-Embedder-Policy", value: "require-corp"},
          {key: "Cross-Origin-Opener-Policy", value: "same-origin"},
        ],
      },
    ]
  },
}

export default nextConfig
