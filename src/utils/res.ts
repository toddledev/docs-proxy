export const json = <B = any>(
  body: B,
  config?: { status?: number; headers?: Record<string, string> },
) => {
  return new Response(JSON.stringify(body), {
    status: config?.status ?? 200,
    headers: {
      ...(config?.headers ?? {}),
      'content-type': 'application/json',
    },
  })
}
