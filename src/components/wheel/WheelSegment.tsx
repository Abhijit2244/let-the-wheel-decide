interface WheelSegmentProps {
  index: number;
  total: number;
  color: string;
  radius: number;
  selected: boolean;
  hovered: boolean;
  onSelect: (index: number) => void;
  onHover: (index: number | null) => void;
}

function WheelSegment({
  index,
  total,
  color,
  radius,
  selected,
  hovered,
  onSelect,
  onHover,
}: WheelSegmentProps) {
  const segmentAngle = 360 / total;

  const startAngle = index * segmentAngle - 90;
  const endAngle = startAngle + segmentAngle;

  const toRadians = (degrees: number): number =>
    (degrees * Math.PI) / 180;

  const center = radius;

  const startX =
    center + radius * Math.cos(toRadians(startAngle));

  const startY =
    center + radius * Math.sin(toRadians(startAngle));

  const endX =
    center + radius * Math.cos(toRadians(endAngle));

  const endY =
    center + radius * Math.sin(toRadians(endAngle));

  const largeArcFlag = segmentAngle > 180 ? 1 : 0;

  const path = [
    `M ${center} ${center}`,
    `L ${startX} ${startY}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
    "Z",
  ].join(" ");

  return (
    <path
      d={path}
      fill={color}
      stroke={selected ? "#FFFFFF" : hovered ? "#FFFFFF" : "#212121"}
      strokeWidth={selected ? 7 : hovered ? 5 : 2}
      strokeOpacity={selected || hovered ? 1 : 0.9}
      opacity={selected ? 1 : hovered ? 1 : 0.88}
      className="cursor-pointer transition-[opacity,stroke-width] duration-150"
      onClick={() => onSelect(index)}
      onPointerEnter={() => onHover(index)}
      onPointerLeave={() => onHover(null)}
      role="button"
      aria-label={`Select ${index + 1} of ${total}`}
    />
  );
}

export default WheelSegment;