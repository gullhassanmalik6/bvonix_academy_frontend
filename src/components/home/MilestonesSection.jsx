import React, { useEffect, useRef, useState } from 'react';
import { siteSettingsService } from '../../services/siteSettingsService';

function wavePath(points) {
  if (!points.length) return '';
  let d = 'M 0 60';
  let previous = { x: 0, y: 60 };
  points.forEach((point) => {
    const cx = (previous.x + point.x) / 2;
    d += ` Q ${cx} ${previous.y}, ${point.x} ${point.y}`;
    previous = point;
  });
  const last = points[points.length - 1];
  d += ` Q ${(last.x + 1000) / 2} ${last.y}, 1000 60`;
  return d;
}

const MilestonesSection = () => {
  const [items, setItems] = useState([]);
  const stageRef = useRef(null);
  const lineRef = useRef(null);
  const dotRefs = useRef([]);
  const frameRef = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    siteSettingsService
      .getSiteSettings()
      .then((data) => {
        const list = data?.milestones_items || siteSettingsService.MILESTONES_DEFAULTS.milestones_items;
        setItems(Array.isArray(list) && list.length > 0 ? list : siteSettingsService.MILESTONES_DEFAULTS.milestones_items);
      })
      .catch(() => setItems(siteSettingsService.MILESTONES_DEFAULTS.milestones_items));
  }, []);

  const points = items.map((item, index) => ({
    ...item,
    x: items.length <= 1 ? 500 : 70 + (index / (items.length - 1)) * 860,
    y: index % 2 === 0 ? 38 : 86,
  }));

  const applyLift = () => {
    frameRef.current = 0;
    const pointer = pointerRef.current;
    let strongest = 0;
    dotRefs.current.forEach((dot) => {
      if (!dot) return;
      const sphere = dot.querySelector('.milestone-sphere');
      const shadow = dot.querySelector('.milestone-shadow');
      if (!sphere || !shadow) return;
      const rect = dot.getBoundingClientRect();
      const distance = Math.hypot(
        pointer.x - (rect.left + rect.width / 2),
        pointer.y - (rect.top + rect.height / 2)
      );
      const influence = pointer.active ? Math.max(0, 1 - distance / 220) : 0;
      strongest = Math.max(strongest, influence);
      const lift = influence * 52;
      const scale = 1 + influence * 0.45;
      sphere.style.transition = pointer.active ? 'transform 0.08s linear, box-shadow 0.08s linear' : 'transform 0.45s ease, box-shadow 0.45s ease';
      shadow.style.transition = pointer.active ? 'transform 0.08s linear, opacity 0.08s linear' : 'transform 0.45s ease, opacity 0.45s ease';
      sphere.style.transform = `translateY(${-lift}px) scale(${scale})`;
      sphere.style.boxShadow = influence > 0.08
        ? `inset -5px -7px 8px rgba(0,0,0,0.4), inset 3px 3px 6px rgba(255,255,255,0.9), 0 ${12 + influence * 20}px ${16 + influence * 18}px rgba(229,57,53,${0.25 + influence * 0.4})`
        : 'inset -5px -7px 8px rgba(0,0,0,0.4), inset 3px 3px 6px rgba(255,255,255,0.85), 0 8px 10px rgba(10,22,40,0.22)';
      shadow.style.transform = `translateX(-50%) scale(${1 - influence * 0.65}, ${1 - influence * 0.4})`;
      shadow.style.opacity = String(0.45 * (1 - influence * 0.7));
    });
    if (lineRef.current) {
      lineRef.current.style.stroke = strongest > 0.25 ? '#E57373' : '#D1D1D1';
      lineRef.current.style.strokeWidth = String(2.5 + strongest * 1.5);
    }
  };

  const onMove = (event) => {
    pointerRef.current = { x: event.clientX, y: event.clientY, active: true };
    if (!frameRef.current) frameRef.current = requestAnimationFrame(applyLift);
  };

  const onLeave = () => {
    pointerRef.current.active = false;
    if (!frameRef.current) frameRef.current = requestAnimationFrame(applyLift);
  };

  if (!items.length) {
    return (
      <section className="py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 animate-pulse">
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4">
        <div
          ref={stageRef}
          className="relative"
          style={{ perspective: '700px' }}
          onPointerMove={onMove}
          onPointerLeave={onLeave}
        >
          <div className="relative h-48 pt-10">
            <svg viewBox="0 0 1000 120" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
              <path
                ref={lineRef}
                d={wavePath(points)}
                fill="none"
                stroke="#D1D1D1"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
            {points.map((point, index) => (
              <span
                key={`${point.value}-${index}`}
                ref={(node) => {
                  dotRefs.current[index] = node;
                }}
                className="milestone-dot"
                style={{ left: `${(point.x / 1000) * 100}%`, top: `${(point.y / 120) * 100}%` }}
              >
                <span className="milestone-shadow" />
                <span className="milestone-sphere" />
              </span>
            ))}
          </div>

          <div
            className="relative z-10 grid gap-x-2 gap-y-3 pt-6"
            style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
          >
            {items.map((item, index) => (
              <div key={index} className="min-w-0 text-center">
                <p className="text-primary-500 font-bold text-base sm:text-2xl lg:text-4xl leading-tight">
                  {item.value || ''}
                </p>
                <p className="text-[#1F1F1F] text-[11px] sm:text-sm lg:text-base mt-1 font-medium leading-snug">
                  {item.label || ''}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MilestonesSection;
