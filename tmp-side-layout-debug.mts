import { getPointLabelCollisionMetrics } from "./client/src/pages/Star";

const labels: Record<number, string> = {
  2: "Настороженность",
  3: "Первый просвет",
  4: "Луч доверия",
  8: "Сгущение фона",
  9: "Узкий просвет",
  10: "Давление",
};

for (const index of [2, 3, 4, 8, 9, 10]) {
  const metrics = getPointLabelCollisionMetrics(index, labels[index]);
  const boxCenterY = metrics.box.y + metrics.box.height / 2;
  console.log(JSON.stringify({
    index,
    point: metrics.point,
    box: metrics.box,
    boxCenterY,
    deltaY: Number((boxCenterY - metrics.point.y).toFixed(3)),
  }));
}
