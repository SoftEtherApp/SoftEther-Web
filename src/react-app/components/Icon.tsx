/* ════════════════════════════════════
   SVG Icon component — Lucide + brand icons
   ════════════════════════════════════ */

import type { JSX } from "react";

interface IconNode {
  type: "path" | "circle" | "rect";
  props: Record<string, string | number | boolean>;
}

interface IconDef {
  children: IconNode[];
  viewBox?: string;
}

const ICONS: Record<string, IconDef> = {
  layers: { children: [
    { type: "path", props: { d: "M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z" } },
    { type: "path", props: { d: "M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12" } },
    { type: "path", props: { d: "M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17" } },
  ] },
  zap: { children: [
    { type: "path", props: { d: "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" } },
  ] },
  monitor: { children: [
    { type: "rect", props: { width: 20, height: 14, x: 2, y: 3, rx: 2 } },
    { type: "path", props: { d: "M8 21h8m-4-4v4" } },
  ] },
  server: { children: [
    { type: "rect", props: { width: 20, height: 8, x: 2, y: 2, rx: 2, ry: 2 } },
    { type: "rect", props: { width: 20, height: 8, x: 2, y: 14, rx: 2, ry: 2 } },
    { type: "path", props: { d: "M6 6h.01M6 18h.01" } },
  ] },
  code: { children: [
    { type: "path", props: { d: "m16 18 6-6-6-6M8 6l-6 6 6 6" } },
  ] },
  palette: { children: [
    { type: "path", props: { d: "M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z" } },
    { type: "circle", props: { cx: 13.5, cy: 6.5, r: 0.5, fill: "currentColor" } },
    { type: "circle", props: { cx: 17.5, cy: 10.5, r: 0.5, fill: "currentColor" } },
    { type: "circle", props: { cx: 6.5, cy: 12.5, r: 0.5, fill: "currentColor" } },
    { type: "circle", props: { cx: 8.5, cy: 7.5, r: 0.5, fill: "currentColor" } },
  ] },
  cpu: { children: [
    { type: "path", props: { d: "M12 20v2m0-20v2m5 16v2m0-20v2M2 12h2m-2 5h2M2 7h2m16 5h2m-2 5h2M20 7h2M7 20v2M7 2v2" } },
    { type: "rect", props: { width: 16, height: 16, x: 4, y: 4, rx: 2 } },
    { type: "rect", props: { width: 8, height: 8, x: 8, y: 8, rx: 1 } },
  ] },
  smartphone: { children: [
    { type: "rect", props: { width: 14, height: 20, x: 5, y: 2, rx: 2, ry: 2 } },
    { type: "path", props: { d: "M12 18h.01" } },
  ] },
  tablet: { children: [
    { type: "rect", props: { width: 16, height: 20, x: 4, y: 2, rx: 2, ry: 2 } },
    { type: "path", props: { d: "M12 18h.01" } },
  ] },
  terminal: { children: [
    { type: "path", props: { d: "M12 19h8M4 17l6-6-6-6" } },
  ] },
  "external-link": { children: [
    { type: "path", props: { d: "M15 3h6v6m-11 5L21 3m-3 10v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" } },
  ] },
  menu: { children: [
    { type: "path", props: { d: "M4 5h16M4 12h16M4 19h16" } },
  ] },
  "x-circle": { children: [
    { type: "circle", props: { cx: 12, cy: 12, r: 10 } },
    { type: "path", props: { d: "m15 9-6 6m0-6 6 6" } },
  ] },
  github: { children: [
    { type: "path", props: { d: "M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65S8.93 17.38 9 18v4" } },
    { type: "path", props: { d: "M9 18c-4.51 2-5-2-7-2" } },
  ] },
  book: { children: [
    { type: "path", props: { d: "M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" } },
  ] },
  sun: { children: [
    { type: "circle", props: { cx: 12, cy: 12, r: 4 } },
    { type: "path", props: { d: "M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" } },
  ] },
  moon: { children: [
    { type: "path", props: { d: "M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" } },
  ] },
  "arrow-left": { children: [
    { type: "path", props: { d: "m12 19-7-7 7-7m7 7H5" } },
  ] },
  tag: { children: [
    { type: "path", props: { d: "M12 2H2v10l9.29 9.29a2 2 0 0 0 2.83 0l6.17-6.17a2 2 0 0 0 0-2.83z" } },
    { type: "circle", props: { cx: 7, cy: 7, r: 1, fill: "currentColor" } },
  ] },
  "chevron-right": { children: [
    { type: "path", props: { d: "m9 18 6-6-6-6" } },
  ] },
  "share-2": { children: [
    { type: "circle", props: { cx: 18, cy: 5, r: 3 } },
    { type: "circle", props: { cx: 6, cy: 12, r: 3 } },
    { type: "circle", props: { cx: 18, cy: 19, r: 3 } },
    { type: "path", props: { d: "m8.59 13.51 6.83 3.98m-.01-10.98-6.82 3.98" } },
  ] },
  /* ── Brand logos (fill-based) ── */
  "logo-android": { children: [
    { type: "path", props: { fill: "currentColor", d: "M18.44 5.559q-1.015 1.748-2.028 3.498q-.055-.023-.111-.043a12.1 12.1 0 0 0-8.68.033C7.537 8.897 5.868 6.026 5.6 5.56a1 1 0 0 0-.141-.19a1.104 1.104 0 0 0-1.768 1.298c1.947 3.37-.096-.216 1.948 3.36c.017.03-.495.263-1.393 1.017C2.9 12.176.452 14.772 0 18.99h24a11.7 11.7 0 0 0-.746-3.068a12.1 12.1 0 0 0-2.74-4.184a12 12 0 0 0-2.131-1.687c.66-1.122 1.312-2.256 1.965-3.385a1.11 1.11 0 0 0-.008-1.12a1.1 1.1 0 0 0-.852-.532c-.522-.054-.939.313-1.049.545m-.04 8.46c.395.593.324 1.331-.156 1.65c-.48.32-1.188.1-1.582-.493s-.324-1.33.156-1.65c.473-.316 1.182-.11 1.582.494m-11.193-.492c.48.32.55 1.058.156 1.65c-.394.593-1.103.815-1.584.495c-.48-.32-.55-1.058-.156-1.65c.4-.603 1.109-.811 1.584-.495" } },
  ] },
  "logo-apple": { viewBox: "0 0 512 512", children: [
    { type: "path", props: { fill: "currentColor", d: "M349.13 136.86c-40.32 0-57.36 19.24-85.44 19.24c-28.79 0-50.75-19.1-85.69-19.1c-34.2 0-70.67 20.88-93.83 56.45c-32.52 50.16-27 144.63 25.67 225.11c18.84 28.81 44 61.12 77 61.47h.6c28.68 0 37.2-18.78 76.67-19h.6c38.88 0 46.68 18.89 75.24 18.89h.6c33-.35 59.51-36.15 78.35-64.85c13.56-20.64 18.6-31 29-54.35c-76.19-28.92-88.43-136.93-13.08-178.34c-23-28.8-55.32-45.48-85.79-45.48Z" } },
    { type: "path", props: { fill: "currentColor", d: "M340.25 32c-24 1.63-52 16.91-68.4 36.86c-14.88 18.08-27.12 44.9-22.32 70.91h1.92c25.56 0 51.72-15.39 67-35.11c14.72-18.77 25.88-45.37 21.8-72.66" } },
  ] },
  "logo-windows": { children: [
    { type: "path", props: { fill: "currentColor", d: "M3 12V6.75l6-1.32v6.48zm17-9v8.75l-10 .15V5.21zM3 13l6 .09v6.81l-6-1.15zm17 .25V22l-10-1.91V13.1z" } },
  ] },
  "logo-linux": { children: [
    { type: "path", props: { fill: "currentColor", d: "M12.504 0q-.232 0-.48.021c-4.226.333-3.105 4.807-3.17 6.298c-.076 1.092-.3 1.953-1.05 3.02c-.885 1.051-2.127 2.75-2.716 4.521c-.278.832-.41 1.684-.287 2.489a.4.4 0 0 0-.11.135c-.26.268-.45.6-.663.839c-.199.199-.485.267-.797.4c-.313.136-.658.269-.864.68c-.09.189-.136.394-.132.602c0 .199.027.4.055.536c.058.399.116.728.04.97c-.249.68-.28 1.145-.106 1.484c.174.334.535.47.94.601c.81.2 1.91.135 2.774.6c.926.466 1.866.67 2.616.47c.526-.116.97-.464 1.208-.946c.587-.003 1.23-.269 2.26-.334c.699-.058 1.574.267 2.577.2c.025.134.063.198.114.333l.003.003c.391.778 1.113 1.132 1.884 1.071s1.592-.536 2.257-1.306c.631-.765 1.683-1.084 2.378-1.503c.348-.199.629-.469.649-.853c.023-.4-.2-.811-.714-1.376v-.097l-.003-.003c-.17-.2-.25-.535-.338-.926c-.085-.401-.182-.786-.492-1.046h-.003c-.059-.054-.123-.067-.188-.135a.36.36 0 0 0-.19-.064c.431-1.278.264-2.55-.173-3.694c-.533-1.41-1.465-2.638-2.175-3.483c-.796-1.005-1.576-1.957-1.56-3.368c.026-2.152.236-6.133-3.544-6.139" } },
  ] },
  tag: { children: [
    { type: "path", props: { d: "M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8 8a2 2 0 0 0 2.828 0l7.172-7.172a2 2 0 0 0 0-2.828z" } },
    { type: "circle", props: { cx: 8.5, cy: 8.5, r: 1.5, fill: "currentColor" } },
  ] },
};

export type IconName = keyof typeof ICONS;

function renderNode(node: IconNode, key: number): JSX.Element {
  const { type, props } = node;
  const isBrand = props.fill === "currentColor";
  const attrs: Record<string, string | number | boolean> = {
    key,
    ...(isBrand
      ? { fill: "currentColor" }
      : {
          fill: "none",
          stroke: "currentColor",
          strokeLinecap: "round" as const,
          strokeLinejoin: "round" as const,
          strokeWidth: 2,
        }),
    ...props,
  };
  if (isBrand) {
    delete attrs.stroke;
    delete attrs.strokeWidth;
    delete attrs.strokeLinecap;
    delete attrs.strokeLinejoin;
  }
  return type === "circle"
    ? <circle {...(attrs as any)} />
    : type === "rect"
    ? <rect {...(attrs as any)} />
    : <path {...(attrs as any)} />;
}

export default function Icon({
  name,
  size = 24,
}: {
  name: IconName;
  size?: number;
}) {
  const def = ICONS[name];
  if (!def) return null;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox={def.viewBox || "0 0 24 24"}
      aria-hidden="true"
    >
      {def.children.map((node, i) => renderNode(node, i))}
    </svg>
  );
}
