function tag(name, { inner, props }) {
  const elem = document.createElementNS("http://www.w3.org/2000/svg", name);

  props && Object.entries(props).forEach((prop) => elem.setAttribute(...prop));
  inner?.forEach((innerElem) => elem.append(innerElem));

  return elem;
}

function debounce(callback, delay = 250) {
  let timeout;

  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => callback(...args), delay);
  };
}

const serializer = new XMLSerializer(),
  xmlns = "http://www.w3.org/2000/svg",
  domUrl = window.URL || window.webkitURL || window,
  isFirefox = window.navigator.userAgent.indexOf("Firefox") > -1,
  dims = { height: 2048, width: 2048 },
  sRGB = { ["color-interpolation-filters"]: "sRGB" },
  map = tag("feImage", {
    props: {
      ...dims,
      ...sRGB,
      href: "data:image/png;base64,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",
      preserveAspectRatio: "none",
      result: "map",
    },
  }),
  metallicss = (elem) => {
    const { offsetHeight: y, offsetWidth: x } = elem,
      { backgroundColor: background, borderRadius } = getComputedStyle(elem),
      depth = getComputedStyle(elem).getPropertyValue("--convexity"),
      rawDepth =
        depth === "0" || depth === " 0" ? 0 : (depth && parseInt(depth)) || 4,
      absRawDepth = Math.abs(rawDepth),
      radius = parseInt(borderRadius),
      inverse = rawDepth < 0,
      canvas =
        elem.querySelector(":scope > .metal") ||
        document.createElement("canvas"),
      context = canvas.getContext("2d", { alpha: false }),
      finish = getComputedStyle(elem)
        .getPropertyValue("--metal")
        .replace(/ /g, ""),
      fill =
        finish === "gold"
          ? "yellow"
          : finish === "copper"
          ? "rgb(128, 64, 0)"
          : finish === "silver"
          ? "rgb(192, 192, 192)"
          : finish === "lead"
          ? "rgb(0, 0, 0)"
          : background === "rgba(0, 0, 0, 0)"
          ? "rgb(128, 128, 128)"
          : background,
      inner = [
        tag("image", {
          props: {
            href: "data:image/png;base64,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",
            ...dims,
            preserveAspectRatio: "none",
          },
        }),
        tag("rect", {
          props: {
            ...dims,
            fill,
            style: "mix-blend-mode: luminosity",
            opacity: 0.25,
          },
        }),
        tag("rect", {
          props: {
            x: 512,
            y: 512,
            width: 1024,
            height: 1024,
            fill: "url(#color)",
            style: "mix-blend-mode: color",
          },
        }),
        tag("rect", {
          props: {
            ...dims,
            fill,
            opacity: 0.25,
            style: "mix-blend-mode: overlay",
          },
        }),
      ];
    let tempImage,
      url,
      rx =
        parseInt((y / 2 < radius ? 1024 * (y / x) : radius * (2048 / x)) / 4) -
        absRawDepth * 4,
      ry =
        parseInt((x / 2 < radius ? 1024 * (x / y) : radius * (2048 / y)) / 4) -
        absRawDepth * 4;

    if (x === 0 || y === 0) return;
    if (rx < 0) rx = 0;
    if (ry < 0) ry = 0;
    tempImage = new Image();
    tempImage.onload = function () {
      canvas.height = isFirefox ? 512 : y * 2 > 1024 ? 1024 : y * 2;
      canvas.width = isFirefox ? 512 : x * 2 > 1024 ? 1024 : x * 2;
      setTimeout(() => {
        context.drawImage(this, 0, 0);
        domUrl.revokeObjectURL(url);
        tempImage.remove();
      }, 0);
    };
    if (elem.querySelector(":scope > .metal") === null) {
      canvas.className = "metal";
      elem.append(canvas);
    }
    url = domUrl.createObjectURL(
      new Blob(
        [
          serializer.serializeToString(
            tag("svg", {
              inner: [
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
                                    rx,
                                    ry,
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
                tag("linearGradient", {
                  inner: [
                    tag("stop", {
                      props: {
                        ["stop-color"]: fill,
                        ["stop-opacity"]: 0.5,
                        offset: 0.3,
                      },
                    }),
                    tag("stop", {
                      props: {
                        ["stop-color"]: fill,
                        ["stop-opacity"]: 0.125,
                        offset: 0.7,
                      },
                    }),
                    tag("stop", {
                      props: {
                        ["stop-color"]: fill,
                        ["stop-opacity"]: 0.5,
                        offset: 1,
                      },
                    }),
                  ],
                  props: {
                    ["color-interpolation"]: "sRGB",
                    gradientTransform: "rotate(90)",
                    id: "color",
                  },
                }),
                tag("g", {
                  inner: inverse
                    ? [
                        ...inner,
                        tag("rect", {
                          props: {
                            ...dims,
                            fill: "#40404060",
                            style: "mix-blend-mode: multiply",
                          },
                        }),
                      ]
                    : inner,
                  props: { filter: "url(#warp)" },
                }),
              ],
              props: {
                height: isFirefox ? 512 : y * 2 > 1024 ? 1024 : y * 2,
                width: isFirefox ? 512 : x * 2 > 1024 ? 1024 : x * 2,
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
    Object.assign(elem.querySelector(":scope > .metal").style, {
      height: "100%",
      left: "0",
      maxWidth: "100%",
      position: "absolute",
      top: "0",
      width: "100%",
      zIndex: -1,
    });
  };

((fn) => {
  if (document.readyState !== "loading") fn();
  else document.addEventListener("DOMContentLoaded", fn);
})(() => {
  Array.from(document.querySelectorAll(".metallicss")).forEach((elem) => {
    elem.style.boxShadow = "#00000030 1px 2px 2px, #00000020 2px 4px 4px";
    elem.style.color = "white";
    elem.style.textShadow = "black 0 -0.5px 1px";
    elem.style.overflow = "hidden";
    elem.style.textRendering = "geometricPrecision";
    elem.style.transform = "translateZ(0)";

    const debounced = debounce(metallicss),
      observer = new MutationObserver(() => debounced(elem)),
      dimensionsObserver = new ResizeObserver(() => debounced(elem));

    observer.observe(elem, { attributes: true, attributeFilter: ["style"] });
    dimensionsObserver.observe(elem);
    debounced(elem);
  });
});
