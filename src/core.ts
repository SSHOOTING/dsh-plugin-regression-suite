/**
 * Pure, dependency-free core for dsh-plugin-regression-suite (Task Regression Suite).
 * Reads only metadata from session events; never prompts, tool bodies or file contents.
 */

const SECRET_RE = /((?:token|key|secret|password|authorization|bearer)[^\s:=]{0,24}[:=]\s*)[^\s&]+/gi
const QUERY_RE = /([?&](?:token|key|secret|password|auth)=)[^&#\s]+/gi
/** Strip credential-looking substrings before anything is printed. */
export function redact(value: unknown): string {
  const text = value instanceof Error ? value.stack || value.message : String(value)
  return text.replace(SECRET_RE, '$1[redacted]').replace(QUERY_RE, '$1[redacted]')
}
export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export function analyze(events: readonly unknown[]): any {
  const list = Array.isArray(events) ? events : []
  const runs = new Map<any, any>()
  for (const e of list) {
    if (!isRecord(e) || !isRecord(e.data)) continue
    const version = typeof e.data.version === 'string' ? e.data.version
      : typeof e.data.model === 'string' ? e.data.model : 'default'
    const row = runs.get(version) || { version, calls: 0, tokens: 0, errors: 0 }
    row.calls++
    if (typeof e.data.tokens === 'number') row.tokens += e.data.tokens
    if (typeof e.type === 'string' && (e.type.includes('error') || e.type.includes('fail'))) row.errors++
    runs.set(version, row)
  }
  const versions = [...runs.values()].sort((a, b) => a.version.localeCompare(b.version))
  const cheapest = versions.length ? versions.reduce((m, r) => r.tokens < m.tokens ? r : m) : null
  return {
    sampledEvents: list.length,
    versions,
    total: versions.length,
    cheapest: cheapest ? cheapest.version : '(none)',
    savedInput: 'input + acceptance criteria stored locally for replay',
  }
}

export function formatReport(a: any, opts: { json?: boolean } = {}): string {
  if (opts.json) return JSON.stringify(a, null, 2)
  const head = '[regression] ' + a.total + ' version(s) compared · cheapest=' + redact(a.cheapest)
  if (a.versions.length === 0) return head + '\n  no version-tagged runs observed yet'
  const lines = a.versions.slice(0, 12).map(r =>
    '  ' + redact(r.version) + '  ' + r.calls + ' call(s)  ~' + r.tokens + ' tokens  ' + r.errors + ' error(s)')
  return [head, ...lines].join('\n') + '\nReplay the saved input across versions to compare quality.'
}
