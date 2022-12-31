const serializer = new XMLSerializer(),
  xmlns = "http://www.w3.org/2000/svg",
  domUrl = window.URL || window.webkitURL || window,
  dims = { height: 2048, width: 2048 },
  sRGB = { ["color-interpolation-filters"]: "sRGB" },
  inner = [
    tag("rect", { props: { fill: "url(#n)", height: 1200, width: 2048 } }),
    tag("rect", {
      props: { fill: "url(#s)", height: 848, width: 2048, y: 1200 },
    }),
    tag("rect", { props: { ...dims, filter: "url(#perlin)" } }),
  ],
  gradients = [
    tag("radialGradient", {
      inner: [
        tag("stop", { props: { ["stop-color"]: "#d8dfef", offset: 0 } }),
        tag("stop", { props: { ["stop-color"]: "#808080", offset: 1 } }),
      ],
      props: { ["color-interpolation"]: "sRGB", cx: 0.6, cy: 1, id: "n" },
    }),
    tag("radialGradient", {
      inner: [
        tag("stop", { props: { ["stop-color"]: "#585048", offset: 0 } }),
        tag("stop", { props: { ["stop-color"]: "white", offset: 1 } }),
      ],
      props: { ["color-interpolation"]: "sRGB", cx: 0.6, cy: 0, id: "s" },
    }),
  ],
  map = tag("feImage", {
    props: {
      ...dims,
      ...sRGB,
      href: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
        serializer.serializeToString(
          tag("svg", {
            inner: [
              tag("linearGradient", {
                inner: [
                  tag("stop", {
                    props: {
                      ["stop-color"]: "#ff0000",
                      ["stop-opacity"]: 1,
                      offset: 0,
                    },
                  }),
                  tag("stop", {
                    props: {
                      ["stop-color"]: "#ff0000",
                      ["stop-opacity"]: 0,
                      offset: 1,
                    },
                  }),
                ],
                props: {
                  ["color-interpolation"]: "sRGB",
                  id: "red",
                  x1: 0,
                  x2: 1,
                  y1: 0,
                  y2: 0,
                },
              }),
              tag("linearGradient", {
                inner: [
                  tag("stop", {
                    props: {
                      ["stop-color"]: "#0000ff",
                      ["stop-opacity"]: 1,
                      offset: 0,
                    },
                  }),
                  tag("stop", {
                    props: {
                      ["stop-color"]: "#0000ff",
                      ["stop-opacity"]: 0,
                      offset: 1,
                    },
                  }),
                ],
                props: {
                  ["color-interpolation"]: "sRGB",
                  id: "blue",
                  x1: 0,
                  x2: 0,
                  y1: 0,
                  y2: 1,
                },
              }),
              tag("rect", {
                props: { fill: "black", height: "100%", width: "100%" },
              }),
              tag("rect", {
                props: { fill: "url(#red)", height: "100%", width: "100%" },
              }),
              tag("rect", {
                props: {
                  fill: "url(#blue)",
                  height: "100%",
                  width: "100%",
                  style: "mix-blend-mode: screen",
                },
              }),
            ],
            props: { ...dims, xmlns },
          })
        )
      )}`,
      preserveAspectRatio: "none",
      result: "map",
    },
  });

function tag(name, { inner, props }) {
  const elem = document.createElementNS("http://www.w3.org/2000/svg", name);

  props && Object.entries(props).forEach((prop) => elem.setAttribute(...prop));
  inner?.forEach((innerElem) => elem.append(innerElem));

  return elem;
}

export const metallicss = (elem) => {
    const { offsetHeight: y, offsetWidth: x } = elem,
      { backgroundColor: background, borderRadius } = getComputedStyle(elem),
      depth = getComputedStyle(elem).getPropertyValue("--convexity"),
      metal = getComputedStyle(elem)
        .getPropertyValue("--metal")
        .replace(/ /g, ""),
      rawDepth =
        depth === "0" || depth === " 0" ? 0 : (depth && parseInt(depth)) || 4,
      absRawDepth = Math.abs(rawDepth),
      radius = parseInt(borderRadius),
      inverse = rawDepth < 0,
      fill =
        metal === "gold"
          ? "rgb(255, 248, 0)"
          : metal === "copper"
          ? "rgb(255, 128, 0)"
          : metal === "silver"
          ? "rgb(221, 231, 247)"
          : metal === "lead"
          ? "rgb(55, 55, 64)"
          : background === "rgba(0, 0, 0, 0)"
          ? "rgb(128, 128, 128)"
          : background,
      rgb = fill
        .replace("rgb(", "")
        .replace(")", "")
        .replace(/ /g, "")
        .split(",")
        .map((str) => (parseInt(str) / 256).toFixed(3)),
      image = elem.querySelector(":scope > .metal") || new Image();
    let tempImage, url;

    tempImage = new Image();
    tempImage.onload = function () {
      const canvas = document.createElement("canvas"),
        context = canvas.getContext("2d", { alpha: false });

      canvas.height = y * 2;
      canvas.width = x * 2;
      context.drawImage(this, 0, 0);
      domUrl.revokeObjectURL(url);
      tempImage.remove();
      image.src = canvas.toDataURL();
      canvas.remove();
    };
    if (x === 0 || y === 0) return;
    if (elem.querySelector(":scope > .metal") === null) {
      image.className = "metal";
      elem.append(image);
    }
    document.getElementById(`for_lustre_${fill.replace(/ /g, "")}`) === null &&
      document.body.append(
        tag("svg", {
          inner: [
            tag("filter", {
              inner: [
                tag("feColorMatrix", {
                  props: {
                    ...sRGB,
                    result: "color",
                    type: "matrix",
                    values: `${rgb[0]} 0 0 0 0 0 ${rgb[1]} 0 0 0 0 0 ${rgb[2]} 0 0 0 0 0 1 0`,
                  },
                }),
                tag("feBlend", {
                  props: {
                    ...sRGB,
                    in: "color",
                    in2: "SourceGraphic",
                    mode: "screen",
                    result: "first",
                  },
                }),
                tag("feBlend", {
                  props: {
                    ...sRGB,
                    in: "SourceGraphic",
                    in2: "first",
                    mode: "overlay",
                    result: "second",
                  },
                }),
                tag("feBlend", {
                  props: {
                    ...sRGB,
                    in: "SourceGraphic",
                    in2: "second",
                    mode: "color-burn",
                    result: "third",
                  },
                }),
                tag("feColorMatrix", {
                  props: {
                    ...sRGB,
                    result: "fourth",
                    type: "saturate",
                    values: "1.5",
                  },
                }),
              ],
              props: { id: `lustre_${fill.replace(/ /g, "")}` },
            }),
          ],
          props: {
            height: 0,
            width: 0,
            id: `for_lustre_${fill.replace(/ /g, "")}`,
          },
        })
      );
    url = domUrl.createObjectURL(
      new Blob(
        [
          serializer.serializeToString(
            tag("svg", {
              inner: [
                ...gradients,
                tag("filter", {
                  inner: [
                    map,
                    tag("feImage", {
                      props: {
                        ...dims,
                        ...sRGB,
                        href: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
                          serializer.serializeToString(
                            tag("svg", {
                              inner: [
                                tag("filter", {
                                  inner: [
                                    tag("feGaussianBlur", {
                                      props: {
                                        ...sRGB,
                                        stdDeviation: absRawDepth * 3,
                                      },
                                    }),
                                  ],
                                  props: { id: "blur" },
                                }),
                                tag("rect", {
                                  props: {
                                    fill: "rgb(1, 0, 1)",
                                    filter: "url(#blur)",
                                    height: `${
                                      25 - (absRawDepth / 3) * ((x + y) / 2 / y)
                                    }%`,
                                    width: `${
                                      25 - (absRawDepth / 3) * ((x + y) / 2 / x)
                                    }%`,
                                    rx:
                                      parseInt(
                                        (y / 2 < radius
                                          ? 1024 * (y / x)
                                          : radius * (2048 / x)) / 4
                                      ) -
                                      absRawDepth * 4,
                                    ry:
                                      parseInt(
                                        (x / 2 < radius
                                          ? 1024 * (x / y)
                                          : radius * (2048 / y)) / 4
                                      ) -
                                      absRawDepth * 4,
                                    x: `${
                                      37.5 +
                                      (absRawDepth / 6) * ((x + y) / 2 / x)
                                    }%`,
                                    y: `${
                                      37.5 +
                                      (absRawDepth / 6) * ((x + y) / 2 / y)
                                    }%`,
                                  },
                                }),
                              ],
                              props: { ...dims, xmlns },
                            })
                          )
                        )}`,
                        preserveAspectRatio: "none",
                        result: "lens",
                      },
                    }),
                    tag("feBlend", {
                      props: { ...sRGB, in: "lens", in2: "map" },
                    }),
                    tag("feDisplacementMap", {
                      props: {
                        ...sRGB,
                        in: "SourceGraphic",
                        scale: -500,
                        xChannelSelector: "R",
                        yChannelSelector: "B",
                      },
                    }),
                  ],
                  props: { id: "warp", x: 0, y: 0 },
                }),
                tag("filter", {
                  inner: [
                    tag("feTurbulence", {
                      props: {
                        ...sRGB,
                        baseFrequency: "0.005 0.01",
                        seed: Math.floor(Math.random() * 100),
                        type: "fractalNoise",
                      },
                    }),
                    tag("feColorMatrix", {
                      props: {
                        ...sRGB,
                        result: "desaturated",
                        type: "matrix",
                        values: `.33 .33 .33 0 0 .33 .33 .33 0 0 .33 .33 .33 0 0 0 0 0 1 0`,
                      },
                    }),
                  ],
                  props: { id: "perlin" },
                }),
                tag("g", {
                  inner: inverse
                    ? [
                        ...inner,
                        tag("rect", { props: { ...dims, fill: "#30303030" } }),
                      ]
                    : inner,
                  props: { filter: "url(#warp)" },
                }),
              ],
              props: {
                height: y * 2,
                width: x * 2,
                preserveAspectRatio: "none",
                style: `transform: scale(1, ${inverse ? "-" : ""}1)`,
                viewBox: "768 768 512 512",
                xmlns,
              },
            })
          ),
        ],
        { type: "image/svg+xml;charset=utf-8" }
      )
    );
    tempImage.src = url;
    elem.style.boxShadow = inverse
      ? ""
      : "#00000030 1px 2px 2px, #00000020 2px 4px 4px";
    elem.style.color = "white";
    elem.style.overflow = "hidden";
    elem.style.textRendering = "geometricPrecision";
    elem.style.transform = "translateZ(0)";
    elem.querySelector(":scope > .metal").style.filter = "";
    setTimeout(
      () =>
        Object.assign(elem.querySelector(":scope > .metal").style, {
          filter: `url("#lustre_${fill.replace(/ /g, "")}")`,
          height: "100%",
          left: "0",
          maxWidth: "100%",
          position: "absolute",
          top: "0",
          width: "100%",
          zIndex: -1,
        }),
      0
    );
  },
  traverse = () =>
    Array.from(document.querySelectorAll(".metallicss")).forEach(metallicss);

if (document.readyState !== "loading") traverse();
else document.addEventListener("DOMContentLoaded", traverse);

export default metallicss;
