/**
 * Diverse trending pipeline: Polymarket (prediction markets), NewsAPI, RSS.
 * LLM agents use this to post about hot/trending topics from a wide range of sources.
 */

import Parser from "rss-parser";
import { NEWS_API_KEY } from "../config.js";

const parser = new Parser({
  timeout: 10000,
  headers: { "User-Agent": "Consensus-Agent-Server/1.0" },
});

const POLYMARKET_EVENTS_URL = "https://gamma-api.polymarket.com/events?closed=false&limit=25";

/** RSS feeds (no API key). Mix of crypto and general tech. */
const RSS_FEEDS = [
  "https://www.coindesk.com/arc/outboundfeeds/rss/",
  "https://cointelegraph.com/rss",
  "https://decrypt.co/feed",
  "https://www.theblock.co/rss.xml",
  "https://feeds.feedburner.com/CoinDesk",
];

/**
 * Fetch one article from NewsAPI (requires free API key from https://newsapi.org).
 * @returns {Promise<{ title: string, source: string, url: string } | null>}
 */
async function fetchFromNewsAPI() {
  if (!NEWS_API_KEY) return null;
  try {
    const url = new URL("https://newsapi.org/v2/top-headlines");
    url.searchParams.set("apiKey", NEWS_API_KEY);
    url.searchParams.set("category", "technology");
    url.searchParams.set("pageSize", "10");
    url.searchParams.set("language", "en");

    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const data = await res.json();
    const articles = data?.articles?.filter((a) => a?.title && a?.title !== "[Removed]");
    if (!articles?.length) return null;

    const a = articles[Math.floor(Math.random() * articles.length)];
    return { title: a.title, source: a.source?.name || "News", url: a.url || "" };
  } catch {
    return null;
  }
}

/**
 * Fetch one trending event from Polymarket (prediction markets). No API key.
 * Diverse topics: crypto, politics, macro, etc.
 * @returns {Promise<{ title: string, source: string, url: string } | null>}
 */
async function fetchFromPolymarket() {
  try {
    const res = await fetch(POLYMARKET_EVENTS_URL, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const events = await res.json();
    const valid = Array.isArray(events) ? events.filter((e) => e?.title?.trim()) : [];
    if (!valid.length) return null;

    const e = valid[Math.floor(Math.random() * valid.length)];
    const url = e.slug
      ? `https://polymarket.com/event/${e.slug}`
      : "https://polymarket.com";
    return {
      title: e.title?.trim() || "",
      source: "Polymarket",
      url,
    };
  } catch {
    return null;
  }
}

/**
 * Fetch one item from a random RSS feed.
 * @returns {Promise<{ title: string, source: string, url: string } | null>}
 */
async function fetchFromRss() {
  const feedUrl = RSS_FEEDS[Math.floor(Math.random() * RSS_FEEDS.length)];
  try {
    const feed = await parser.parseURL(feedUrl);
    const items = feed?.items?.filter((i) => i?.title?.trim());
    if (!items?.length) return null;

    const item = items[Math.floor(Math.random() * items.length)];
    return {
      title: item.title?.trim() || "",
      source: feed.title || new URL(feedUrl).hostname,
      url: item.link || item.guid || "",
    };
  } catch {
    return null;
  }
}

/**
 * Get one trending/news item from a diverse set of sources (Polymarket, NewsAPI, RSS).
 * Used by LLM agents to post about hot topics. Never throws.
 * @returns {Promise<{ title: string, source: string, url: string } | null>}
 */
export async function fetchLatestNewsItem() {
  const sources = [
    () => fetchFromPolymarket(),
    () => fetchFromNewsAPI(),
    () => fetchFromRss(),
  ];
  // Randomize order so agents don't always prefer one source
  for (let i = sources.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [sources[i], sources[j]] = [sources[j], sources[i]];
  }
  for (const fn of sources) {
    const item = await fn();
    if (item?.title) return item;
  }
  return null;
}
