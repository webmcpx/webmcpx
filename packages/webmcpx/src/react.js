// React 16.8+ (and Preact via preact/compat): `useTool({ name, description, input, run })` registers the tool while the component is
// mounted. `run` always sees the latest props and state; the tool re-registers when what the agent
// sees changes: name, description, input or annotations.
import { useEffect, useRef } from "react";
import { tool } from "./tool.js";

export function useTool(definition) {
  const latest = useRef(definition);
  latest.current = definition;
  const { name, description, input, inputSchema, readOnly, acts, untrusted, signal } = definition;
  // What the agent sees (and is told about safety) re-registers the tool; `run` is always the latest.
  const shape = JSON.stringify([input ?? {}, inputSchema ?? null]);
  useEffect(
    () => tool({ ...latest.current, run: (args, client) => latest.current.run(args, client) }).dispose,
    [name, description, shape, Boolean(readOnly), Boolean(acts), Boolean(untrusted), signal],
  );
}
