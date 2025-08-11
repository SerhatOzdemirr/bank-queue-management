// tests/utils/random.ts
export function uniq(prefix = "u"): string {
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${t}_${r}`;
}

export function uniqueEmail(prefix = "user", domain = "mail.com"): string {
  return `${uniq(prefix)}@${domain}`;
}
