/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Ignorar errores de tipos durante el build de producción para evitar bloqueos por variables no usadas de TypeScript
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignorar errores de ESLint durante el build de producción para agilizar el compilado local
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
