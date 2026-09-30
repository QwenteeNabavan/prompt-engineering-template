import React, { useState, useEffect, useCallback } from 'react'
import {
  X,
  RotateCw,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  Trophy,
  Gamepad2,
} from 'lucide-react'

interface TetrisModalProps {
  isOpen: boolean
  onClose: () => void
}

const BOARD_ROWS = 20
const BOARD_COLS = 10

// 7 Classic Tetrominoes
const TETROMINOES = [
  { id: 1, name: 'I', shape: [[1, 1, 1, 1]], color: 'bg-cyan-500 border-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.6)]' },
  { id: 2, name: 'O', shape: [[2, 2], [2, 2]], color: 'bg-yellow-400 border-yellow-200 shadow-[0_0_8px_rgba(250,204,21,0.6)]' },
  { id: 3, name: 'T', shape: [[0, 3, 0], [3, 3, 3]], color: 'bg-violet-500 border-violet-300 shadow-[0_0_8px_rgba(168,85,247,0.6)]' },
  { id: 4, name: 'S', shape: [[0, 4, 4], [4, 4, 0]], color: 'bg-emerald-500 border-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.6)]' },
  { id: 5, name: 'Z', shape: [[5, 5, 0], [0, 5, 5]], color: 'bg-rose-500 border-rose-300 shadow-[0_0_8px_rgba(244,63,94,0.6)]' },
  { id: 6, name: 'J', shape: [[6, 0, 0], [6, 6, 6]], color: 'bg-blue-500 border-blue-300 shadow-[0_0_8px_rgba(59,130,246,0.6)]' },
  { id: 7, name: 'L', shape: [[0, 0, 7], [7, 7, 7]], color: 'bg-amber-500 border-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.6)]' },
]

function rotateMatrix(matrix: number[][]): number[][] {
  const rows = matrix.length
  const cols = matrix[0].length
  const rotated = Array.from({ length: cols }, () => Array(rows).fill(0))
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      rotated[c][rows - 1 - r] = matrix[r][c]
    }
  }
  return rotated
}

function getRandomPiece() {
  const piece = TETROMINOES[Math.floor(Math.random() * TETROMINOES.length)]
  return {
    ...piece,
    shape: piece.shape.map((row) => [...row]),
  }
}

export const TetrisModal: React.FC<TetrisModalProps> = ({ isOpen, onClose }) => {
  // Board state: 20x10 grid of piece IDs (0 = empty)
  const [board, setBoard] = useState<number[][]>(() =>
    Array.from({ length: BOARD_ROWS }, () => Array(BOARD_COLS).fill(0))
  )

  // Current falling piece
  const [currentPiece, setCurrentPiece] = useState(getRandomPiece)
  const [position, setPosition] = useState({ r: 0, c: 3 })
  const [nextPiece, setNextPiece] = useState(getRandomPiece)

  // Gameplay stats
  const [score, setScore] = useState(0)
  const [lines, setLines] = useState(0)
  const [level, setLevel] = useState(1)
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('agenthub_tetris_highscore')) || 0
    } catch {
      return 0
    }
  })

  const [isGameOver, setIsGameOver] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [clearingRows, setClearingRows] = useState<number[]>([])

  // Collision detection helper
  const checkCollision = useCallback(
    (pieceShape: number[][], pos: { r: number; c: number }, currentBoard = board): boolean => {
      for (let r = 0; r < pieceShape.length; r++) {
        for (let c = 0; c < pieceShape[r].length; c++) {
          if (pieceShape[r][c] !== 0) {
            const targetR = pos.r + r
            const targetC = pos.c + c
            // Boundary checks
            if (targetR < 0 || targetR >= BOARD_ROWS || targetC < 0 || targetC >= BOARD_COLS) {
              return true
            }
            // Existing placed block check
            if (targetR >= 0 && currentBoard[targetR][targetC] !== 0) {
              return true
            }
          }
        }
      }
      return false
    },
    [board]
  )

  // Hard restart
  const restartGame = useCallback(() => {
    setBoard(Array.from({ length: BOARD_ROWS }, () => Array(BOARD_COLS).fill(0)))
    const p1 = getRandomPiece()
    const p2 = getRandomPiece()
    setCurrentPiece(p1)
    setNextPiece(p2)
    setPosition({ r: 0, c: 3 })
    setScore(0)
    setLines(0)
    setLevel(1)
    setIsGameOver(false)
    setIsPaused(false)
    setClearingRows([])
  }, [])

  // Lock piece into board & clear lines
  const lockPiece = useCallback(() => {
    const newBoard = board.map((row) => [...row])
    for (let r = 0; r < currentPiece.shape.length; r++) {
      for (let c = 0; c < currentPiece.shape[r].length; c++) {
        if (currentPiece.shape[r][c] !== 0) {
          const targetR = position.r + r
          const targetC = position.c + c
          if (targetR >= 0 && targetR < BOARD_ROWS && targetC >= 0 && targetC < BOARD_COLS) {
            newBoard[targetR][targetC] = currentPiece.id
          }
        }
      }
    }

    // Identify full rows
    const fullRows: number[] = []
    for (let r = 0; r < BOARD_ROWS; r++) {
      if (newBoard[r].every((cell) => cell !== 0)) {
        fullRows.push(r)
      }
    }

    if (fullRows.length > 0) {
      setClearingRows(fullRows)
      setTimeout(() => {
        const remainingRows = newBoard.filter((_, idx) => !fullRows.includes(idx))
        const newRows = Array.from({ length: fullRows.length }, () =>
          Array(BOARD_COLS).fill(0)
        )
        const updatedBoard = [...newRows, ...remainingRows]
        setBoard(updatedBoard)
        setClearingRows([])

        // Score based on classic rules
        const points = [0, 100, 300, 500, 800][fullRows.length] * level
        setScore((prev) => {
          const nextScore = prev + points
          if (nextScore > highScore) {
            setHighScore(nextScore)
            try {
              localStorage.setItem('agenthub_tetris_highscore', String(nextScore))
            } catch {
              // ignore
            }
          }
          return nextScore
        })

        setLines((prev) => {
          const totalLines = prev + fullRows.length
          const newLevel = Math.floor(totalLines / 10) + 1
          setLevel(newLevel)
          return totalLines
        })
      }, 150)
    } else {
      setBoard(newBoard)
    }

    // Spawn next piece
    const nextSpawnPiece = nextPiece
    const nextUpcoming = getRandomPiece()
    const spawnPos = { r: 0, c: 3 }

    if (checkCollision(nextSpawnPiece.shape, spawnPos, newBoard)) {
      setIsGameOver(true)
    } else {
      setCurrentPiece(nextSpawnPiece)
      setNextPiece(nextUpcoming)
      setPosition(spawnPos)
    }
  }, [board, currentPiece, position, nextPiece, level, highScore, checkCollision])

  // Move downwards by 1 row
  const moveDown = useCallback(() => {
    if (isGameOver || isPaused) return
    const nextPos = { ...position, r: position.r + 1 }
    if (!checkCollision(currentPiece.shape, nextPos)) {
      setPosition(nextPos)
    } else {
      lockPiece()
    }
  }, [isGameOver, isPaused, position, currentPiece, checkCollision, lockPiece])

  // Move left or right
  const moveHorizontal = useCallback(
    (dir: -1 | 1) => {
      if (isGameOver || isPaused) return
      const nextPos = { ...position, c: position.c + dir }
      if (!checkCollision(currentPiece.shape, nextPos)) {
        setPosition(nextPos)
      }
    },
    [isGameOver, isPaused, position, currentPiece, checkCollision]
  )

  // Rotate piece with wall kicks
  const rotate = useCallback(() => {
    if (isGameOver || isPaused) return
    const rotated = rotateMatrix(currentPiece.shape)
    // Try current position
    if (!checkCollision(rotated, position)) {
      setCurrentPiece((prev) => ({ ...prev, shape: rotated }))
      return
    }
    // Wall kick left
    if (!checkCollision(rotated, { ...position, c: position.c - 1 })) {
      setCurrentPiece((prev) => ({ ...prev, shape: rotated }))
      setPosition((prev) => ({ ...prev, c: prev.c - 1 }))
      return
    }
    // Wall kick right
    if (!checkCollision(rotated, { ...position, c: position.c + 1 })) {
      setCurrentPiece((prev) => ({ ...prev, shape: rotated }))
      setPosition((prev) => ({ ...prev, c: prev.c + 1 }))
      return
    }
  }, [isGameOver, isPaused, currentPiece, position, checkCollision])

  // Instant hard drop
  const hardDrop = useCallback(() => {
    if (isGameOver || isPaused) return
    let dropR = position.r
    while (!checkCollision(currentPiece.shape, { r: dropR + 1, c: position.c })) {
      dropR++
    }
    const finalPos = { r: dropR, c: position.c }
    setPosition(finalPos)

    // Lock at final position
    const newBoard = board.map((row) => [...row])
    for (let r = 0; r < currentPiece.shape.length; r++) {
      for (let c = 0; c < currentPiece.shape[r].length; c++) {
        if (currentPiece.shape[r][c] !== 0) {
          const tr = finalPos.r + r
          const tc = finalPos.c + c
          if (tr >= 0 && tr < BOARD_ROWS && tc >= 0 && tc < BOARD_COLS) {
            newBoard[tr][tc] = currentPiece.id
          }
        }
      }
    }

    const fullRows: number[] = []
    for (let r = 0; r < BOARD_ROWS; r++) {
      if (newBoard[r].every((cell) => cell !== 0)) {
        fullRows.push(r)
      }
    }

    if (fullRows.length > 0) {
      setClearingRows(fullRows)
      setTimeout(() => {
        const remainingRows = newBoard.filter((_, idx) => !fullRows.includes(idx))
        const newRows = Array.from({ length: fullRows.length }, () =>
          Array(BOARD_COLS).fill(0)
        )
        const updatedBoard = [...newRows, ...remainingRows]
        setBoard(updatedBoard)
        setClearingRows([])
        const points = [0, 100, 300, 500, 800][fullRows.length] * level
        setScore((prev) => {
          const nextScore = prev + points
          if (nextScore > highScore) {
            setHighScore(nextScore)
            try {
              localStorage.setItem('agenthub_tetris_highscore', String(nextScore))
            } catch {
              // ignore
            }
          }
          return nextScore
        })
        setLines((prev) => {
          const totalLines = prev + fullRows.length
          const newLevel = Math.floor(totalLines / 10) + 1
          setLevel(newLevel)
          return totalLines
        })
      }, 150)
    } else {
      setBoard(newBoard)
    }

    const nextSpawnPiece = nextPiece
    const nextUpcoming = getRandomPiece()
    const spawnPos = { r: 0, c: 3 }
    if (checkCollision(nextSpawnPiece.shape, spawnPos, newBoard)) {
      setIsGameOver(true)
    } else {
      setCurrentPiece(nextSpawnPiece)
      setNextPiece(nextUpcoming)
      setPosition(spawnPos)
    }
  }, [isGameOver, isPaused, position, currentPiece, checkCollision, board, level, highScore, nextPiece])

  // Timer loop for falling pieces
  useEffect(() => {
    if (!isOpen || isGameOver || isPaused) return
    const speed = Math.max(100, 750 - (level - 1) * 60)
    const interval = setInterval(moveDown, speed)
    return () => clearInterval(interval)
  }, [isOpen, isGameOver, isPaused, level, moveDown])

  // Global keyboard listener inside modal
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault()
      }

      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        moveHorizontal(-1)
      } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        moveHorizontal(1)
      } else if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') {
        moveDown()
      } else if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') {
        rotate()
      } else if (e.key === ' ') {
        hardDrop()
      } else if (e.key.toLowerCase() === 'p') {
        setIsPaused((prev) => !prev)
      } else if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, moveHorizontal, moveDown, rotate, hardDrop, onClose])

  if (!isOpen) return null

  // Compute ghost piece position
  let ghostR = position.r
  while (!checkCollision(currentPiece.shape, { r: ghostR + 1, c: position.c })) {
    ghostR++
  }

  // Generate rendered board with current piece and ghost piece
  const displayBoard = board.map((row) => [...row])

  // Render ghost piece outline
  for (let r = 0; r < currentPiece.shape.length; r++) {
    for (let c = 0; c < currentPiece.shape[r].length; c++) {
      if (currentPiece.shape[r][c] !== 0) {
        const gr = ghostR + r
        const gc = position.c + c
        if (gr >= 0 && gr < BOARD_ROWS && gc >= 0 && gc < BOARD_COLS && displayBoard[gr][gc] === 0) {
          displayBoard[gr][gc] = -currentPiece.id // Negative indicates ghost
        }
      }
    }
  }

  // Render active piece
  for (let r = 0; r < currentPiece.shape.length; r++) {
    for (let c = 0; c < currentPiece.shape[r].length; c++) {
      if (currentPiece.shape[r][c] !== 0) {
        const pr = position.r + r
        const pc = position.c + c
        if (pr >= 0 && pr < BOARD_ROWS && pc >= 0 && pc < BOARD_COLS) {
          displayBoard[pr][pc] = currentPiece.id
        }
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Dark backdrop with blur */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        aria-hidden="true"
      />

      {/* Main Tetris Dialog Box */}
      <div className="relative w-full max-w-lg rounded-2xl border border-cyan-500/40 bg-[#090d16] p-5 shadow-[0_0_50px_rgba(6,182,212,0.25)] z-10 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
              <Gamepad2 className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold tracking-tight text-white font-mono">
                  AgentHub <span className="text-cyan-400">TETRIS</span>
                </h3>
                <span className="rounded bg-cyan-950 px-1.5 py-0.5 text-[10px] font-mono text-cyan-300 border border-cyan-500/30">
                  Arcade
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                Linear/Vercel Dark Edition &bull; Keyboard: Arrows / Space
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPaused((prev) => !prev)}
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:border-slate-700 cursor-pointer"
              title={isPaused ? 'Resume (P)' : 'Pause (P)'}
            >
              {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
            </button>
            <button
              type="button"
              onClick={restartGame}
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:border-slate-700 cursor-pointer"
              title="Restart Game"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-700 cursor-pointer"
              title="Close (Esc)"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Game Layout (Grid on Left, Side Panel on Right) */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_130px] gap-4 items-start">
          {/* Tetris Board */}
          <div className="relative mx-auto rounded-xl border-2 border-slate-800 bg-black/80 p-1.5 shadow-inner">
            {/* Rows & Cols Grid */}
            <div className="grid grid-rows-[repeat(20,minmax(0,1fr))] grid-cols-[repeat(10,minmax(0,1fr))] gap-[2px] w-[200px] sm:w-[220px] h-[400px] sm:h-[440px]">
              {displayBoard.map((row, rIdx) =>
                row.map((cell, cIdx) => {
                  const isClearing = clearingRows.includes(rIdx)
                  let cellStyle = 'bg-slate-950/70 border border-slate-900/40 rounded-[2px]'

                  if (isClearing) {
                    cellStyle = 'bg-white shadow-[0_0_15px_#fff] animate-pulse rounded-[2px]'
                  } else if (cell > 0) {
                    const pieceDef = TETROMINOES.find((p) => p.id === cell)
                    cellStyle = `${pieceDef?.color || 'bg-cyan-500'} rounded-[2px] transition-transform`
                  } else if (cell < 0) {
                    // Ghost piece
                    const ghostId = Math.abs(cell)
                    const pieceDef = TETROMINOES.find((p) => p.id === ghostId)
                    cellStyle = `border border-dashed ${pieceDef?.color.split(' ')[1] || 'border-cyan-400/40'} bg-white/5 rounded-[2px]`
                  }

                  return <div key={`${rIdx}-${cIdx}`} className={cellStyle} />
                })
              )}
            </div>

            {/* Game Over Overlay */}
            {isGameOver && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-xs rounded-xl p-4 text-center space-y-3 z-20">
                <span className="text-rose-500 font-mono font-black text-2xl tracking-wider">
                  GAME OVER
                </span>
                <div className="space-y-1 font-mono text-xs">
                  <p className="text-slate-400">Final Score</p>
                  <p className="text-white text-lg font-bold">{score}</p>
                </div>
                <button
                  type="button"
                  onClick={restartGame}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:brightness-110 active:scale-95 cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Play Again</span>
                </button>
              </div>
            )}

            {/* Paused Overlay */}
            {isPaused && !isGameOver && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-xs rounded-xl text-center space-y-2 z-20">
                <span className="text-cyan-400 font-mono font-bold text-lg">PAUSED</span>
                <p className="text-xs text-slate-400 font-mono">Press P or Resume</p>
              </div>
            )}
          </div>

          {/* Right Side Panel: Next Piece, Stats, Controls */}
          <div className="space-y-3 font-mono">
            {/* Next Piece Box */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 space-y-2">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Next Piece
              </span>
              <div className="flex items-center justify-center h-14 bg-black/40 rounded-lg p-1">
                <div
                  className="grid gap-1"
                  style={{
                    gridTemplateColumns: `repeat(${nextPiece.shape[0].length}, minmax(0, 1fr))`,
                  }}
                >
                  {nextPiece.shape.map((row, r) =>
                    row.map((val, c) => (
                      <div
                        key={`${r}-${c}`}
                        className={`w-3.5 h-3.5 rounded-[2px] ${
                          val > 0 ? nextPiece.color : 'opacity-0'
                        }`}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Score & Level Counters */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 space-y-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  Score
                </span>
                <span className="text-sm font-bold text-white tracking-tight">
                  {score.toLocaleString()}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  Lines
                </span>
                <span className="text-xs font-semibold text-cyan-400">
                  {lines}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  Level
                </span>
                <span className="text-xs font-semibold text-emerald-400">
                  {level}
                </span>
              </div>

              <div className="pt-1 border-t border-slate-800 flex items-center justify-between text-[10px]">
                <span className="text-amber-400 flex items-center gap-1">
                  <Trophy className="h-3 w-3" /> Best
                </span>
                <span className="text-white font-bold">{highScore.toLocaleString()}</span>
              </div>
            </div>

            {/* Mobile / Clickable Controller Pad */}
            <div className="p-2 rounded-xl border border-slate-800 bg-slate-900/40 space-y-1.5 sm:block">
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={rotate}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 transition-colors cursor-pointer"
                  title="Rotate (Up / W)"
                >
                  <RotateCw className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex justify-between gap-1">
                <button
                  type="button"
                  onClick={() => moveHorizontal(-1)}
                  className="flex-1 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex justify-center cursor-pointer"
                  title="Move Left (Left / A)"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={moveDown}
                  className="flex-1 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex justify-center cursor-pointer"
                  title="Soft Drop (Down / S)"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveHorizontal(1)}
                  className="flex-1 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex justify-center cursor-pointer"
                  title="Move Right (Right / D)"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
              <button
                type="button"
                onClick={hardDrop}
                className="w-full py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-bold hover:bg-cyan-500/20 transition-colors cursor-pointer"
                title="Hard Drop (Space)"
              >
                HARD DROP [SPACE]
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
