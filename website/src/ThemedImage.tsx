import type { ComponentPropsWithoutRef } from "react";
import { useDarkTheme } from "./useTheme";

type Props = ComponentPropsWithoutRef<"img"> & { darkSrc: string };

export function ThemedImage({ src, darkSrc, ...props }: Props) {
  return <img {...props} src={useDarkTheme() ? darkSrc : src} />;
}

export function ProjectLogo(props: Omit<ComponentPropsWithoutRef<"img">, "src" | "alt">) {
  return <ThemedImage {...props} src="./static/wasserman-logo.png" darkSrc="./static/wasserman-logo-dark.svg" alt="" />;
}
