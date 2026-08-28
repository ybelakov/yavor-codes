"use client";

import { motion, useReducedMotion } from "framer-motion";
import timeline from "@/content/timeline.json";
import { ChipRow } from "./shared";

export function HistoryBlock() {
  const reduced = useReducedMotion();
  return (
    <div className="block-frame">
      <h2 className="sr-only">Career timeline</h2>
      <motion.ul
        className="log-list history-list"
        initial={reduced ? false : "hidden"}
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.08 } } }}
      >
        {timeline.entries.map((e) => (
          <motion.li
            key={`${e.date}-${e.text}`}
            variants={{ hidden: { opacity: 0, x: -6 }, show: { opacity: 1, x: 0 } }}
            transition={{ duration: 0.12 }}
          >
            <span className="dim-text history-date">{e.date || "······"}</span>{" "}
            <span className={`history-verb history-verb-${e.type}`}>{e.verb}</span> {e.text}
          </motion.li>
        ))}
        <motion.li
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
          transition={{ duration: 0.12 }}
        >
          <span className="dim-text history-date">{"   now"}</span>{" "}
          <span className="history-verb history-verb-product">building</span>{" "}
          <span className="caret caret-focused caret-inline" aria-hidden="true" />
        </motion.li>
      </motion.ul>
      <ChipRow commands={["whoami", "juma", "neofetch"]} />
    </div>
  );
}
