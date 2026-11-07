// React: `useTool({ name, description, input, run })` registers the tool while the component is
// mounted. `run` always sees the latest props and state; the tool re-registers only when its name,
// description or input change.
import { useEffect, useRef } from "react";
import { tool } from "./tool.js";

export function useTool(definition) {
  const latest = useRef(definition);
  latest.current = definition;
  const { name, description, input } = definition;
  const shape = JSON.stringify(input ?? {});
  useEffect(
    () => tool({ ...latest.current, run: (args, client) => latest.current.run(args, client) }).dispose,
    [name, description, shape],
  );
}
