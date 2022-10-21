const base = tag("rect", {
    props: {
      fill: "url(#gradient)",
      height: 2048,
      width: 2048,
      x: -512,
      y: -512,
    },
  }),
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
    ],
  }),
  radial = tag("radialGradient", {
    inner: [
      tag("stop", {
        props: {
          offset: "75%",
          ["stop-color"]: "#000000",
          ["stop-opacity"]: 0,
        },
      }),
      tag("stop", {
        props: {
          offset: "150%",
          ["stop-color"]: "#000000",
          ["stop-opacity"]: 1,
        },
      }),
    ],
    props: { id: "radial" },
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
      rawDepth =
        depthValue === "0%" || depthValue === " 0%"
          ? 0
          : (depthValue && parseInt(depthValue)) || 20,
      depth = rawDepth * ((height > width ? width : height) / 320),
      absDepth = Math.abs(depth),
      x = width / (64 * (absDepth / 10 + 1)),
      y = height / (64 * (absDepth / 10 + 1)),
      radius = parseInt(borderRadius),
      radii = {
        x: height / 2 < radius ? 512 * (y / x) : radius * (1024 / width),
        y: width / 2 < radius ? 512 * (x / y) : radius * (1024 / height),
      },
      inverse = depth < 0,
      parent = elem.parentElement,
      fill = background === "rgba(0, 0, 0, 0)" ? "gray" : background;
    let content;

    (parent.className.indexOf("metallicss") === -1 ||
      getComputedStyle(parent).getPropertyValue("--convexity").indexOf("-") !==
        -1) &&
      (elem.style.boxShadow = inverse
        ? "none"
        : "#00000030 1px 2px 2px, #00000020 2px 4px 4px");
    if (elem.firstChild !== null && elem.firstChild.style) {
      elem.firstChild.style.display = "inline-block";
      elem.firstChild.style.transform = `scale(${1 + (depth || 0) / 5000})`;
    }
    content = [
      tag("filter", {
        props: {
          filterUnits: "userSpaceOnUse",
          height: "1024",
          id: "noise",
          width: "1024",
          x: "0",
          y: "0",
        },
        inner: [
          tag("feImage", {
            props: {
              href: `data:image/svg+xml;utf8,${encodeURIComponent(
                serializer.serializeToString(
                  tag("svg", {
                    props: {
                      height: "1024",
                      width: "1024",
                      xmlns,
                      ["text-rendering"]: "optimizeSpeed",
                      ["shape-rendering"]: "optimizeSpeed",
                    },
                    inner: [
                      tag("defs", {
                        inner: [
                          radial,
                          tag("filter", {
                            inner: [
                              tag("feImage", {
                                props: {
                                  href: `data:image/svg+xml;utf8,${encodeURIComponent(
                                    serializer.serializeToString(
                                      tag("svg", {
                                        props: {
                                          height: "1024",
                                          width: "1024",
                                          xmlns,
                                          ["text-rendering"]: "optimizeSpeed",
                                          ["shape-rendering"]: "optimizeSpeed",
                                        },
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
                                  result: "blur1",
                                  stdDeviation: `${8 * (y / x)},${8 * (x / y)}`,
                                },
                              }),
                              tag("feComposite", {
                                props: {
                                  in: "blur1",
                                  in2: "SourceGraphic",
                                  operator: "in",
                                  result: "edges",
                                },
                              }),
                              tag("feGaussianBlur", {
                                props: {
                                  ["color-interpolation-filters"]: "sRGB",
                                  in: "image",
                                  stdDeviation: `${128 * (y / x)},${
                                    128 * (x / y)
                                  }`,
                                  result: "blur2",
                                },
                              }),
                              tag("feComposite", {
                                props: { in: "blur2", operator: "in" },
                              }),
                              tag("feComposite", {
                                props: { in: "edges", operator: "over" },
                              }),
                            ],
                            props: {
                              id: "blur",
                              filterUnits: "userSpaceOnUse",
                              height: "1024",
                              width: "1024",
                              x: "0",
                              y: "0",
                            },
                          }),
                        ],
                      }),
                      tag("g", {
                        inner: [
                          tag("rect", {
                            props: {
                              fill: "url(#radial)",
                              height: "1024",
                              width: "1024",
                            },
                          }),
                        ],
                        props: { filter: "url(#blur)" },
                      }),
                    ],
                  })
                )
              )}`,
              result: "image",
            },
          }),
          tag("feDisplacementMap", {
            props: {
              ["color-interpolation-filters"]: "sRGB",
              in: "SourceGraphic",
              in2: "image",
              result: "displacement",
              scale: 100,
              xChannelSelector: "R",
              yChannelSelector: "G",
            },
          }),
        ],
      }),
      defs,
      tag("g", { inner: [base], props: { filter: "url(#noise)" } }),
      inverse &&
        tag("rect", {
          props: {
            fill: "#20222480",
            height: 1024,
            opacity: `${Math.abs(rawDepth) < 25 ? 25 : Math.abs(rawDepth)}%`,
            width: 1024,
            x: 0,
            y: 0,
          },
        }),
      tag("rect", {
        props: {
          fill,
          height: 1024,
          opacity: 0.75,
          style: "mix-blend-mode: overlay",
          width: 1024,
          x: 0,
          y: 0,
        },
      }),
    ];
    elem.style.backgroundImage = `url('data:image/svg+xml;utf8,${encodeURIComponent(
      serializer.serializeToString(
        tag("svg", {
          inner: content,
          props: {
            preserveAspectRatio: "none",
            style: `transform: scale(1, ${inverse ? "-" : ""}1)`,
            viewBox: "0 0 1024 1024",
            xmlns,
            ["text-rendering"]: "optimizeSpeed",
            ["shape-rendering"]: "optimizeSpeed",
          },
        })
      )
    )}')`;
    elem.style.backgroundSize = "100% 100%";
    elem.style.border = "none";
    // elem.style.textRendering = "geometricPrecision";
    elem.style.textRendering = "optimizeSpeed";
    elem.style.transform = "translateZ(0)";
    elem.style.transition = "none";
    if (elem.querySelector("span")) {
      elem.querySelector("span").style.color = inverse ? "#404040" : "#c0c0c0";
      elem.querySelector("span").style.display = "inline-block";
      elem.querySelector("span").style.mixBlendMode = "hard-light";
      elem.querySelector("span").style.textShadow = inverse
        ? "white .5px .5px 1px"
        : "black -.5px -.5px 1px";
    }
  },
  traverse = () => document.querySelectorAll(".metallicss").forEach(metallicss);

if (document.readyState !== "loading") traverse();
else document.addEventListener("DOMContentLoaded", traverse);

export default metallicss;
