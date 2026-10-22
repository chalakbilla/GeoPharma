import React from "react";

// A deliberately tiny markdown renderer for chat replies:
// paragraphs, #headings, - bullets, 1. numbered lists, **bold**, *italic*, `code`.
function renderInline(text, keyPrefix) {
  const parts = [];
  const re = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|`[^`]+`)/g;
  let last = 0;
  let match;
  let i = 0;
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    const token = match[0];
    const key = `${keyPrefix}-${i++}`;
    if (token.startsWith("**")) parts.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    else if (token.startsWith("`")) {
      parts.push(
        <code key={key} className="rounded bg-black/5 px-1 py-0.5 text-[0.9em]">
          {token.slice(1, -1)}
        </code>
      );
    } else parts.push(<em key={key}>{token.slice(1, -1)}</em>);
    last = match.index + token.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export default function Markdown({ text }) {
  const lines = String(text || "").replace(/\r/g, "").split("\n");
  const blocks = [];
  let list = null;

  const flushList = () => {
    if (list) {
      blocks.push(list);
      list = null;
    }
  };

  lines.forEach((raw) => {
    const line = raw.trimEnd();
    const bullet = line.match(/^\s*[-*•]\s+(.*)$/);
    const numbered = line.match(/^\s*\d+[.)]\s+(.*)$/);
    const heading = line.match(/^#{1,4}\s+(.*)$/);

    if (bullet || numbered) {
      const type = bullet ? "ul" : "ol";
      if (!list || list.type !== type) {
        flushList();
        list = { type, items: [] };
      }
      list.items.push((bullet || numbered)[1]);
      return;
    }
    flushList();
    if (heading) blocks.push({ type: "h", text: heading[1] });
    else if (line.trim()) blocks.push({ type: "p", text: line });
  });
  flushList();

  return (
    <div className="space-y-2 leading-relaxed">
      {blocks.map((b, bi) => {
        if (b.type === "h") {
          return (
            <p key={bi} className="font-semibold">
              {renderInline(b.text, `h${bi}`)}
            </p>
          );
        }
        if (b.type === "ul" || b.type === "ol") {
          const Tag = b.type;
          return (
            <Tag key={bi} className={`space-y-1 pl-5 ${b.type === "ul" ? "list-disc" : "list-decimal"}`}>
              {b.items.map((it, ii) => (
                <li key={ii}>{renderInline(it, `l${bi}-${ii}`)}</li>
              ))}
            </Tag>
          );
        }
        return <p key={bi}>{renderInline(b.text, `p${bi}`)}</p>;
      })}
    </div>
  );
}
