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
  map = await tag("feImage", {
    props: {
      ...dims,
      ...sRGB,
      href: await fetch("./map.png")
        .then((response) => response.blob())
        .then((blob) => {
          return new Promise((resolve) => {
            const reader = new FileReader();

            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });
        }),
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
          props: { href: metal, ...dims, preserveAspectRatio: "none" },
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
let metal = await fetch("./metal.png")
  .then((response) => response.blob())
  .then((blob) => {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  });

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
