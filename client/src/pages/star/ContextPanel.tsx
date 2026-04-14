import React, { useState } from "react";

import type { ContextPanelModel } from "./contextPanel";

function normalizePreviewText(value: string) {
  return value.trim().replace(/[.!?…]+$/, "").toLocaleLowerCase("ru-RU");
}

type ContextPanelProps = {
  model: ContextPanelModel;
  initialCollapsed?: boolean;
};

export function ContextPanel({ model, initialCollapsed = false }: ContextPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);
  const hasContent = Boolean(model.hint) || model.blocks.length > 0;

  return (
    <aside className="yasna-scroll flex min-h-0 flex-col overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.035] p-2.5 backdrop-blur-xl lg:h-full lg:max-h-full lg:self-stretch lg:overflow-y-auto lg:overscroll-contain">
      {hasContent ? (
        <div className="flex justify-end pb-1">
          <button
            type="button"
            onClick={() => setIsCollapsed((value) => !value)}
            aria-expanded={!isCollapsed}
            className="shrink-0 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[11px] font-medium text-white/78 transition hover:border-[#39d98a]/30 hover:bg-white/[0.08] hover:text-white"
          >
            {isCollapsed ? "Развернуть" : "Свернуть"}
          </button>
        </div>
      ) : null}

      {!isCollapsed && model.hint ? (
        <section className="mt-2.5 rounded-[20px] border border-white/8 bg-[linear-gradient(180deg,rgba(8,23,16,0.96),rgba(5,14,10,0.94))] px-3 py-3 text-white shadow-[0_10px_22px_rgba(0,0,0,0.14)]">
          <div className="text-[9px] uppercase tracking-[0.28em] text-[#8ab79f]">Навигация</div>
          <p className="mt-1.5 text-[12px] leading-[1.45] text-white/72">{model.hint}</p>
        </section>
      ) : null}

      {!isCollapsed && model.blocks.length > 0 ? (
        <div className={`${model.hint ? "mt-2.5 " : "mt-2.5 "}space-y-2.5 pb-1`}>
          {model.blocks.map((block) => {
            const shouldShowDescription =
              normalizePreviewText(block.description) !== normalizePreviewText(block.title);

            return (
              <section
                key={block.id}
                title={block.description}
                className="rounded-[18px] border border-[#39d98a]/16 bg-[linear-gradient(180deg,rgba(10,33,22,0.96),rgba(6,19,13,0.94))] px-3 py-3 text-white shadow-[0_10px_22px_rgba(0,0,0,0.14)]"
              >
                <div className="text-[9px] uppercase tracking-[0.28em] text-[#8ab79f]">{block.label}</div>
                <h3 className="mt-1.5 text-[14px] font-semibold leading-[1.14] text-white">{block.title}</h3>
                {shouldShowDescription ? (
                  <p className="mt-2 text-[12px] leading-[1.45] text-white/62">{block.description}</p>
                ) : null}
              </section>
            );
          })}
        </div>
      ) : null}
    </aside>
  );
}
