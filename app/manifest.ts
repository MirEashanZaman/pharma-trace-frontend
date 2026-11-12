import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'PharmaTrace Enterprise Provenance Suite',
    short_name: 'PharmaTrace',
    description: 'Enterprise pharmaceutical supply chain traceability, tamper-evident GS1 digital twins, and cold-chain compliance',
    start_url: '/',
    display: 'standalone',
    background_color: '#0B1220',
    theme_color: '#0B1220',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}

