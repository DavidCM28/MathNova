import type { ReactNode } from "react";

export function QuestionCard({
  number,
  text,
  options,
  answerClass,
  onSelect,
}: {
  number: string;
  text: ReactNode;
  options: [string, string][];
  answerClass: (value: string) => string;
  onSelect: (value: string) => void;
}) {
  return (
    <article className="mnx-question-card">
      <span className="mnx-number-badge">{number}</span>
      <div className="mnx-question-copy">{text}</div>

      <div className="mnx-choices">
        {options.map(([value, label]) => (
          <button key={value} className={answerClass(value)} type="button" onClick={() => onSelect(value)}>
            {label}
          </button>
        ))}
      </div>
    </article>
  );
}
