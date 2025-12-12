#!/usr/bin/env node
/**
 * Import dev.to articles into Jekyll `_posts` with local images.
 * Requires Node 18+ (built-in fetch).
 */

const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

const DEVTO_USERNAME = process.env.DEVTO_USERNAME || "meatboy";
const POSTS_DIR = path.resolve(__dirname, "..", "_posts");
const IMAGES_DIR = path.resolve(__dirname, "..", "img", "posts");
const API_URL = `https://dev.to/api/articles?username=${DEVTO_USERNAME}&per_page=1000`;
const USER_AGENT = "devto-importer/1.0";

async function ensureDir(dir) {
  await fsp.mkdir(dir, { recursive: true });
}

function escapeYaml(value = "") {
  return String(value).replace(/"/g, '\\"');
}

function normalizeTags(tagList) {
  if (!tagList) return [];
  if (Array.isArray(tagList)) return tagList.map((t) => t.trim()).filter(Boolean);
  return String(tagList)
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

function buildFrontmatter({ title, subtitle, author, date, tags, background }) {
  const lines = [
    "---",
    'layout: post',
    `title: "${escapeYaml(title)}"`,
  ];
  if (subtitle) lines.push(`subtitle: "${escapeYaml(subtitle)}"`);
  if (author) lines.push(`author: "${escapeYaml(author)}"`);
  if (date) lines.push(`date: ${new Date(date).toISOString()}`);
  if (tags?.length) lines.push(`tags: [${tags.map((t) => `"${escapeYaml(t)}"`).join(", ")}]`);
  if (background) lines.push(`background: '${background}'`);
  lines.push("---", "");
  return lines.join("\n");
}

function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function filenameForArticle(article) {
  const date = new Date(article.published_at || article.created_at);
  const datePrefix = [
    date.getUTCFullYear(),
    `${date.getUTCMonth() + 1}`.padStart(2, "0"),
    `${date.getUTCDate()}`.padStart(2, "0"),
  ].join("-");
  const slug = slugify(article.slug || article.title);
  return `${datePrefix}-${slug}.md`;
}

function getExtensionFromUrl(url) {
  try {
    const { pathname } = new URL(url);
    const base = pathname.split("/").pop() || "";
    const ext = path.extname(base).split("?")[0];
    if (ext) return ext;
  } catch {
    // ignore
  }
  return ".jpg";
}

async function downloadImage(url, destBaseName) {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    const ext = getExtensionFromUrl(url);
    const filename = `${destBaseName}${ext}`;
    const destPath = path.join(IMAGES_DIR, filename);
    await ensureDir(IMAGES_DIR);
    await fsp.writeFile(destPath, buffer);
    return `/img/posts/${filename}`;
  } catch (err) {
    console.warn(`Failed to download ${url}: ${err.message}`);
    return null;
  }
}

async function rewriteImages(markdown, slugBase) {
  const imagePattern = /!\[[^\]]*]\((https?:[^)]+)\)/g;
  let match;
  let index = 1;
  const replacements = [];

  while ((match = imagePattern.exec(markdown)) !== null) {
    const [full, url] = match;
    const hash = crypto.createHash("md5").update(url).digest("hex").slice(0, 6);
    const destBase = `${slugBase}-${index}-${hash}`;
    const localPath = await downloadImage(url, destBase);
    if (localPath) {
      replacements.push({ original: full, replacement: full.replace(url, localPath) });
    }
    index += 1;
  }

  let updated = markdown;
  for (const { original, replacement } of replacements) {
    updated = updated.replace(original, replacement);
  }
  return updated;
}

async function processArticle(article) {
  const fileName = filenameForArticle(article);
  const destPath = path.join(POSTS_DIR, fileName);

  if (fs.existsSync(destPath)) {
    console.log(`Skipping existing post ${fileName}`);
    return;
  }

  const slugBase = slugify(article.slug || article.title);
  const coverPath = await downloadImage(article.cover_image, `${slugBase}-cover`);
  const tags = normalizeTags(article.tag_list || article.tags);

  const body = await rewriteImages(article.body_markdown || "", slugBase);
  const frontmatter = buildFrontmatter({
    title: article.title,
    subtitle: article.description,
    author: article.user?.name || "meatboy",
    date: article.published_at || article.created_at,
    tags,
    background: coverPath || undefined,
  });

  const content = `${frontmatter}${body.trim()}\n`;
  await fsp.writeFile(destPath, content, "utf8");
  console.log(`Saved ${destPath}`);
}

async function fetchArticleDetail(id) {
  const res = await fetch(`https://dev.to/api/articles/${id}`, {
    headers: {
      Accept: "application/json",
      "User-Agent": USER_AGENT,
    },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch article ${id}: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

async function fetchArticles() {
  const res = await fetch(API_URL, {
    headers: {
      Accept: "application/json",
      "User-Agent": USER_AGENT,
    },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch articles: ${res.status} ${res.statusText}`);
  }
  const list = await res.json();
  const detailed = [];
  for (const meta of list) {
    try {
      const full = await fetchArticleDetail(meta.id);
      detailed.push(full);
    } catch (err) {
      console.warn(`Failed to enrich article ${meta.id}: ${err.message}`);
      detailed.push(meta);
    }
  }
  return detailed;
}

async function main() {
  await ensureDir(POSTS_DIR);
  await ensureDir(IMAGES_DIR);
  const articles = await fetchArticles();
  console.log(`Fetched ${articles.length} articles for ${DEVTO_USERNAME}`);
  for (const article of articles) {
    await processArticle(article);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

