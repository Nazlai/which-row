import * as z from "zod";

export const schema = z
  .object({
    name: z.string().nonempty(),
  })
  .required();

export type Payload = z.infer<typeof schema>;
