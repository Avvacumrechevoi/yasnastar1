import { getPointLabelCollisionMetrics } from './client/src/pages/Star.tsx';

const labels = {
  3: 'Первый просвет',
  9: 'Узкий просвет',
};

for (const index of [3, 9]) {
  const metrics = getPointLabelCollisionMetrics(index, labels[index]);
  console.log(JSON.stringify({
    index,
    label: labels[index],
    box: metrics.box,
    point: metrics.point,
    distance: metrics.distance,
    safeDistance: metrics.safeDistance,
  }, null, 2));
}
