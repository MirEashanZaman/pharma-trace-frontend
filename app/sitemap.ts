import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://pharmatrace.enterprise';
  const routes = [
    '',
    '/catalog',
    '/dashboard',
    '/dispense',
    '/escrow',
    '/governance',
    '/ledger',
    '/login',
    '/profile',
    '/provenance',
    '/staking',
    '/standards',
    '/standards/fda-21-cfr-part-11',
    '/standards/eu-gmp-annex-11',
    '/standards/who-trs-961',
    '/standards/dscta-us-title-ii',
    '/verify',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }));
}

