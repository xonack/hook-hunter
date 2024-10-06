/** @type {import('next').NextConfig} */
const nextConfig = {
    content: [
        './node_modules/pliny/**/*.js',
        './pages/**/*.{html,js}',
        './components/**/*.{html,js}',
      ],
};

export default nextConfig;
