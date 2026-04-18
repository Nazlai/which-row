import type { PropsWithChildren } from "react";

import type { className } from "../../types/className";
import { cn } from "../../utils/cn";

export function Card(props: PropsWithChildren<className>) {
  return (
    <section
      className={cn(
        "bg-neutral-800 mx-6 mt-10 p-6 rounded md:w-2/3 md:mx-auto",
        props.className
      )}
    >
      {props.children}
    </section>
  );
}
