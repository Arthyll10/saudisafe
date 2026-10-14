export const publishers = new Map([
  ['bbc.com', 'BBC News'], ['bbc.co.uk', 'BBC News'], ['reuters.com', 'Reuters'],
  ['apnews.com', 'Associated Press'], ['aljazeera.com', 'Al Jazeera'],
  ['aljazeera.net', 'Al Jazeera Arabic'], ['arabnews.com', 'Arab News'],
  ['spa.gov.sa', 'Saudi Press Agency'],
  ['aawsat.com', 'Asharq Al-Awsat Arabic'], ['english.aawsat.com', 'Asharq Al-Awsat'],
  ['albiladdaily.com', 'Al Bilad'], ['middleeasteye.net', 'Middle East Eye'],
  ['saudigazette.com.sa', 'Saudi Gazette'], ['theguardian.com', 'The Guardian'], ['thenationalnews.com', 'The National']
]);
export const feeds = [
  { name: 'BBC Middle East', publisherHosts: ['bbc.com', 'bbc.co.uk'], url: 'https://feeds.bbci.co.uk/news/world/middle_east/rss.xml' },
  { name: 'Al Jazeera English', publisherHosts: ['aljazeera.com'], url: 'https://www.aljazeera.com/xml/rss/all.xml' },
  { name: 'Al Jazeera Arabic', publisherHosts: ['aljazeera.net'], url: 'https://www.aljazeera.net/aljazeerarss/a7c186be-1baa-4bd4-9d80-a84db769f779/73d0e1b4-532f-45ef-b135-bfdff8b8cab9' },
  { name: 'Arab News', publisherHosts: ['arabnews.com'], url: 'https://www.arabnews.com/rss.xml' },
  { name: 'Asharq Al-Awsat English', publisherHosts: ['english.aawsat.com'], url: 'https://english.aawsat.com/feed' },
  { name: 'Asharq Al-Awsat Gulf', publisherHosts: ['aawsat.com'], url: 'https://aawsat.com/feed/gulf' },
  { name: 'Al Bilad', publisherHosts: ['albiladdaily.com'], url: 'https://albiladdaily.com/feed/' },
  { name: 'Middle East Eye', publisherHosts: ['middleeasteye.net'], url: 'https://www.middleeasteye.net/rss' },
  // The www host redirects, and redirects are rejected, so the bare host is used.
  { name: 'Saudi Gazette', publisherHosts: ['saudigazette.com.sa'], url: 'https://saudigazette.com.sa/rssFeed/74' },
  { name: 'The Guardian', publisherHosts: ['theguardian.com'], url: 'https://www.theguardian.com/world/saudiarabia/rss' },
  { name: 'The National', publisherHosts: ['thenationalnews.com'], url: 'https://www.thenationalnews.com/arc/outboundfeeds/rss/?outputType=xml' }
];
export function publisherFor(host) { return publishers.get(host.replace(/^www\./, '')); }
export function articleURL(value) {
  try {
    const u = new URL(value);
    if (u.protocol !== 'https:' || u.username || u.password || u.port || !publisherFor(u.hostname) || u.href.length > 1800) return null;
    u.hostname = u.hostname.replace(/^www\./, ''); u.hash = '';
    for (const key of [...u.searchParams.keys()]) if (/^(utm_|fbclid$|gclid$|ocid$|traffic_source$|at_)/i.test(key)) u.searchParams.delete(key);
    u.searchParams.sort(); u.pathname = u.pathname.replace(/\/$/, '') || '/';
    return u.href;
  } catch { return null; }
}

export function belongsToFeed(value, feed) {
  const url = articleURL(value);
  return !!url && feed.publisherHosts.includes(new URL(url).hostname);
}
