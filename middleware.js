/**
 * Vercel Edge Middleware — taalrouting op basis van land
 *
 * NL en BE → index.html (Nederlands)
 * Alle andere landen → en.html (Engels)
 *
 * Handmatige taalkeuze via de taalwisselaar wordt onthouden
 * in een cookie (lang-pref) zodat de bezoeker niet telkens
 * wordt teruggestuurd.
 */

export const config = {
  matcher: ['/', '/index.html'],
};

export default function middleware(request) {
  const url = new URL(request.url);

  // Vercel injecteert het land als header (geen Next.js nodig)
  const country = request.headers.get('x-vercel-ip-country') || '';

  // Cookie handmatig uitlezen uit de cookie-header
  const cookieStr = request.headers.get('cookie') || '';
  const langMatch = cookieStr.match(/(?:^|;\s*)lang-pref=([^;]+)/);
  const langPref = langMatch ? langMatch[1] : null;

  // Handmatige taalkeuze altijd respecteren
  if (langPref === 'nl') return;           // gebruiker koos NL → blijf op Dutch
  if (langPref === 'en') {
    url.pathname = '/en.html';
    return Response.redirect(url, 302);    // gebruiker koos EN
  }

  // Automatische detectie: NL en BE → Nederlands, rest → Engels
  const dutchCountries = ['NL', 'BE'];
  if (country && !dutchCountries.includes(country)) {
    url.pathname = '/en.html';
    return Response.redirect(url, 302);
  }

  // NL / BE / onbekend → standaard Dutch pagina serveren
}
