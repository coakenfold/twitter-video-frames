import { Form } from "@remix-run/react";
import type { PropsWithChildren } from "react";
export interface MiniFormInput {
  isSubmitting?: boolean;
  inputs?: { name: string; value: string }[];
  action?: string;
  method?: "get" | "post";
  keyPrefix?: string;
}
export const MiniForm = (MiniFormInput: PropsWithChildren<MiniFormInput>) => {
  const {
    isSubmitting = false,
    children,
    inputs,
    action,
    method = "get",
    keyPrefix,
  } = MiniFormInput;
  return (
    <Form action={action} method={method}>
      <fieldset disabled={isSubmitting}>
        {inputs
          ? inputs.map(({ name, value }) => {
              return (
                <input
                  type="hidden"
                  name={name}
                  value={value}
                  key={`${keyPrefix ? keyPrefix : "MiniForm"}-${name}`}
                />
              );
            })
          : null}
        {children}
      </fieldset>
    </Form>
  );
};
