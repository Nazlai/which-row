import type { UploadFieldProps } from "./types";

export function UploadField(props: UploadFieldProps) {
  const { children, ...restProps } = props;

  return (
    <>
      <input
        {...restProps}
        id={props.id}
        type="file"
        onChange={props.onChange}
        className="hidden"
      />
      <label htmlFor={props.id}>{children}</label>
    </>
  );
}
