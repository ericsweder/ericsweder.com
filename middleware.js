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
  const country = request.geo?.country ?? '';

  // Handmatige taalkeuze altijd respecteren
  const langPref = request.cookies.get('lang-pref')?.value;
  if (langPref === 'nl') return;                    // gebruiker koos NL
  if (langPref === 'en') {
    url.pathname = '/en.html';
    return Response.redirect(url, 302);             // gebruiker koos EN
  }

  // Automatische detectie: NL en BE krijgen Nederlands
  const dutchCountries = ['NL', 'BE'];
  if (country && !dutchCountries.includes(country)) {
    url.pathname = '/en.html';
    return Response.redirect(url, 302);
  }

  // NL / BE / onbekend → Dutch (standaard, geen redirect nodig)
}
