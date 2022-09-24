const refs = {};

function tag(name, { props, inner }) {
  const elem = document.createElementNS("http://www.w3.org/2000/svg", name);

  props &&
    Object.entries(props).forEach(([key, value]) =>
      elem.setAttribute(key, value)
    );
  inner?.forEach((innerElem) => elem.append(innerElem));

  return elem;
}

function blurTag(stdDeviation) {
  const props = { stdDeviation };

  props.in = "SourceGraphic";
  props["color-interpolation-filters"] = "sRGB";

  return tag("feGaussianBlur", { props });
}

function circleTag() {
  return tag("circle", {
    props: { cx: 320, cy: 320, r: 64, fill: "white", filter: refs.B32 },
  });
}

function filterTag(id, { props, inner }) {
  props = { id, x: "-50%", y: "-50%", width: "200%", height: "200%", ...props };

  if (refs[id] === undefined) refs[id] = `url(#${id})`;

  return tag("filter", { inner, props });
}

function gradientTag(id, inner) {
  const props = { id, x1: 0, x2: 0, y1: 0, y2: 1 };

  if (refs[id] === undefined) refs[id] = `url(#${id})`;

  return tag("linearGradient", { inner, props });
}

function rectTag(props) {
  return tag("rect", { props: { fill: "none", ...props } });
}

function stopTag(props) {
  return tag("stop", { props });
}

function sheen({ type: i = 0, offset, stroke, filter, radii, factors }) {
  const size =
      ({ 512: 320, 320: 128, 192: 48 }[offset] || 16) /
      [1, factors.x, factors.y][i],
    offset320 = offset === 320,
    offset512 = offset === 512,
    margin = offset / [1, factors.x, factors.y][i] / 2,
    diff = 1024 - margin * 2;

  return {
    width: [diff, diff + size * 2, 1024 + size * 2][i],
    height: [1024 - margin, 1024, diff + size * 2][i],
    x: [offset512 ? margin + 64 : margin, margin - size, -size][i],
    y: [margin / 2 + (offset320 ? 16 : -16), -size / 2, margin - size][i],
    ["stroke-width"]: size,
    stroke: refs[stroke],
    filter: refs[filter],
    ...(i === 0 && offset512 && { rx: 512, ry: 512 }),
    ...((i > 0 || offset320) && { rx: radii.radiusX, ry: radii.radiusY }),
    ...(i > 0 && stroke === "G1" && { opacity: 0.5 }),
    ...(stroke === "G3" && { opacity: 0.25 }),
  };
}

export const metallicss = (elem, id, value) => {
    id && value && elem.style.setProperty(id, value);

    const { offsetWidth: x, offsetHeight: y } = elem,
      depthValue = getComputedStyle(elem).getPropertyValue("--convexity"),
      depth =
        depthValue === "0%" || depthValue === " 0%"
          ? 0
          : (depthValue && parseInt(depthValue)) || 20,
      factors = {
        x: x / (64 * (Math.abs(depth) / 10 + 1)),
        y: y / (64 * (Math.abs(depth) / 10 + 1)),
      },
      radius = parseInt(getComputedStyle(elem).borderRadius),
      radii = {
        radiusX:
          y / 2 < radius ? 512 * (factors.y / factors.x) : radius * (1024 / x),
        radiusY:
          x / 2 < radius ? 512 * (factors.x / factors.y) : radius * (1024 / y),
      },
      inverse = depth < 0,
      colorBlend = () => ({
        fill: color,
        style: `mix-blend-mode: ${inverse ? "overlay" : "overlay"}`,
      }),
      colorBlend2 = () => ({
        fill: color,
        style: `mix-blend-mode: ${inverse ? "hard-light" : "hard-light"}`,
      }),
      inset = Math.abs(depth) / 2.5,
      insetShadow = `inset #00000080 ${inset / 4}px ${inset}px ${inset}px`,
      serializer = new XMLSerializer();

    let color = getComputedStyle(elem).backgroundColor,
      svg;

    if (color === "rgba(0, 0, 0, 0)") color = "silver";
    elem.style.boxShadow = inverse
      ? insetShadow
      : "#00000040 1px 2px 4px, #00000020 2px 4px 8px";
    if (elem.firstChild !== null && elem.firstChild.style) {
      elem.firstChild.style.display = "inline-block";
      elem.firstChild.style.transform = `scale(${1 + (depth || 0) / 10000})`;
    }

    svg = tag("svg", {
      props: {
        viewBox: "0 0 1024 1024",
        xmlns: "http://www.w3.org/2000/svg",
        preserveAspectRatio: "none",
        transform: `scale(1, ${inverse ? "-" : ""}1)`,
      },
      inner: [
        filterTag("D1", {
          inner: [
            tag("feTurbulence", {
              props: {
                type: "fractalNoise",
                baseFrequency: 0.005,
                numOctaves: 2,
                result: "turbulence",
                ["color-interpolation-filters"]: "sRGB",
              },
            }),
            tag("feDisplacementMap", {
              props: {
                in: "SourceGraphic",
                in2: "turbulence",
                scale: 150,
                xChannelSelector: "R",
                yChannelSelector: "G",
                ["color-interpolation-filters"]: "sRGB",
              },
            }),
          ],
        }),
        filterTag("D2", {
          inner: [
            tag("feTurbulence", {
              props: {
                type: "fractalNoise",
                baseFrequency: 0.01,
                numOctaves: 2,
                result: "turbulence",
                ["color-interpolation-filters"]: "sRGB",
              },
            }),
            tag("feDisplacementMap", {
              props: {
                in: "SourceGraphic",
                in2: "turbulence",
                scale: 10,
                xChannelSelector: "R",
                yChannelSelector: "G",
                ["color-interpolation-filters"]: "sRGB",
              },
            }),
          ],
        }),
        filterTag("D3", {
          inner: [
            tag("feTurbulence", {
              props: {
                type: "fractalNoise",
                baseFrequency: 0.001,
                numOctaves: 4,
                result: "turbulence",
                ["color-interpolation-filters"]: "sRGB",
              },
            }),
            tag("feDisplacementMap", {
              props: {
                in: "SourceGraphic",
                in2: "turbulence",
                scale: 500,
                xChannelSelector: "R",
                yChannelSelector: "G",
                ["color-interpolation-filters"]: "sRGB",
              },
            }),
          ],
        }),
        filterTag("B48", { inner: [blurTag(48)] }),
        filterTag("B32", { inner: [blurTag(`32,${32 * factors.x}`)] }),
        filterTag("B16", { inner: [blurTag(`16,${16 * factors.x}`)] }),
        // filterTag("B8", { inner: [blurTag(8 / factors.x)] }),
        // filterTag("B4", { inner: [blurTag(4 / factors.x)] }),
        filterTag("B8", {
          inner: [blurTag(`${8 / factors.x},${8 / factors.y}`)],
        }),
        filterTag("B4", {
          inner: [blurTag(`${4 / factors.x},${4 / factors.y}`)],
        }),
        tag("defs", {
          inner: [
            gradientTag("G1", [
              stopTag({ offset: "-25%", ["stop-color"]: "transparent" }),
              stopTag({ offset: "15%", ["stop-color"]: "#c3c7c3" }),
              stopTag({ offset: "33%", ["stop-color"]: "#434743" }),
              stopTag({ offset: "67%", ["stop-color"]: "#434743" }),
              stopTag({ offset: "85%", ["stop-color"]: "#c3c7c3" }),
              stopTag({ offset: "125%", ["stop-color"]: "transparent" }),
            ]),
            gradientTag("G2", [
              stopTag({ offset: "-25%", ["stop-color"]: "transparent" }),
              stopTag({ offset: "15%", ["stop-color"]: "#434743" }),
              stopTag({ offset: "33%", ["stop-color"]: "#c3c7c3" }),
              stopTag({ offset: "67%", ["stop-color"]: "#c3c7c3" }),
              stopTag({ offset: "85%", ["stop-color"]: "#434743" }),
              stopTag({ offset: "125%", ["stop-color"]: "transparent" }),
            ]),
            gradientTag("G3", [
              stopTag({ offset: "0%", ["stop-color"]: "#70b0fc" }),
              stopTag({ offset: "60%", ["stop-color"]: "#5090cc" }),
              stopTag({ offset: "70%", ["stop-color"]: "#433" }),
              stopTag({ offset: "100%", ["stop-color"]: "#907a70" }),
            ]),
            gradientTag("G4", [
              stopTag({ offset: "0%", ["stop-color"]: "#c3c7c3" }),
              stopTag({ offset: "40%", ["stop-color"]: "#c3c7c3" }),
              stopTag({ offset: "50%", ["stop-color"]: "#c3c7c300" }),
            ]),
          ],
        }),
        rectTag({ width: 1024, height: 1024, x: 0, y: 0, ...colorBlend2() }),
        rectTag({ width: 1024, height: 1024, x: 0, y: 0, ...colorBlend2() }),
        rectTag({ width: 1024, height: 1024, x: 0, y: 0, ...colorBlend() }),
        rectTag({ width: 1024, height: 1024, x: 0, y: 0, ...colorBlend() }),
        tag("g", {
          props: { filter: refs.D3, style: "mix-blend-mode: hard-light" },
          inner: [
            rectTag({
              width: 2048,
              height: 2048,
              x: -512,
              y: -512,
              fill: refs.G4,
            }),
          ],
        }),
        tag("g", {
          props: { filter: refs.D1, style: "mix-blend-mode: hard-light" },
          inner: [
            rectTag(
              sheen({
                offset: 320,
                stroke: "G1",
                filter: "B32",
                radii,
                factors,
              })
            ),
            rectTag({
              fill: "#434743",
              ["stroke-linecap"]: "round",
              ["stroke-dasharray"]: "0, 512",
              ...sheen({
                offset: 512,
                stroke: "G3",
                filter: "B48",
                radii,
                factors,
              }),
            }),
            rectTag(
              sheen({
                type: 1,
                offset: 176,
                stroke: "G2",
                filter: "B32",
                radii,
                factors,
              })
            ),
            rectTag(
              sheen({
                type: 1,
                offset: 192,
                stroke: "G1",
                filter: "B16",
                radii,
                factors,
              })
            ),
          ],
        }),
        tag("g", {
          props: { filter: refs.D2, style: "mix-blend-mode: hard-light" },
          inner: [
            rectTag(
              sheen({
                type: 1,
                offset: 80,
                stroke: "G2",
                filter: "B8",
                radii,
                factors,
              })
            ),
            rectTag(
              sheen({
                type: 2,
                offset: 80,
                stroke: "G2",
                filter: "B8",
                radii,
                factors,
              })
            ),
            rectTag(
              sheen({
                type: 1,
                offset: 48,
                stroke: "G1",
                filter: "B4",
                radii,
                factors,
              })
            ),
            rectTag(
              sheen({
                type: 2,
                offset: 48,
                stroke: "G1",
                filter: "B4",
                radii,
                factors,
              })
            ),
            circleTag(),
          ],
        }),
      ],
    });
    elem.style.backgroundImage = `url('data:image/svg+xml;base64,${btoa(
      serializer.serializeToString(svg)
    )}')`;
    elem.style.transition = "none";
    elem.style.border = "none";
    elem.style.userSelect = "none";
    elem.style.transform = "translateZ(0)";
    if (elem.querySelector("span")) {
      elem.querySelector("span").style.mixBlendMode = "hard-light";
      elem.querySelector("span").style.color = "#000000e0";
      elem.querySelector("span").style.textShadow =
        "#ffffff80 0px 0px 5px, #ffffff 0.5px 0.5px 0px";
      elem.querySelector("span").style.display = "inline-block";
    }
  },
  traverse = () => document.querySelectorAll(".metallicss").forEach(metallicss);

if (document.readyState !== "loading") traverse();
else document.addEventListener("DOMContentLoaded", traverse);

export default metallicss;
