import { useRef, useState, useEffect, RefObject } from 'react'

// Grid sizes for different breakpoints
export const GRID_SIZE_MOBILE = 18 // pixels per grid cell on mobile
export const GRID_SIZE_DESKTOP = 24 // pixels per grid cell on desktop
export const GRID_ROWS = 6 // rows in each day cell

// Breakpoint for switching grid sizes (816 = 7 columns * 4 cells * 24px + 2px border + 46px padding)
const MD_BREAKPOINT = 816

interface UseGridSnappedWidthOptions {
  columns?: number // default 7 for days of week
  borderWidth?: number // default 2 for 1px border on each side
  minCellsPerColumn?: number // minimum grid cells per column (default 6)
}

interface UseGridSnappedWidthResult {
  containerRef: RefObject<HTMLDivElement | null>
  snappedWidth: number | null
  gridSize: number
  gridHeight: number
}

export function useGridSnappedWidth(
  options: UseGridSnappedWidthOptions = {}
): UseGridSnappedWidthResult {
  const { columns = 7, borderWidth = 2, minCellsPerColumn = 6 } = options
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [snappedWidth, setSnappedWidth] = useState<number | null>(null)
  const [gridSize, setGridSize] = useState(GRID_SIZE_DESKTOP)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const updateWidth = () => {
      const availableWidth = container.offsetWidth
      const isMobile = availableWidth < MD_BREAKPOINT
      const currentGridSize = isMobile ? GRID_SIZE_MOBILE : GRID_SIZE_DESKTOP
      setGridSize(currentGridSize)

      const usableWidth = availableWidth - borderWidth
      const widthPerColumn = Math.floor(usableWidth / columns)
      const gridCellsPerColumn = Math.max(
        minCellsPerColumn,
        Math.floor(widthPerColumn / currentGridSize)
      )
      const snappedColumnWidth = gridCellsPerColumn * currentGridSize
      const totalSnappedWidth = snappedColumnWidth * columns + borderWidth
      setSnappedWidth(totalSnappedWidth)
    }

    updateWidth()
    const resizeObserver = new ResizeObserver(updateWidth)
    resizeObserver.observe(container)
    return () => resizeObserver.disconnect()
  }, [columns, borderWidth, minCellsPerColumn])

  return {
    containerRef,
    snappedWidth,
    gridSize,
    gridHeight: gridSize * GRID_ROWS,
  }
}

// Calculate a fixed width based on cells per column
export function getGridWidth(
  cellsPerColumn: number = 6,
  columns: number = 7,
  gridSize: number = GRID_SIZE_DESKTOP
): number {
  return gridSize * cellsPerColumn * columns + 2
}
