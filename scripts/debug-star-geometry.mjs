import {
  getPointLabelBadgeGapMetrics,
  getPointLabelGapMetrics,
  getPointNumberBadgeMetrics,
} from "../client/src/pages/Star.tsx";

const indices = [1, 2, 4, 5, 7, 8, 10, 11];

for (const index of indices) {
  const pointGap = getPointLabelGapMetrics(index);
  const badgeGap = getPointNumberBadgeMetrics(index);
  const labelBadge = getPointLabelBadgeGapMetrics(index);

  console.log(JSON.stringify({
    index,
    pointEdgeGap: pointGap.edgeGap,
    pointRequired: pointGap.requiredEdgeGap,
    badgeEdgeGap: badgeGap.edgeGap,
    badgeRequired: badgeGap.requiredEdgeGap,
    badgeLabelDistance: labelBadge.distance,
    badgeLabelRequired: labelBadge.requiredDistance,
    badge: labelBadge.badge,
    box: labelBadge.box,
  }, null, 2));
}
