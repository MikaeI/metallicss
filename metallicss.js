const base = [
    tag("rect", {
      props: { fill: "url(#gradient)", height: 1024, width: 1024, x: 0, y: 0 },
    }),
  ],
  defs = tag("defs", {
    inner: [
      tag("linearGradient", {
        inner: [
          tag("stop", { props: { offset: "35%", ["stop-color"]: "#b0b0b0" } }),
          tag("stop", { props: { offset: "40%", ["stop-color"]: "#efefef" } }),
          tag("stop", { props: { offset: "45%", ["stop-color"]: "#909090" } }),
          tag("stop", { props: { offset: "49%", ["stop-color"]: "#707070" } }),
          tag("stop", { props: { offset: "51%", ["stop-color"]: "#303030" } }),
          tag("stop", { props: { offset: "60%", ["stop-color"]: "#909090" } }),
          tag("stop", { props: { offset: "70%", ["stop-color"]: "#505050" } }),
          tag("stop", { props: { offset: "100%", ["stop-color"]: "#505050" } }),
        ],
        props: { id: "gradient", x1: 0, x2: 0, y1: 0, y2: 1 },
      }),
    ],
  }),
  serializer = new XMLSerializer(),
  xmlns = "http://www.w3.org/2000/svg",
  domUrl = window.URL || window.webkitURL || window;

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
      "stroke-width": parseInt(size),
      fill: "none",
      height: parseInt(vertical ? 1024 + size : diff),
      rx: parseInt(rx),
      ry: parseInt(ry),
      stroke,
      width: parseInt(vertical ? diff : 1024 + size),
      x: parseInt(vertical ? margin - size : -size / 2),
      y: parseInt(vertical ? -size / 2 : margin - size),
    },
  });
}

function rasterify(elem, svg, callback) {
  const url = domUrl.createObjectURL(
      new Blob([svg], { type: "image/svg+xml;charset=utf-8" })
    ),
    image = callback ? new Image() : elem.querySelector(".metal");

  image.onload = function () {
    const canvas = document.createElement("canvas"),
      context = canvas.getContext("2d", { alpha: false });

    canvas.width = 512;
    canvas.height = 512;
    context.drawImage(this, 0, 0);
    domUrl.revokeObjectURL(url);
    if (callback) {
      image.remove();
      callback(canvas.toDataURL());
    }
    canvas.remove();
  };
  image.src = url;
}

export const metallicss = (elem) => {
    const { offsetWidth: width, offsetHeight: height } = elem,
      { backgroundColor: background, borderRadius } = getComputedStyle(elem),
      depthValue = getComputedStyle(elem).getPropertyValue("--convexity"),
      seed = getComputedStyle(elem).getPropertyValue("--seed") || 23,
      scale = getComputedStyle(elem).getPropertyValue("--scale") || 4,
      metal = getComputedStyle(elem)
        .getPropertyValue("--metal")
        .replace(/ /g, ""),
      rawDepth =
        depthValue === "0%" || depthValue === " 0%"
          ? 0
          : (depthValue && parseInt(depthValue)) || 20,
      depth = rawDepth * ((height > width ? width : height) / 640),
      absDepth = Math.abs(depth),
      x = width / (16 * scale * (absDepth / 10 + 1)),
      y = height / (16 * scale * (absDepth / 10 + 1)),
      radius = parseInt(borderRadius),
      radii = {
        x: height / 2 < radius ? 512 * (y / x) : radius * (1024 / width),
        y: width / 2 < radius ? 512 * (x / y) : radius * (1024 / height),
      },
      inverse = depth < 0,
      fill =
        metal === "gold"
          ? "rgb(255, 215, 128)"
          : metal === "copper"
          ? "rgb(187, 128, 119)"
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
      backdrop = elem.querySelector(".metal");

    if (width === 0 || height === 0) return;
    if (backdrop === null) {
      const image = new Image();

      image.className = "metal";
      elem.append(image);
    }
    if (
      document.getElementById(
        `svg_for_filter_lustre_${fill.replace(/ /g, "")}_${seed}`
      ) === null
    )
      document.body.append(
        tag("svg", {
          props: {
            id: `svg_for_filter_lustre_${fill.replace(/ /g, "")}_${seed}`,
            width: 0,
            height: 0,
          },
          inner: [
            tag("filter", {
              inner: [
                tag("feColorMatrix", {
                  props: {
                    ["color-interpolation-filters"]: "sRGB",
                    in: "SourceGraphic",
                    type: "matrix",
                    values: `${rgb[0]} 0 0 0 0 0 ${rgb[1]} 0 0 0 0 0 ${rgb[2]} 0 0 0 0 0 1 0`,
                    result: "color",
                  },
                }),
                tag("feComponentTransfer", {
                  props: {
                    ["color-interpolation-filters"]: "sRGB",
                    in: "color",
                    result: "brightness",
                  },
                  inner: [
                    tag("feFuncR", {
                      props: { type: "linear", slope: "2" },
                    }),
                    tag("feFuncG", {
                      props: { type: "linear", slope: "2" },
                    }),
                    tag("feFuncB", {
                      props: { type: "linear", slope: "2" },
                    }),
                  ],
                }),
                tag("feBlend", {
                  props: {
                    ["color-interpolation-filters"]: "sRGB",
                    mode: "color",
                    in: "color",
                    in2: "SourceGraphic",
                    result: "colorized",
                  },
                }),
                tag("feTurbulence", {
                  props: {
                    ["color-interpolation-filters"]: "sRGB",
                    baseFrequency: 0.005,
                    result: "turbulence",
                    seed,
                    type: "turbulence",
                  },
                }),
                tag("feBlend", {
                  props: {
                    ["color-interpolation-filters"]: "sRGB",
                    mode: "screen",
                    in: "turbulence",
                    in2: "colorized",
                    result: "randomized",
                  },
                }),
                tag("feBlend", {
                  props: {
                    ["color-interpolation-filters"]: "sRGB",
                    mode: "soft-light",
                    in: "brightness",
                    in2: "randomized",
                  },
                }),
              ],
              props: {
                id: `lustre_${fill.replace(/ /g, "")}_${seed}`,
              },
            }),
          ],
        })
      );
    rasterify(
      elem,
      serializer.serializeToString(
        tag("svg", {
          props: { height: 512, width: 512, xmlns },
          inner: [
            tag("rect", { props: { fill: "white", height: 512, width: 512 } }),
            tag("g", {
              inner: Array.from({ length: 24 })
                .map((_, index) =>
                  sheen({
                    offset: Math.pow(
                      3,
                      index % 2 === 0 ? index / 4 : (index - 1) / 4
                    ),
                    radii,
                    stroke: Math.ceil(index / 2) % 2 === 0 ? "red" : "white",
                    vertical: index % 2 === 0,
                    x,
                    y,
                  })
                )
                .reverse(),
              props: { transform: "scale(0.25) translate(512,512)" },
            }),
          ],
        })
      ),
      (inner) =>
        rasterify(
          elem,
          serializer.serializeToString(
            tag("svg", {
              inner: [
                tag("filter", {
                  inner: [
                    tag("feImage", {
                      props: {
                        ["color-interpolation-filters"]: "sRGB",
                        preserveAspectRatio: "none",
                        height: 1024,
                        width: 1024,
                        href: inner,
                        result: "image",
                      },
                    }),
                    tag("feGaussianBlur", {
                      props: {
                        ["color-interpolation-filters"]: "sRGB",
                        in: "image",
                        result: "blur",
                        stdDeviation: `${parseInt(
                          scale * (y / x) || 0
                        )},${parseInt(scale * 1.5 * (x / y) || 0)}`,
                      },
                    }),
                    tag("feDisplacementMap", {
                      props: {
                        ["color-interpolation-filters"]: "sRGB",
                        in: "SourceGraphic",
                        in2: "blur",
                        result: "displacement",
                        scale:
                          50 + Math.abs(rawDepth) > 100
                            ? 100
                            : 50 + Math.abs(rawDepth),
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
                defs,
                tag("radialGradient", {
                  inner: [
                    tag("stop", {
                      props: {
                        offset: "33%",
                        ["stop-color"]: "black",
                        ["stop-opacity"]: inverse ? 0.25 : 0,
                      },
                    }),
                    tag("stop", {
                      props: {
                        offset: "67%",
                        ["stop-color"]: "black",
                        ["stop-opacity"]: 0.5,
                      },
                    }),
                  ],
                  props: { id: "radial" },
                }),
                tag("g", { inner: base, props: { filter: "url(#noise)" } }),
                tag("rect", {
                  props: {
                    fill: "url(#radial)",
                    height: 1024,
                    width: 1024,
                    x: 0,
                    y: 0,
                  },
                }),
              ],
              props: {
                height: 512,
                width: 512,
                preserveAspectRatio: "none",
                style: `transform: scale(1, ${inverse ? "-" : ""}1)`,
                viewBox: "256 256 512 512",
                xmlns,
              },
            })
          )
        )
    );
    elem.style.backgroundSize = "100% 100%";
    elem.style.boxShadow = inverse
      ? ""
      : "#00000030 1px 2px 2px, #00000020 2px 4px 4px";
    elem.style.color = `${
      inverse || (height > 100 && elem.innerText !== "MetalliCSS")
        ? "black"
        : "white"
    }`;
    elem.style.textRendering = "geometricPrecision";
    elem.style.textShadow =
      inverse || (height > 100 && elem.innerText !== "MetalliCSS")
        ? "white .5px .5px 1px"
        : "black -.5px -.5px 1px";
    elem.style.transform = "translateZ(0)";
    elem.style.overflow = "hidden";
    if (backdrop) {
      backdrop.style.filter = "";
      setTimeout(() => {
        backdrop.style.filter = `url("#lustre_${fill.replace(
          / /g,
          ""
        )}_${seed}")`;
      }, 0);
      backdrop.style.position = "absolute";
      backdrop.style.top = "0";
      backdrop.style.left = "0";
      backdrop.style.zIndex = "-1";
      backdrop.style.width = "100%";
      backdrop.style.height = "100%";
    }
  },
  traverse = () =>
    Array.from(document.querySelectorAll(".metallicss")).forEach(metallicss);

if (document.readyState !== "loading") traverse();
else document.addEventListener("DOMContentLoaded", traverse);

export default metallicss;
