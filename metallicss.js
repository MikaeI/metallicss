const base = [
    tag("rect", {
      props: {
        fill: "url(#gradient)",
        height: 1024,
        width: 1024,
        x: 0,
        y: 0,
      },
    }),
    tag("rect", {
      props: {
        filter: "url(#texture)",
        height: 1024,
        style: "mix-blend-mode: luminosity; opacity: 0.5",
        width: 1024,
        x: 0,
        y: 0,
      },
    }),
    tag("rect", {
      props: {
        filter: "url(#texture)",
        height: 1024,
        style: "mix-blend-mode: screen; opacity: 0.25",
        width: 1024,
        x: 0,
        y: 0,
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
          tag("stop", { props: { offset: "50%", ["stop-color"]: "#303030" } }),
          tag("stop", { props: { offset: "60%", ["stop-color"]: "#909090" } }),
          tag("stop", { props: { offset: "70%", ["stop-color"]: "#505050" } }),
          tag("stop", { props: { offset: "100%", ["stop-color"]: "#505050" } }),
        ],
        props: { id: "gradient", x1: 0, x2: 0, y1: 0, y2: 1 },
      }),
    ],
  }),
  serializer = new XMLSerializer(),
  xmlns = "http://www.w3.org/2000/svg";
let blocked = document.body.className.indexOf("block-metallicss") !== -1;

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

export const unblock = () => {
    blocked = false;
  },
  metallicss = (elem) => {
    const { offsetWidth: width, offsetHeight: height } = elem,
      { backgroundColor: background, borderRadius } = getComputedStyle(elem),
      depthValue = getComputedStyle(elem).getPropertyValue("--convexity"),
      seed = getComputedStyle(elem).getPropertyValue("--seed") || 23,
      metal = getComputedStyle(elem)
        .getPropertyValue("--metal")
        .replace(/ /g, ""),
      lustre = `filter: ${
        {
          copper:
            "brightness(0.85) sepia(0.5) saturate(2) hue-rotate(-33.75deg)",
          gold: "brightness(0.95) sepia(1) saturate(1.5)",
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
                    preserveAspectRatio: "none",
                    height: 1024,
                    width: 1024,
                    href: `data:image/svg+xml;utf8,${encodeURIComponent(
                      serializer.serializeToString(
                        tag("svg", {
                          props: { height: 2048, width: 2048, xmlns },
                          inner: [
                            tag("rect", {
                              props: {
                                fill: "white",
                                height: 2048,
                                width: 2048,
                              },
                            }),
                            tag("g", {
                              inner: Array.from({ length: 24 })
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
                              props: { transform: "translate(512,512)" },
                            }),
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
                    stdDeviation: `${4 * (y / x)},${6 * (x / y)}`,
                  },
                }),
                tag("feDisplacementMap", {
                  props: {
                    ["color-interpolation-filters"]: "sRGB",
                    in: "SourceGraphic",
                    in2: "blur",
                    result: "displacement",
                    scale: 50 + Math.abs(rawDepth),
                    xChannelSelector: "R",
                    yChannelSelector: "G",
                  },
                }),
              ],
              props: {
                filterUnits: "userSpaceOnUse",
                height: 2048,
                id: "noise",
                width: 2048,
                x: 0,
                y: 0,
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
                    in2: "turbulence",
                  },
                }),
              ],
              props: {
                filterUnits: "userSpaceOnUse",
                height: 1024,
                id: "texture",
                width: 1024,
                x: 0,
                y: 0,
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
            viewBox: "256 256 512 512",
            xmlns,
          },
        })
      )
    )}')`;
    elem.style.backgroundSize = "100% 100%";
    elem.style.border = "none";
    elem.style.boxShadow = `inset #ffffff80 0px ${
      inverse ? "-" : ""
    }4px 8px, inset ${
      {
        copper: "#402020",
        gold: "#604000",
        iron: "#202020",
        silver: "#404040",
      }[metal || "iron"]
    }${inverse ? "" : "c0"} 0px ${inverse ? "" : "-"}8px 16px ${
      inverse ? "" : ", #00000030 1px 2px 2px, #00000020 2px 4px 4px"
    }`;
    elem.style.color = `#${inverse ? "000000c0" : "ffffffe0"}`;
    elem.style.textRendering = "geometricPrecision";
    elem.style.textShadow = inverse
      ? "white .5px .5px 1px"
      : "black -.5px -.5px 1px";
    elem.style.transform = "translateZ(0)";
    elem.style.transition = "none";
  },
  traverse = () =>
    !blocked &&
    Array.from(document.querySelectorAll(".metallicss"))
      .filter(
        (elem) =>
          window.getComputedStyle(elem).getPropertyValue("display") != "none"
      )
      .forEach(metallicss);

if (document.readyState !== "loading") traverse();
else document.addEventListener("DOMContentLoaded", traverse);

export default metallicss;
