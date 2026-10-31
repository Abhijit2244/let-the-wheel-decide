import { useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { motion } from "framer-motion";

import WheelSegment from "./WheelSegment";

interface WheelProps {
  choices: string[];
  rotation: number;
  spinning: boolean;
  selectedIndex: number | null;
  onSpinComplete: () => void;
  onSelectSegment: (index: number) => void;
  onManualRotate: (rotation: number) => void;
  onManualSelection: (index: number) => void;
}

const COLORS = [
  "#8B5CF6",
  "#EC4899",
  "#F97316",
  "#06B6D4",
  "#10B981",
  "#6366F1",
  "#EAB308",
  "#D946EF",
];

function Wheel({
  choices,
  rotation,
  spinning,
  selectedIndex,
  onSpinComplete,
  onSelectSegment,
  onManualRotate,
  onManualSelection,
}: WheelProps) {
  const radius = 180;
  const size = radius * 2;

  const toRadians = (degrees: number) =>
    (degrees * Math.PI) / 180;

  const segmentAngle =
    choices.length > 0 ? 360 / choices.length : 0;

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(
    null
  );

  const dragRef = useRef({
    pointerId: -1,
    startAngle: 0,
    startRotation: 0,
    hasMoved: false,
    suppressClick: false,
  });

  const getPointerAngle = (
    event: ReactPointerEvent<HTMLDivElement>
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    return (
      Math.atan2(event.clientY - centerY, event.clientX - centerX) *
      (180 / Math.PI)
    );
  };

  const handlePointerDown = (
    event: ReactPointerEvent<HTMLDivElement>
  ) => {
    if (spinning || choices.length < 2) return;
    if (event.button !== 0) return;

    dragRef.current = {
      pointerId: event.pointerId,
      startAngle: getPointerAngle(event),
      startRotation: rotation,
      hasMoved: false,
      suppressClick: false,
    };
  };

  const handlePointerMove = (
    event: ReactPointerEvent<HTMLDivElement>
  ) => {
    const drag = dragRef.current;

    if (spinning || drag.pointerId !== event.pointerId) return;

    const currentAngle = getPointerAngle(event);

    let delta = currentAngle - drag.startAngle;

    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    if (Math.abs(delta) > 2) {
      drag.hasMoved = true;
    }

    if (drag.hasMoved) {
      drag.suppressClick = true;
      onManualRotate(drag.startRotation + delta);
    }
  };

  const handlePointerUp = (
    event: ReactPointerEvent<HTMLDivElement>
  ) => {
    const drag = dragRef.current;

    if (drag.pointerId !== event.pointerId) return;

    if (drag.hasMoved && choices.length > 0) {
      const normalizedRotation =
        ((rotation % 360) + 360) % 360;

      const calculatedIndex =
        Math.floor(
          (360 - normalizedRotation + segmentAngle / 2) /
            segmentAngle
        ) % choices.length;

      onManualSelection(calculatedIndex);
    }

    dragRef.current.pointerId = -1;
  };

  const handlePointerCancel = (
    event: ReactPointerEvent<HTMLDivElement>
  ) => {
    if (dragRef.current.pointerId === event.pointerId) {
      dragRef.current.pointerId = -1;
    }
  };

  const handleSegmentSelect = (index: number) => {
    if (spinning) return;

    if (dragRef.current.suppressClick) {
      dragRef.current.suppressClick = false;
      return;
    }

    onSelectSegment(index);
  };

  const handleSegmentHover = (index: number | null) => {
    if (!spinning) {
      setHoveredIndex(index);
    }
  };

  const transition = {
    rotate: {
      duration: spinning ? 5 : 0,
      ease: [0.12, 0.72, 0.12, 1] as const,
    },
  };

  return (
    <div
      className={`relative mx-auto w-full max-w-90 touch-none select-none ${
        spinning
          ? "cursor-default"
          : "cursor-grab active:cursor-grabbing"
      }`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
      {/* Fixed pointer */}
      <div
        className="pointer-events-none absolute -top-4 left-1/2 z-30 -translate-x-1/2"
        aria-hidden="true"
      >
        <div className="h-0 w-0 border-x-15 border-t-28 border-x-transparent border-t-white drop-shadow-lg" />
      </div>

      <div className="relative">
        {/* Rotating wheel */}
        <motion.svg
          viewBox={`0 0 ${size} ${size}`}
          className="relative z-10 h-auto w-full overflow-visible rounded-full shadow-[0_0_65px_rgba(139,92,246,0.15)]"
          animate={{ rotate: rotation }}
          transition={transition}
          onAnimationComplete={() => {
            if (spinning) {
              onSpinComplete();
            }
          }}
        >
          <circle
            cx={radius}
            cy={radius}
            r={radius}
            fill="#292929"
            stroke="#555555"
            strokeWidth="3"
            strokeDasharray={
              choices.length === 0 ? "8 8" : "none"
            }
          />

          {choices.map((choice, index) => (
            <WheelSegment
              key={`${choice}-${index}`}
              index={index}
              total={choices.length}
              color={COLORS[index % COLORS.length]}
              radius={radius}
              selected={selectedIndex === index}
              hovered={hoveredIndex === index}
              onSelect={handleSegmentSelect}
              onHover={handleSegmentHover}
            />
          ))}

          {/* Outer rim */}
          <circle
            cx={radius}
            cy={radius}
            r={radius - 2}
            fill="none"
            stroke="#FFFFFF"
            strokeOpacity="0.3"
            strokeWidth="4"
            pointerEvents="none"
          />

          {/* Center hub */}
          <circle
            cx={radius}
            cy={radius}
            r="23"
            fill="#212121"
            stroke="#FFFFFF"
            strokeWidth="4"
            pointerEvents="none"
          />

          <circle
            cx={radius}
            cy={radius}
            r="8"
            fill="#EC4899"
            pointerEvents="none"
          />
        </motion.svg>

        {/* Upright labels */}
        <motion.svg
          viewBox={`0 0 ${size} ${size}`}
          className="pointer-events-none absolute inset-0 z-20 h-full w-full overflow-visible"
          animate={{ rotate: rotation }}
          transition={transition}
          aria-hidden="true"
        >
          {choices.map((choice, index) => {
            const middleAngle =
              index * segmentAngle - 90 + segmentAngle / 2;

            const textRadius = radius * 0.65;

            const textX =
              radius +
              textRadius * Math.cos(toRadians(middleAngle));

            const textY =
              radius +
              textRadius * Math.sin(toRadians(middleAngle));

            const displayLabel =
              choice.length > 14
                ? `${choice.substring(0, 12)}...`
                : choice;

            return (
              <g
                key={`${choice}-label-${index}`}
                transform={`translate(${textX}, ${textY})`}
              >
                <motion.g
                  animate={{ rotate: -rotation }}
                  transition={transition}
                >
                  <text
                    x="0"
                    y="0"
                    fill="#FFFFFF"
                    fontSize={Math.max(10, radius * 0.075)}
                    fontWeight="600"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {displayLabel}
                  </text>
                </motion.g>
              </g>
            );
          })}
        </motion.svg>
      </div>

      {!spinning && choices.length >= 2 && (
        <p className="mt-4 text-center text-sm font-medium text-neutral-300">
          Click a segment to select it, or drag and release to choose.
        </p>
      )}
    </div>
  );
}

export default Wheel;