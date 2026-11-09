// Matriz de acessibilidade do protótipo da sala ao vivo.
// 14 estados x 2 variantes x 3 viewports x N navegadores, com axe-core (WCAG 2 A/AA, 2.1 AA, 2.2 AA).
// Uso: node axe-matriz.mjs [--engines=chromium,firefox] [--out=relatorio.json]
// Sai com código 1 se houver violação, página que não carrega ou erro de console.
import { createRequire } from 'node:module'
import { writeFileSync, readFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'
import http from 'node:http'
import { SCENARIOS, buildPrototypeUrl } from './prototype.js'

const require = createRequire(import.meta.url)
const { chromium, firefox } = require('playwright-core')
const axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8')
const axeVersion = require('axe-core/package.json').version
const pwVersion = require('playwright-core/package.json').version

const arg = (name, fallback) =>
  (process.argv.find((a) => a.startsWith(`--${name}=`)) ?? '').split('=')[1] ?? fallback
const engines = arg('engines', 'chromium,firefox').split(',')
const outFile = arg('out', 'axe-relatorio.json')
const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 1024, height: 768 },
  { name: 'mobile', width: 390, height: 844 },
]
const VARIANTS = ['stage', 'focus']
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

const dir = path.dirname(fileURLToPath(import.meta.url))
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png' }
const server = http.createServer((req, res) => {
  const file = path.join(dir, req.url.split('?')[0] === '/' ? 'index.html' : req.url.split('?')[0])
  try {
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] ?? 'application/octet-stream' })
    res.end(readFileSync(file))
  } catch {
    res.writeHead(404).end()
  }
})
await new Promise((r) => server.listen(0, '127.0.0.1', r))
const base = `http://127.0.0.1:${server.address().port}/index.html`

const results = []
for (const engineName of engines) {
  const browser = await { chromium, firefox }[engineName].launch()
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } })
    for (const variant of VARIANTS) {
      for (const [state, scenario] of Object.entries(SCENARIOS)) {
        const page = await context.newPage()
        const errors = []
        page.on('pageerror', (e) => errors.push(String(e)))
        page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
        const external = []
        page.on('request', (r) => !r.url().startsWith(`http://127.0.0.1:${server.address().port}`) && !r.url().startsWith('data:') && external.push(r.url()))
        const role = scenario.roles[0]
        const url = buildPrototypeUrl(base, { variant, role, state, panel: null })
        let loaded = true
        let violations = []
        try {
          await page.goto(url, { waitUntil: 'load' })
          await page.addScriptTag({ content: axeSource })
          const r = await page.evaluate((tags) => axe.run(document, { runOnly: { type: 'tag', values: tags } }), TAGS)
          violations = r.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length }))
        } catch (e) {
          loaded = false
          errors.push(String(e))
        }
        results.push({ engine: engineName, viewport: vp.name, variant, state, role, loaded, violations, errors, external })
        await page.close()
      }
    }
    await context.close()
  }
  await browser.close()
}
server.close()

const total = results.length
const summary = {
  geradoEm: new Date().toISOString(),
  commit: process.env.GITHUB_SHA ?? null,
  axe: axeVersion,
  playwrightCore: pwVersion,
  tags: TAGS,
  engines,
  paginas: total,
  carregadas: results.filter((r) => r.loaded).length,
  paginasComViolacao: results.filter((r) => r.violations.length).length,
  violacoes: results.reduce((n, r) => n + r.violations.length, 0),
  paginasComErroDeConsole: results.filter((r) => r.errors.length).length,
  paginasComRequestExterno: results.filter((r) => r.external.length).length,
}
writeFileSync(outFile, JSON.stringify({ summary, results }, null, 2))
console.log(JSON.stringify(summary, null, 2))
process.exit(summary.carregadas === total && !summary.violacoes && !summary.paginasComErroDeConsole && !summary.paginasComRequestExterno ? 0 : 1)
