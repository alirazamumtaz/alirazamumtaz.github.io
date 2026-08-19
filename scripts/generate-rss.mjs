#!/usr/bin/env node
/**
 * generate-rss.mjs — build-time RSS 2.0 feed for locus-x64.
 *
 * Reads public/posts/index.json + the markdown files in public/posts/ and
 * emits a valid RSS 2.0 feed to public/rss.xml.
 *   channel title: locus-x64 — security research notes
 *   channel link:  https://locus-x64.github.io/
 *   item title/date/link/description from post metadata + excerpt; pubDate
 *   is the post date, falling back to the markdown file's mtime.
 *
 * Wired into package.json: runs automatically via `prebuild`, and can be
 * run manually with `npm run rss`.
 */

import { readFile, writeFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const POSTS_DIR = path.join(ROOT, 'public', 'posts')
const OUT_FILE = path.join(ROOT, 'public', 'rss.xml')

const SITE_URL = 'https://locus-x64.github.io'
const CHANNEL_TITLE = 'locus-x64 · security research notes'
const CHANNEL_DESCRIPTION =
  'Vulnerability research, exploit development and reverse engineering notes by Ali Raza (locus-x64).'

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/** Minimal markdown strip for excerpt fallback (first paragraph, plain text). */
function markdownExcerpt(markdown) {
  const body = markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '')
  const first = body
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.trim())
    .find((p) => p && !p.startsWith('#') && !p.startsWith('```') && !p.startsWith('!['))
  if (!first) return ''
  return first
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_~>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 280)
}

async function main() {
  const indexRaw = await readFile(path.join(POSTS_DIR, 'index.json'), 'utf8')
  const posts = JSON.parse(indexRaw)
  if (!Array.isArray(posts)) throw new Error('posts index is not an array')

  const items = []
  for (const post of posts) {
    const slug = String(post.slug ?? '').trim()
    if (!slug) continue
    const mdPath = path.join(POSTS_DIR, `${slug}.md`)

    let markdown = ''
    let mtime = null
    try {
      const [md, st] = await Promise.all([readFile(mdPath, 'utf8'), stat(mdPath)])
      markdown = md
      mtime = st.mtime
    } catch {
      console.warn(`warn: markdown for slug "${slug}" not readable, using index metadata only`)
    }

    // pubDate: post date (UTC midnight) preferred, markdown mtime as fallback
    let pubDate
    if (post.date && !Number.isNaN(Date.parse(post.date))) {
      pubDate = new Date(`${String(post.date).slice(0, 10)}T00:00:00Z`)
    } else if (mtime) {
      pubDate = mtime
    } else {
      pubDate = new Date()
    }

    const title = String(post.title ?? slug).trim()
    const description =
      String(post.excerpt ?? '').trim() || markdownExcerpt(markdown) || title
    const link = `${SITE_URL}/blog/${slug}`
    const tags = Array.isArray(post.tags) ? post.tags.map(String) : []

    items.push({
      title,
      link,
      description,
      pubDate,
      tags,
      dateKey: pubDate.toISOString(),
    })
  }

  items.sort((a, b) => (a.dateKey < b.dateKey ? 1 : -1))

  const itemXml = items
    .map((item) => {
      const categories = item.tags
        .map((tag) => `      <category>${escapeXml(tag)}</category>\n`)
        .join('')
      return (
        `    <item>\n` +
        `      <title>${escapeXml(item.title)}</title>\n` +
        `      <link>${escapeXml(item.link)}</link>\n` +
        `      <guid isPermaLink="true">${escapeXml(item.link)}</guid>\n` +
        `      <pubDate>${item.pubDate.toUTCString()}</pubDate>\n` +
        `      <description>${escapeXml(item.description)}</description>\n` +
        categories +
        `    </item>`
      )
    })
    .join('\n')

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n` +
    `  <channel>\n` +
    `    <title>${escapeXml(CHANNEL_TITLE)}</title>\n` +
    `    <link>${escapeXml(`${SITE_URL}/`)}</link>\n` +
    `    <atom:link href="${escapeXml(`${SITE_URL}/rss.xml`)}" rel="self" type="application/rss+xml"/>\n` +
    `    <description>${escapeXml(CHANNEL_DESCRIPTION)}</description>\n` +
    `    <language>en-us</language>\n` +
    `    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>\n` +
    `    <generator>locus-x64 generate-rss.mjs</generator>\n` +
    `${itemXml}\n` +
    `  </channel>\n` +
    `</rss>\n`

  await writeFile(OUT_FILE, xml, 'utf8')
  console.log(`rss: wrote ${path.relative(ROOT, OUT_FILE)} — ${items.length} item(s)`)
}

main().catch((err) => {
  console.error(`rss: failed — ${err instanceof Error ? err.message : err}`)
  process.exitCode = 1
})
