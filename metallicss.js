const base = [
    tag("rect", {
      props: { fill: "url(#gradient)", height: 1024, width: 1024, x: 0, y: 0 },
    }),
  ],
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

function angleToPoints(angle) {
  const segment = Math.floor((angle / Math.PI) * 2) + 2,
    diagonal = ((1 / 2) * segment + 1 / 4) * Math.PI,
    op = Math.cos(Math.abs(diagonal - angle)) * Math.sqrt(2),
    x = op * Math.cos(angle),
    y = op * Math.sin(angle);

  return {
    x1: x < 0 ? 1 : 0,
    y1: y < 0 ? 1 : 0,
    x2: x >= 0 ? x : x + 1,
    y2: y >= 0 ? y : y + 1,
  };
}

function toRadians(degrees) {
  return (degrees / 180) * Math.PI;
}

function rasterify(elem, svg, callback) {
  const url = domUrl.createObjectURL(
      new Blob([svg], { type: "image/svg+xml;charset=utf-8" })
    ),
    image = callback ? new Image() : elem.querySelector(":scope > .metal");

  if (callback) {
    image.onload = function () {
      const canvas = document.createElement("canvas"),
        context = canvas.getContext("2d", { alpha: false });

      canvas.width = 1024;
      canvas.height = 1024;
      context.drawImage(this, 0, 0);
      domUrl.revokeObjectURL(url);
      image.remove();
      callback(canvas.toDataURL());
      canvas.remove();
    };
  }
  image.src = url;
}

export const metallicss = (elem) => {
    const { offsetWidth: width, offsetHeight: height } = elem,
      { backgroundColor: background, borderRadius } = getComputedStyle(elem),
      depthValue = getComputedStyle(elem).getPropertyValue("--convexity"),
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
      rotation = inverse
        ? parseInt(
            getComputedStyle(elem).getPropertyValue("--rotation") || "0"
          ) * -1
        : getComputedStyle(elem).getPropertyValue("--rotation") || "0",
      angle =
        {
          2: -67.5,
          1: -78.75,
          0: -90,
          ["-0"]: -90,
          ["-1"]: -101.25,
          ["-2"]: -112.5,
        }[rotation] || -90,
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
      pair = angleToPoints(toRadians(angle));

    if (width === 0 || height === 0) return;
    if (elem.querySelector(":scope > .metal") === null) {
      const image = new Image();

      image.className = "metal";
      elem.append(image);
    }
    if (
      document.getElementById(
        `svg_for_filter_lustre_${fill.replace(/ /g, "")}`
      ) === null
    )
      document.body.append(
        tag("svg", {
          props: {
            id: `svg_for_filter_lustre_${fill.replace(/ /g, "")}`,
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
                tag("feBlend", {
                  props: {
                    ["color-interpolation-filters"]: "sRGB",
                    mode: "soft-light",
                    in: "color",
                    in2: "SourceGraphic",
                  },
                }),
              ],
              props: { id: `lustre_${fill.replace(/ /g, "")}` },
            }),
          ],
        })
      );
    rasterify(
      elem,
      serializer.serializeToString(
        tag("svg", {
          props: { height: 1024, width: 1024, xmlns },
          inner: [
            tag("radialGradient", {
              inner: [
                tag("stop", {
                  props: {
                    offset: "33%",
                    ["stop-color"]: "#ffc0c0",
                    ["stop-opacity"]: 1,
                  },
                }),
                tag("stop", {
                  props: {
                    offset: "100%",
                    ["stop-color"]: "#800000",
                    ["stop-opacity"]: 0,
                  },
                }),
              ],
              props: { id: "blot" },
            }),
            tag("rect", {
              props: { fill: "white", height: 1024, width: 1024 },
            }),
            tag("g", {
              inner: [
                ...Array.from({ length: 24 })
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
                tag("rect", {
                  props: {
                    fill: "url(#blot)",
                    height: 512,
                    width: 2048,
                    y: 256,
                    x: -512,
                  },
                }),
              ],
              props: { transform: "scale(0.5) translate(512,512)" },
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
                tag("linearGradient", {
                  inner: [
                    tag("stop", {
                      props: { offset: "33%", ["stop-color"]: "#e0e0e0" },
                    }),
                    tag("stop", {
                      props: { offset: "38%", ["stop-color"]: "#ffffff" },
                    }),
                    tag("stop", {
                      props: { offset: "43%", ["stop-color"]: "#c0c0c0" },
                    }),
                    tag("stop", {
                      props: { offset: "47%", ["stop-color"]: "#a0a0a0" },
                    }),
                    tag("stop", {
                      props: { offset: "49%", ["stop-color"]: "#606060" },
                    }),
                    tag("stop", {
                      props: { offset: "58%", ["stop-color"]: "#c0c0c0" },
                    }),
                    tag("stop", {
                      props: { offset: "68%", ["stop-color"]: "#808080" },
                    }),
                    tag("stop", {
                      props: { offset: "98%", ["stop-color"]: "#808080" },
                    }),
                  ],
                  props: {
                    id: "gradient",
                    x1: pair.x1,
                    x2: pair.x2,
                    y1: pair.y1,
                    y2: pair.y2,
                  },
                }),
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
    elem.style.boxShadow = inverse
      ? "inset black 0px 1000px 0px"
      : "inset black 0px 1000px 0px, #00000030 1px 2px 2px, #00000020 2px 4px 4px";
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
    if (elem.querySelector(":scope > .metal"))
      ((backdrop = elem.querySelector(":scope > .metal")) => {
        backdrop.style.filter = "";
        setTimeout(
          () =>
            (backdrop.style.filter = `url("#lustre_${fill.replace(
              / /g,
              ""
            )}") saturate(300%) brightness(1.0625) contrast(1.0625)`),
          0
        );
        backdrop.style.position = "absolute";
        backdrop.style.top = "0";
        backdrop.style.left = "0";
        backdrop.style.zIndex = "-1";
        backdrop.style.maxWidth = "200%";
        backdrop.style.maxHeight = "200%";
        backdrop.style.width = "200%";
        backdrop.style.height = "200%";
        backdrop.style.transformOrigin = "top left";
        backdrop.style.transform = "scale(0.5)";
      })();
  },
  traverse = () =>
    Array.from(document.querySelectorAll(".metallicss")).forEach(metallicss);

if (document.readyState !== "loading") traverse();
else document.addEventListener("DOMContentLoaded", traverse);

export default metallicss;
