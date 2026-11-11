// Mise en forme à la française des données de la base.

/** Noms de pays de Leaguepedia (anglais) → code ISO 3166-1. */
const COUNTRY_CODES: Record<string, string> = {
  Albania: 'AL', Algeria: 'DZ', Argentina: 'AR', Armenia: 'AM', Australia: 'AU', Austria: 'AT',
  Azerbaijan: 'AZ', Belarus: 'BY', Belgium: 'BE', 'Bosnia and Herzegovina': 'BA', Brazil: 'BR',
  Bulgaria: 'BG', Canada: 'CA', Chile: 'CL', China: 'CN', Colombia: 'CO', Croatia: 'HR',
  Cyprus: 'CY', Czechia: 'CZ', 'Czech Republic': 'CZ', Denmark: 'DK', Egypt: 'EG', England: 'GB',
  Estonia: 'EE', Finland: 'FI', France: 'FR', Georgia: 'GE', Germany: 'DE', Greece: 'GR',
  'Hong Kong': 'HK', Hungary: 'HU', Iceland: 'IS', India: 'IN', Indonesia: 'ID', Iran: 'IR',
  Ireland: 'IE', Israel: 'IL', Italy: 'IT', Japan: 'JP', Jordan: 'JO', Kazakhstan: 'KZ',
  Kosovo: 'XK', Kuwait: 'KW', Latvia: 'LV', Lebanon: 'LB', Lithuania: 'LT', Luxembourg: 'LU',
  Macau: 'MO', Malaysia: 'MY', Malta: 'MT', Mexico: 'MX', Moldova: 'MD', Mongolia: 'MN',
  Montenegro: 'ME', Morocco: 'MA', Netherlands: 'NL', 'New Zealand': 'NZ', 'North Macedonia': 'MK',
  Norway: 'NO', Pakistan: 'PK', Paraguay: 'PY', Peru: 'PE', Philippines: 'PH', Poland: 'PL',
  Portugal: 'PT', Qatar: 'QA', Romania: 'RO', Russia: 'RU', 'Saudi Arabia': 'SA', Scotland: 'GB',
  Serbia: 'RS', Singapore: 'SG', Slovakia: 'SK', Slovenia: 'SI', 'South Africa': 'ZA',
  'South Korea': 'KR', Korea: 'KR', Spain: 'ES', Sweden: 'SE', Switzerland: 'CH', Taiwan: 'TW',
  Thailand: 'TH', Tunisia: 'TN', Turkey: 'TR', Türkiye: 'TR', Ukraine: 'UA',
  'United Arab Emirates': 'AE', 'United Kingdom': 'GB', 'United States': 'US', Uruguay: 'UY',
  Venezuela: 'VE', Vietnam: 'VN', Wales: 'GB',
};

const REGIONS_FR = new Intl.DisplayNames(['fr'], { type: 'region' });

/** Nom du pays en français ; à défaut, le nom d'origine. */
export function countryFr(country: string | null): string | null {
  if (!country) return null;
  const code = COUNTRY_CODES[country];
  if (!code || code === 'XK') return country === 'Kosovo' ? 'Kosovo' : country;
  return REGIONS_FR.of(code) ?? country;
}

/** Âge en années pleines à une date (AAAA-MM-JJ). */
export function ageAt(birthdate: string | null, on: string): number | null {
  if (!birthdate || !/^\d{4}-\d{2}-\d{2}$/.test(birthdate)) return null;
  const [by, bm, bd] = birthdate.split('-').map(Number);
  const [y, m, d] = on.split('-').map(Number);
  return y - by - (m < bm || (m === bm && d < bd) ? 1 : 0);
}

const MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

/** « nov. 2027 » à partir de 2027-11-20. */
export function monthYear(date: string | null): string | null {
  if (!date || !/^\d{4}-\d{2}/.test(date)) return null;
  const [y, m] = date.split('-').map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}

const NUM1 = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const NUM0 = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });

export const fmt1 = (n: number) => NUM1.format(n);
export const fmt0 = (n: number) => NUM0.format(n);

/** KDA : (éliminations + assistances) / morts. */
export function kda(s: { kills: number; deaths: number; assists: number }): number {
  return (s.kills + s.assists) / Math.max(1, s.deaths);
}
