import type { NextConfig } from 'next';
import path from 'path';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig: NextConfig = {
  // Silence workspace root warning pour monorepo
  outputFileTracingRoot: path.join(__dirname, '../../'),

  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  // Désactiver ESLint pendant le build (les erreurs seront corrigées séparément)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Use standalone output to avoid pre-rendering issues
  output: 'standalone',


  // Aucune redirection globale ici (on laisse le middleware gérer).
  // Si tu as besoin de redirections spécifiques, ajoute-les en excluant
  // explicitement /creator/messages et /fan/messages.
  // redirects: async () => ([
  //   // Exemple :
  //   // { source: '/old', destination: '/new', permanent: false },
  // ]),
};

export default withNextIntl(nextConfig);
