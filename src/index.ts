import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
import { marked } from 'marked'
import { json } from 'utils/res'

// Start a Hono app
const app = new Hono()
app.use(secureHeaders())
app.use(
  cors({
    origin: (o) =>
      o.endsWith('localhost:8787') || o.endsWith('.documentation.toddle.site')
        ? o
        : undefined,
  }),
)

// https://toddle-docs-proxy/main/docs/getting-started/creating-a-project/index.md
app.get(`/:branch/:file{.+\\.(md|json|html)}`, async (ctx) => {
  const branch = ctx.req.param('branch')
  const file = ctx.req.param('file')
  const extension = file.split('.').pop() as 'md' | 'json' | 'html'
  const response = await fetch(
    `https://raw.githubusercontent.com/toddledev/documentation/refs/heads/${branch}/${file.slice(0, -extension.length - 1)}.md`,
  )
  if (!response.ok) {
    return json({ error: `Page not found` }, { status: 404 })
  }
  try {
    const text = await response.text()
    switch (extension) {
      case 'json':
        const jsonOutput = marked.lexer(text)
        return json(jsonOutput)
      case 'html':
        const htmlOutput = await marked.parse(text)
        return new Response(htmlOutput, {
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        })
      case 'md':
        return new Response(text, {
          headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
        })
    }
  } catch (e) {
    console.error(e)
    return json({ error: `Failed to fetch page` }, { status: 500 })
  }
})

// Export the Hono app
export default app
