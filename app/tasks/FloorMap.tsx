'use client'

import { useMemo, useRef, useState } from 'react'
import {
  FLOORPLANS,
  type FloorPlan,
  type FloorRoom,
} from '@/app/lib/tasks-floorplans'

type Point = { x: number; y: number }

function polysToPath(polys: number[][][][], fp: FloorPlan): string {
  const tf = (x: number, y: number) =>
    `${x - fp.minx + fp.pad},${fp.maxy - y + fp.pad}`
  return polys
    .map((poly) =>
      poly
        .map((ring) => 'M' + ring.map(([x, y]) => tf(x, y)).join('L') + 'Z')
        .join(' ')
    )
    .join(' ')
}

function ringContains(x: number, y: number, ring: number[][]): boolean {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)
      inside = !inside
  }
  return inside
}

function roomAt(fp: FloorPlan, x: number, y: number): FloorRoom | null {
  for (const room of fp.rooms) {
    let hit = false
    for (const poly of room.polys)
      for (const ring of poly) if (ringContains(x, y, ring)) hit = !hit
    if (hit) return room
  }
  return null
}

export default function FloorMap({
  story,
  pin,
  interactive = false,
  onPick,
  height = 260,
}: {
  story: string
  pin?: Point | null
  interactive?: boolean
  onPick?: (p: Point) => void
  height?: number
}) {
  const fp = FLOORPLANS[story]
  const svgRef = useRef<SVGSVGElement>(null)
  const [hoverRoom, setHoverRoom] = useState<string | null>(null)

  const roomPaths = useMemo(
    () =>
      fp
        ? fp.rooms.map((r) => ({
            gid: r.gid,
            name: r.name,
            d: polysToPath(r.polys, fp),
          }))
        : [],
    [fp]
  )
  const nonroomD = useMemo(
    () => (fp ? fp.nonrooms.map((n) => polysToPath(n, fp)).join(' ') : ''),
    [fp]
  )

  if (!fp) return null

  const tf = (p: Point) => ({
    sx: p.x - fp.minx + fp.pad,
    sy: fp.maxy - p.y + fp.pad,
  })
  const pinRoom = pin ? roomAt(fp, pin.x, pin.y) : null
  const pinR = Math.round(fp.w / 65)

  function toData(ev: React.MouseEvent<SVGSVGElement>): Point | null {
    const svg = svgRef.current
    if (!svg) return null
    const ctm = svg.getScreenCTM()
    if (!ctm) return null
    const p = new DOMPoint(ev.clientX, ev.clientY).matrixTransform(
      ctm.inverse()
    )
    return {
      x: Math.round(p.x + fp.minx - fp.pad),
      y: Math.round(fp.maxy - p.y + fp.pad),
    }
  }

  const activeName =
    (pin && pinRoom?.name) ||
    (hoverRoom && fp.rooms.find((r) => r.gid === hoverRoom)?.name) ||
    null
  const caption = activeName
    ? `📍 ${activeName}`
    : pin
      ? interactive
        ? '📍 Pin set — click elsewhere to move it'
        : '📍 Marked on this floor'
      : interactive
        ? 'Click the plan to drop a pin'
        : null

  return (
    <div className="border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 p-2.5">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${fp.w} ${fp.h}`}
        style={{ height, cursor: interactive ? 'crosshair' : 'default' }}
        className="block h-auto w-full"
        onClick={
          interactive
            ? (e) => {
                const d = toData(e)
                if (d) onPick?.(d)
              }
            : undefined
        }
      >
        <path
          d={nonroomD}
          className="fill-gray-200/60 dark:fill-gray-700/50"
          fillRule="evenodd"
        />
        {roomPaths.map((r) => (
          <path
            key={r.gid}
            d={r.d}
            fillRule="evenodd"
            strokeWidth={pinRoom?.gid === r.gid ? 3 : 2}
            className={
              pinRoom?.gid === r.gid
                ? 'fill-brand/25 stroke-brand'
                : 'fill-brand/5 stroke-gray-400 dark:stroke-gray-500 hover:fill-brand/15'
            }
            onMouseEnter={interactive ? () => setHoverRoom(r.gid) : undefined}
            onMouseLeave={interactive ? () => setHoverRoom(null) : undefined}
          />
        ))}
        {pin &&
          (() => {
            const { sx, sy } = tf(pin)
            return (
              <g transform={`translate(${sx} ${sy})`}>
                <circle r={pinR * 2.2} className="fill-brand/20" />
                <circle
                  r={pinR}
                  className="fill-brand stroke-white dark:stroke-gray-900"
                  strokeWidth={pinR * 0.32}
                />
              </g>
            )
          })()}
      </svg>
      {caption && (
        <p className="mt-2 px-0.5 font-sans text-[13px] font-semibold text-gray-500 dark:text-gray-400">
          {caption}
        </p>
      )}
    </div>
  )
}
