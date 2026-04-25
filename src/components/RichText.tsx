import type { ReactNode } from "react";

interface RichTextProps {
  text: string;
  className?: string;
}

export function renderRichText(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <mark
          key={`${part}-${index}`}
          className="rounded-md bg-[#FF8C00]/18 px-1 py-0.5 font-bold text-[#FF8C00]"
        >
          {part.slice(2, -2)}
        </mark>
      );
    }

    return <span key={`${part}-${index}`}>{part}</span>;
  });
}

export default function RichText({ text, className }: RichTextProps) {
  return <span className={className}>{renderRichText(text)}</span>;
}
