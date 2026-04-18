import { useFormContext } from "react-hook-form";

import { cn } from "../../utils/cn";

import type { TextFieldProps } from "./types";

export function TextField(props: TextFieldProps) {
  const methods = useFormContext();

  return (
    <input
      type="text"
      className={cn(
        "border border-zinc-100 rounded p-2 outline-emerald-300",
        props.className
      )}
      {...methods.register(props.name)}
      autoComplete="off"
    />
  );
}
