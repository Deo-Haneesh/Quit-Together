/** @type {import('next').NextConfig} */
const nextConfig = {
    // Transpile packages that need it
    transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],

    // Disable strict mode to avoid double renders in dev (optional, matches current behavior)
    reactStrictMode: true,

    // Enable experimental features if needed
    experimental: {
        // Enable optimized package imports
        optimizePackageImports: ['lucide-react', 'framer-motion'],
    },

    // Configure webpack for Three.js compatibility
    webpack: (config) => {
        config.externals = [...(config.externals || []), { canvas: 'canvas' }];
        return config;
    },
};

export default nextConfig;
