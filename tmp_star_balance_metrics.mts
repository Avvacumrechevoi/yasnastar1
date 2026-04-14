import { getPointLabelViewportMetrics } from "./client/src/pages/Star.testing";

const labels = [
  [0, "Перенос облаков"],
  [1, "Туча и"],
  [2, "Дождь"],
  [3, "Касание земли"],
  [4, "Стекание и"],
  [5, "Лужа и"],
  [6, "Растекание"],
  [7, "Болото и"],
  [8, "Река"],
  [9, "Поверхность водоёма"],
  [10, "Испарение"],
  [11, "Облако"],
] as const;

const metrics = labels.map(([index, label]) => ({
  index,
  label,
  ...getPointLabelViewportMetrics(index, label),
}));

const left = Math.min(...metrics.map(item => item.box.x));
const top = Math.min(...metrics.map(item => item.box.y));
const right = Math.max(...metrics.map(item => item.box.x + item.box.width));
const bottom = Math.max(...metrics.map(item => item.box.y + item.box.height));

const spanWidth = right - left;
const spanHeight = bottom - top;
const centerX = left + spanWidth / 2;
const centerY = top + spanHeight / 2;
const viewbox = 1800;

console.log(JSON.stringify({
  bounds: { left, top, right, bottom, spanWidth, spanHeight, centerX, centerY },
  percent: {
    left: left / viewbox * 100,
    top: top / viewbox * 100,
    right: right / viewbox * 100,
    bottom: bottom / viewbox * 100,
    spanWidth: spanWidth / viewbox * 100,
    spanHeight: spanHeight / viewbox * 100,
    centerX: centerX / viewbox * 100,
    centerY: centerY / viewbox * 100,
  },
  perLabel: metrics.map(item => ({
    index: item.index,
    label: item.label,
    x: item.box.x,
    y: item.box.y,
    width: item.box.width,
    height: item.box.height,
    left: item.box.x / viewbox * 100,
    top: item.box.y / viewbox * 100,
    right: (item.box.x + item.box.width) / viewbox * 100,
    bottom: (item.box.y + item.box.height) / viewbox * 100,
  })),
}, null, 2));
