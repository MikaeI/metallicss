const base = [
    tag("rect", {
      props: {
        fill: "url(#gradient)",
        height: 2048,
        width: 2048,
        x: -512,
        y: -512,
      },
    }),
    tag("rect", {
      props: {
        filter: "url(#texture)",
        height: 1024,
        style: "mix-blend-mode: luminosity; opacity: 0.5",
        width: 1024,
      },
    }),
    tag("rect", {
      props: {
        filter: "url(#texture)",
        height: 1024,
        style: "mix-blend-mode: screen; opacity: 0.25",
        width: 1024,
      },
    }),
  ],
  defs = tag("defs", {
    inner: [
      tag("linearGradient", {
        inner: [
          tag("stop", { props: { offset: "35%", ["stop-color"]: "#b0b0b0" } }),
          tag("stop", { props: { offset: "40%", ["stop-color"]: "#efefef" } }),
          tag("stop", { props: { offset: "45%", ["stop-color"]: "#909090" } }),
          tag("stop", { props: { offset: "50%", ["stop-color"]: "#707070" } }),
          tag("stop", { props: { offset: "50%", ["stop-color"]: "#505050" } }),
          tag("stop", { props: { offset: "60%", ["stop-color"]: "#909090" } }),
          tag("stop", { props: { offset: "70%", ["stop-color"]: "#505050" } }),
          tag("stop", { props: { offset: "100%", ["stop-color"]: "#505050" } }),
        ],
        props: { id: "gradient", x1: 0, x2: 0, y1: 0, y2: 1 },
      }),
      tag("radialGradient", {
        inner: [
          tag("stop", {
            props: {
              ["stop-color"]: "#808080",
              ["stop-opacity"]: 1,
              offset: "25%",
            },
          }),
          tag("stop", {
            props: {
              ["stop-color"]: "#808080",
              ["stop-opacity"]: 0,
              offset: "50%",
            },
          }),
        ],
        props: { id: "radial" },
      }),
    ],
  }),
  serializer = new XMLSerializer(),
  xmlns = "http://www.w3.org/2000/svg";

function tag(name, { inner, props }) {
  const elem = document.createElementNS("http://www.w3.org/2000/svg", name);

  props && Object.entries(props).forEach((prop) => elem.setAttribute(...prop));
  inner?.forEach((innerElem) => elem.append(innerElem));

  return elem;
}

function sheen({ offset, radii: { x: rx, y: ry }, stroke, vertical, x, y }) {
  const margin = offset / (vertical ? x : y) / 2,
    size = offset / 3 / (vertical ? x : y),
    diff = 1024 - margin * 2 + size * 2;

  return tag("rect", {
    props: {
      "stroke-width": size,
      fill: "none",
      height: vertical ? 1024 + size : diff,
      rx,
      ry,
      stroke,
      width: vertical ? diff : 1024 + size,
      x: vertical ? margin - size : -size / 2,
      y: vertical ? -size / 2 : margin - size,
    },
  });
}

export const metallicss = (elem, id, value) => {
    id && value && elem.style.setProperty(id, value);

    const { offsetWidth: width, offsetHeight: height } = elem,
      { backgroundColor: background, borderRadius } = getComputedStyle(elem),
      depthValue = getComputedStyle(elem).getPropertyValue("--convexity"),
      seed = getComputedStyle(elem).getPropertyValue("--seed") || 23,
      metal = getComputedStyle(elem).getPropertyValue("--metal"),
      lustre = `filter: ${
        {
          copper:
            "brightness(0.85) sepia(0.5) saturate(2) hue-rotate(-33.75deg)",
          gold: "sepia(1) saturate(1.75)",
          iron: "",
          silver: "brightness(1.125)",
        }[metal || "iron"]
      }`,
      rawDepth =
        depthValue === "0%" || depthValue === " 0%"
          ? 0
          : (depthValue && parseInt(depthValue)) || 20,
      depth = rawDepth * ((height > width ? width : height) / 640),
      absDepth = Math.abs(depth),
      x = width / (64 * (absDepth / 10 + 1)),
      y = height / (64 * (absDepth / 10 + 1)),
      radius = parseInt(borderRadius),
      radii = {
        x: height / 2 < radius ? 512 * (y / x) : radius * (1024 / width),
        y: width / 2 < radius ? 512 * (x / y) : radius * (1024 / height),
      },
      inverse = depth < 0,
      fill = background === "rgba(0, 0, 0, 0)" ? "gray" : background;

    elem.style.backgroundImage = `url('data:image/svg+xml;utf8,${encodeURIComponent(
      serializer.serializeToString(
        tag("svg", {
          inner: [
            tag("filter", {
              inner: [
                tag("feImage", {
                  props: {
                    href: `data:image/svg+xml;utf8,${encodeURIComponent(
                      serializer.serializeToString(
                        tag("svg", {
                          props: { height: "1024", width: "1024", xmlns },
                          inner: [
                            tag("rect", {
                              props: {
                                fill: "white",
                                height: "1024",
                                width: "1024",
                              },
                            }),
                            ...Array.from({ length: 24 })
                              .map((_, index) =>
                                sheen({
                                  offset: Math.pow(
                                    3,
                                    index % 2 === 0
                                      ? index / 4
                                      : (index - 1) / 4
                                  ),
                                  radii,
                                  stroke:
                                    Math.ceil(index / 2) % 2 === 0
                                      ? "red"
                                      : "white",
                                  vertical: index % 2 === 0,
                                  x,
                                  y,
                                })
                              )
                              .reverse(),
                          ],
                        })
                      )
                    )}`,
                    result: "image",
                  },
                }),
                tag("feGaussianBlur", {
                  props: {
                    ["color-interpolation-filters"]: "sRGB",
                    in: "image",
                    result: "blur",
                    stdDeviation: `${8 * (y / x)},${12 * (x / y)}`,
                  },
                }),
                tag("feDisplacementMap", {
                  props: {
                    ["color-interpolation-filters"]: "sRGB",
                    in: "SourceGraphic",
                    in2: "blur",
                    result: "displacement",
                    scale: 200,
                    xChannelSelector: "R",
                    yChannelSelector: "G",
                  },
                }),
              ],
              props: {
                filterUnits: "userSpaceOnUse",
                height: "1024",
                id: "noise",
                width: "1024",
                x: "0",
                y: "0",
              },
            }),
            tag("filter", {
              inner: [
                tag("feTurbulence", {
                  props: {
                    ["color-interpolation-filters"]: "sRGB",
                    baseFrequency: 0.005,
                    result: "turbulence",
                    seed,
                    type: "fractalNoise",
                  },
                }),
                tag("feDisplacementMap", {
                  props: {
                    ["color-interpolation-filters"]: "sRGB",
                    in: "BackgroundImage",
                    in2: "turbulence",
                  },
                }),
              ],
              props: {
                height: "1024",
                id: "texture",
                width: "1024",
                x: "0",
                y: "0",
              },
            }),
            defs,
            tag("g", { inner: base, props: { filter: "url(#noise)" } }),
            inverse &&
              tag("rect", {
                props: {
                  fill: "#20222480",
                  height: 1024,
                  opacity: `${rawDepth > -25 ? 25 : rawDepth * -1}%`,
                  width: 1024,
                  x: 0,
                  y: 0,
                },
              }),
            tag("rect", {
              props: {
                fill,
                height: 1024,
                opacity: 0.5,
                style: "mix-blend-mode: overlay",
                width: 1024,
                x: 0,
                y: 0,
              },
            }),
          ],
          props: {
            preserveAspectRatio: "none",
            style: `transform: scale(1, ${inverse ? "-" : ""}1); ${lustre}`,
            viewBox: "0 0 1024 1024",
            xmlns,
          },
        })
      )
    )}')`;
    elem.style.backgroundSize = "100% 100%";
    elem.style.border = "none";
    !inverse &&
      (elem.style.boxShadow = "#00000030 1px 2px 2px, #00000020 2px 4px 4px");
    elem.style.textRendering = "geometricPrecision";
    elem.style.transform = "translateZ(0)";
    elem.style.transition = "none";
    elem.innerText.style.color = `#${inverse ? "000000" : "ffffff"}80`;
    elem.innerText.style.display = "inline-block";
    elem.innerText.style.mixBlendMode = inverse ? "overlay" : "luminosity";
    elem.innerText.style.transform = `scale(${1 + (depth || 0) / 5000})`;
    elem.innerText.style.textShadow = inverse
      ? "white .5px .5px 1px"
      : "black -.5px -.5px 1px";
  },
  traverse = () => document.querySelectorAll(".metallicss").forEach(metallicss);

if (document.readyState !== "loading") traverse();
else document.addEventListener("DOMContentLoaded", traverse);

export default metallicss;
