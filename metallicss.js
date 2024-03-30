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
          ? "orangered"
          : finish === "lead"
          ? "slategray"
          : finish === "neutral"
          ? background
          : "white",
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
    elem.style.color = "black";
    elem.style.textShadow = "white 0 0.5px 0";
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
