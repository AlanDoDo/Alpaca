/** Limit actual streamed bytes, including requests without Content-Length. */
export async function readJsonObject(request: Request, maxBytes: number): Promise<Record<string, unknown>> {
  if (Number(request.headers.get("content-length")) > maxBytes) throw new RequestBodyError(413);
  const reader = request.body?.getReader();
  if (!reader) throw new RequestBodyError(400);
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        throw new RequestBodyError(413);
      }
      chunks.push(value);
    }
    const parsed: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new RequestBodyError(400);
    return parsed as Record<string, unknown>;
  } catch (error) {
    if (error instanceof RequestBodyError) throw error;
    throw new RequestBodyError(400);
  } finally {
    reader.releaseLock();
  }
}

export class RequestBodyError extends Error {
  constructor(public readonly status: 400 | 413) { super("Invalid request body"); }
}
