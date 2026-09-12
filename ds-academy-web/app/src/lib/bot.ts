import 'server-only';

/**
 * Heuristic bot/crawler detection for the analytics ping (PRD §8's Analytics
 * dashboard) — not a security gate, just keeps the visit counter honest.
 * Covers search crawlers, SEO tools, social-share unfurlers, uptime
 * monitors, headless browsers and common scripting HTTP clients.
 */
const BOT_UA = /bot|spider|crawl|slurp|facebookexternalhit|whatsapp|telegrambot|discordbot|preview|monitor|pingdom|uptime|statuscake|site24x7|headless|phantomjs|selenium|puppeteer|playwright|curl|wget|python-requests|python-urllib|scrapy|go-http-client|okhttp|libwww|node-fetch|axios\/|postmanruntime/i;

export function isBotRequest(userAgent: string | null): boolean {
  if (!userAgent || !userAgent.trim()) return true; // real browsers always send one
  return BOT_UA.test(userAgent);
}
