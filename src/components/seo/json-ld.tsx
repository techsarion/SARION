/**
 * Renders a JSON-LD structured-data block. Centralised so every page injects
 * schema the same way (and we never hand-write a <script> tag again).
 *
 * `id` lets multiple JSON-LD blocks coexist on a page without React key
 * warnings and keeps them individually addressable for debugging.
 */
export function JsonLd({
  id,
  data,
}: {
  id?: string;
  data: Record<string, unknown> | Record<string, unknown>[];
}) {
  return (
    <script
      type="application/ld+json"
      id={id}
      // Structured data is server-rendered from trusted, static input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
