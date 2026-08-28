"use client";

import { Component, type ComponentType, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { HistoryEntry } from "@/lib/terminal/types";
import { HelpBlock } from "@/components/blocks/HelpBlock";
import { WhoamiBlock } from "@/components/blocks/WhoamiBlock";
import { JumaBlock } from "@/components/blocks/JumaBlock";
import { AiefBlock } from "@/components/blocks/AiefBlock";
import { SfBlock } from "@/components/blocks/SfBlock";
import { PostsBlock } from "@/components/blocks/PostsBlock";
import { HistoryBlock } from "@/components/blocks/HistoryBlock";
import { NeofetchBlock } from "@/components/blocks/NeofetchBlock";
import { ContactBlock } from "@/components/blocks/ContactBlock";
import { ThemeListBlock, ThemeSetBlock } from "@/components/blocks/ThemeBlock";
import { EggBlock, LsBlock, MatrixBlock, NotFoundBlock, TextBlock } from "@/components/blocks/SmallBlocks";
import { BootLineRow, BootLogo } from "@/components/blocks/BootBlocks";

/* eslint-disable @typescript-eslint/no-explicit-any */
const BLOCKS: Record<string, ComponentType<any>> = {
  help: HelpBlock,
  whoami: WhoamiBlock,
  juma: JumaBlock,
  aief: AiefBlock,
  sf: SfBlock,
  posts: PostsBlock,
  history: HistoryBlock,
  neofetch: NeofetchBlock,
  contact: ContactBlock,
  "theme-list": ThemeListBlock,
  "theme-set": ThemeSetBlock,
  egg: EggBlock,
  ls: LsBlock,
  matrix: MatrixBlock,
  "not-found": NotFoundBlock,
  text: TextBlock,
  "boot-line": BootLineRow,
  "boot-logo": BootLogo,
};
/* eslint-enable @typescript-eslint/no-explicit-any */

class BlockBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  override state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  override render() {
    if (this.state.failed) return <p className="text-error">block crashed. the terminal survives.</p>;
    return this.props.children;
  }
}

export function OutputBlock({ entry }: { entry: HistoryEntry }) {
  const reduced = useReducedMotion();
  const BlockComponent = entry.block ? BLOCKS[entry.block.type] : null;
  const isBoot = entry.block?.type.startsWith("boot-");
  const animate = !entry.instant && !reduced;

  return (
    <motion.div
      className="output-entry"
      initial={animate ? { opacity: 0, y: 6 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
    >
      {entry.input !== null && !isBoot && (
        <p className="echo-line">
          <span className="prompt-glyph" aria-hidden="true">
            ❯
          </span>{" "}
          {entry.input}
        </p>
      )}
      {BlockComponent && entry.block && (
        <BlockBoundary>
          <article className="block-article">
            <BlockComponent {...(entry.block.props ?? {})} />
          </article>
        </BlockBoundary>
      )}
    </motion.div>
  );
}
