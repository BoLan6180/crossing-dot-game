
import _ from 'lodash'

// AI为 self,玩家为opponent
export type Player = 'self' | 'opponent'
export type Status = 'blocked' | 'empty' | 'selecting'
export type ChessStatus = Status | Player

export type Dot = {
  x: number;
  y: number;
}

export type Chess = {
  status: ChessStatus;
  round?: number; // 在第几轮下的这一步，仅作为ui展示
}

export type Board = Chess[][]

/* 在估值函数中计算棋盘分数的最大值 */
const MAX_VALUE = 100
/* 判定棋盘为输的门槛值 */
const THRESHOLD = 20


enum DotVisitedStatus {
  NotVisited = '0',
  Visited = '1',
  Blocked = '2'
}

type GameConfig = {
  boardSize: [number, number]; // [row col]
  blockedList?: Dot[];
}
export const initGame = (gameConfig: GameConfig): Board => {
  const { boardSize, blockedList } = gameConfig
  const row = boardSize[0]
  const col = boardSize[1]

  let board = new Array(row)
  for (let i = 0; i < row; i++) {
    board[i] = new Array(col)
  }

  for (let x = 0; x < row; x++) {
    for (let y = 0; y < col; y++) {
      let chess: Chess = {
        status: checkIfInBlockedList({ blockedList, x, y }) ? 'blocked' : 'empty'
      }

      board[x][y] = chess
    }
  }
  return board
}

type CheckIfInBlockedList = {
  blockedList?: Dot[];
  x: number;
  y: number;
}
export const checkIfInBlockedList = (input: CheckIfInBlockedList): boolean => {
  const { blockedList, x, y } = input
  if (!blockedList) return false

  let blocked = false
  for (let blockedDot of blockedList) {
    if (blockedDot.x === x && blockedDot.y === y) {
      blocked = true
      break
    }
  }
  return blocked
}

type GetNextOptimalMove = {
  board: Board;
  player?: Player;
}

export const getNextOptimalMove = (input: GetNextOptimalMove): [Dot, Dot][] => {
  const {
    board,
    player = 'self',
  } = input
  // 全量拿到当前棋子下一步的方案
  const allPossibleNextMoves = getAllPossibleNextMoves(board)

  // 初始化
  const visitedPathAndScoreMap: Map<string, number> = new Map()
  let scores: number[] = [], optimalMoves = []

  const initialVisitedPath = getInitialVisitedPath(board)
  for (let possibleMove of allPossibleNextMoves) {
    const newBoard = _.cloneDeep(board)
    makeMove({
      board: newBoard,
      moveFrom: possibleMove[0],
      moveTo: possibleMove[1],
      player
    })

    const passedDotIndexArr = getPassedDotIndexFromMove(possibleMove, board[0].length)

    scores.push(minimax({
      board: newBoard,
      player: 'opponent',
      usedDepth: 1,
      visitedPath: updateVisitedPath(initialVisitedPath, passedDotIndexArr),
      visitedPathAndScoreMap
    }))
  }

  let maxScore = -Infinity
  _.forEach(scores, score => {
    if (score !== Infinity) {
      maxScore = Math.max(score, maxScore)
    }
  })

  // 如果分数最大值大于THRESHOLD，则证明有最优的下一步，将所有的最优解推入optimalMoves
  if (maxScore >= THRESHOLD) {
    scores.forEach((score, i) => {
      if (score === maxScore) {
        optimalMoves.push(allPossibleNextMoves[i])
      }
    })
  } else {
    // 没有最优的下一步，输出第一个只划了一个点的move
    const optimalMove = allPossibleNextMoves.find((move) => getNumberOfDotsPassed(move) === 1)
    optimalMoves.push(optimalMove!)
  }

  // 将下一步的最优解根据所用棋子数量从多到少排序，尽快结束游戏
  optimalMoves.sort((a, b) => {
    const aPassed = getNumberOfDotsPassed(a)
    const bPassed = getNumberOfDotsPassed(b)
    return bPassed - aPassed
  })
  return optimalMoves
}

export const getInitialVisitedPath = (board: Board) => {
  const row = board.length
  const col = board[0].length
  let res = ''
  for (let x = 0; x < row; x++) {
    for (let y = 0; y < col; y++) {
      if (board[x][y].status !== 'empty') {
        res += DotVisitedStatus.Blocked
      } else {
        res += DotVisitedStatus.NotVisited
      }
    }
  }
  return res
}

export const updateVisitedPath = (visitedPath: string, visitedIndexArr: number[]) => {
  return visitedIndexArr.reduce((tempStr, visitedIndex) => {
    return replaceAt(tempStr, visitedIndex, DotVisitedStatus.Visited)
  }, visitedPath)
}

const replaceAt = (originalStr: string, index: number, replacement: DotVisitedStatus) => {
  return originalStr.substring(0, index) + replacement + originalStr.substring(index + 1);
}


type Minimax = {
  board: Board;
  player: Player
  lastMoveFrom?: Dot; // 棋局结束时，最后一步的起始点
  lastMoveTo?: Dot; // 棋局结束时，最后一步的落点
  usedDepth: number,
  visitedPath: string;
  visitedPathAndScoreMap: Map<string, number>;
}

export const minimax = (input: Minimax): number => {
  const { board, player, lastMoveFrom, lastMoveTo, usedDepth, visitedPath, visitedPathAndScoreMap } = input

  // base condition
  if (checkIfFinished(visitedPath)) {
    return evalFinishedGame({
      lastMoveFrom: lastMoveFrom,
      lastMoveTo: lastMoveTo,
      usedDepth,
      player
    })
  }

  let value
  /** self is the maximizing player  */
  let best = player === 'self' ? -Infinity : Infinity

  let shouldStop = false
  let startDot: Dot | null = { x: 0, y: 0 }

  while (!shouldStop && startDot) {
    // 分段拿到当前棋子下一步的方案，当找到最优的方案时，则停止获取剩余方案
    const { possibleMoves, nextDot } = getPartOfPossibleNextMoves({ startDot, board })
    startDot = nextDot
    for (let move of possibleMoves) {
      // 移动棋子
      makeMove({
        board,
        moveFrom: move[0],
        moveTo: move[1],
        player
      })

      const passedDotIndexArr = getPassedDotIndexFromMove(move, board[0].length)

      const newVisitedPath = updateVisitedPath(visitedPath, passedDotIndexArr)

      // 如果移动棋子之后，棋局结束，则直接计算得分
      if (checkIfFinished(newVisitedPath)) {
        value = minimax({
          board: board,
          player: player === 'self' ? 'opponent' : 'self',
          lastMoveFrom: move[0],
          lastMoveTo: move[1],
          usedDepth: usedDepth + 1,
          visitedPath: newVisitedPath,
          visitedPathAndScoreMap
        })
      } else {
        // 查找此局面是否有被记录
        let foundResult = visitedPathAndScoreMap.get(newVisitedPath)

        if (foundResult === undefined) {
          value = minimax({
            board,
            player: player === 'self' ? 'opponent' : 'self',
            lastMoveFrom: move[0],
            lastMoveTo: move[1],
            usedDepth: usedDepth + 1,
            visitedPath: newVisitedPath,
            visitedPathAndScoreMap
          })
          // 添加记录
          if (player === 'opponent') {
            visitedPathAndScoreMap.set(newVisitedPath, value)
          } else {
            visitedPathAndScoreMap.set(newVisitedPath, MAX_VALUE - value)
          }
        } else {
          // 根据记录的值，来判断这种棋局是输还是赢，小于 THRESHOLD 为输
          // 因为估值分数是根据完成棋局时所用的步数决定的，所以现在根据到达目前这个棋局的步数获得自己的分数
          let adjustValue =
            foundResult < THRESHOLD ?
              usedDepth + 1
              :
              MAX_VALUE - (usedDepth + 1)


          if (player === 'opponent') {
            value = adjustValue
          } else {
            value = MAX_VALUE - adjustValue
          }
        }
      }

      if (player === 'self') {
        best = Math.max(best, value)
      } else {
        best = Math.min(best, value)
      }

      // 撤销棋子移动
      undoMove({
        board,
        moveFrom: move[0],
        moveTo: move[1],
      })

      if (player === 'self' && value === MAX_VALUE - (usedDepth + 1)) {
        // 找到最优方案，停止进入下一次循环
        shouldStop = true
        break
      }
      if (player === 'opponent' && value === usedDepth + 1) {
        // 找到最优方案，停止进入下一次循环
        shouldStop = true
        break
      }
    }
  }
  return best
}

export const getPassedDotIndexFromMove = (move: [Dot, Dot], colLength: number): number[] => {
  const passedDots = getPassedDotFromMove(move)
  const passedDotIndexArr: number[] = []
  _.forEach(passedDots, dot => {
    passedDotIndexArr.push(convertCoordinateToOrderedIndex({
      row: dot.x,
      col: dot.y,
      colLength
    }))
  })
  return passedDotIndexArr
}

export const getPassedDotFromMove = (move: [Dot, Dot]): Dot[] => {
  let res: Dot[] = []
  const dotA = move[0]
  const dotB = move[1]
  if (dotA.x === dotB.x && dotA.y === dotB.y) {
    return [{ x: dotA.x, y: dotA.y }]
  }

  const dotsInRow = Math.abs(dotA.x - dotB.x)
  const dotsInCol = Math.abs(dotA.y - dotB.y)

  const max = Math.max(dotsInRow, dotsInCol) + 1

  for (let i = 0; i < max; i++) {
    let newX, newY
    if (dotA.x === dotB.x) {
      newX = dotA.x
    } else {
      newX = dotA.x < dotB.x ? dotA.x + i : dotA.x - i
    }
    if (dotA.y === dotB.y) {
      newY = dotA.y
    } else {
      newY = dotA.y < dotB.y ? dotA.y + i : dotA.y - i
    }

    res.push({ x: newX, y: newY })
  }

  return res
}


type ConvertCoordinateToOrderedIndex = {
  row: number;
  col: number;
  colLength: number;
}
const convertCoordinateToOrderedIndex = (input: ConvertCoordinateToOrderedIndex) => {
  const { row, col, colLength } = input
  return row * colLength + col
}

/**
 * 
 * @param move 这一步移动的坐标，比如[{x:0,y:0},{x:2,y:2}], 表示从[0,0]移动到[2,2]
 * @returns 这一步占用的棋子数，比如[{x:0,y:0},{x:2,y:2}] 返回 3
 */
const getNumberOfDotsPassed = (move: [Dot, Dot]): number => {
  const dotA = move[0]
  const dotB = move[1]
  if (dotA.x === dotB.x && dotA.y === dotB.y) {
    return 1
  }

  const dotsInRow = Math.abs(dotA.x - dotB.x)
  const dotsInCol = Math.abs(dotA.y - dotB.y)
  return Math.max(dotsInRow, dotsInCol) + 1
}

type EvalFinishedGame = {
  lastMoveFrom?: Dot,
  lastMoveTo?: Dot,
  usedDepth: number
  player: Player // 当前的玩家、轮到的玩家
}
export const evalFinishedGame = (input: EvalFinishedGame) => {
  const { lastMoveFrom, lastMoveTo, usedDepth, player } = input

  // 最后一步是否只有一个棋子
  const isLastMoveOnlyOneDot = (!lastMoveFrom || !lastMoveTo) ?
    true
    :
    (lastMoveFrom.x === lastMoveTo.x) && (lastMoveFrom.y === lastMoveFrom.y)

  // 注意：最后一步如果是opponent，则视为self赢得游戏
  // 轮到self，但是棋局已经结束，证明self赢了
  if (player === 'self') {
    // 最后一步是一个棋子时，才是赢
    if (isLastMoveOnlyOneDot) {
      return MAX_VALUE - usedDepth
    } else {
      return usedDepth
    }
  }
  // 下一步是opponent，但是棋局已经结束了，证明self输了
  else {
    // 最后一步是一个棋子时，才是输
    if (isLastMoveOnlyOneDot) {
      return usedDepth
    } else {
      return MAX_VALUE - usedDepth
    }
  }
}

type UndoMoveInput = {
  board: Board;
  moveFrom: Dot;
  moveTo: Dot;
}
export const undoMove = (input: UndoMoveInput) => {
  const { board, moveFrom, moveTo } = input
  const passedDots = getPassedDotFromMove([moveFrom, moveTo])
  passedDots.forEach(dot => {
    const x = dot.x
    const y = dot.y
    board[x][y].status = 'empty'
  })
}

/**
 * @param board 
 * @param move 
 * @description 直接在传入的board的原引用中修改
 */
type MakeMoveInput = {
  board: Board;
  moveFrom: Dot;
  moveTo: Dot;
  player: Player;
  round?: number;
}
export const makeMove = (input: MakeMoveInput) => {
  const { board, moveFrom, moveTo, player, round } = input
  const passedDots = getPassedDotFromMove([moveFrom, moveTo])
  passedDots.forEach(dot => {
    const x = dot.x
    const y = dot.y
    board[x][y].status = player
    board[x][y].round = round
  })
}


export const findNumberOfEmptyDot = (board: Board): number => {
  let availableDot = 0
  for (let row of board) {
    for (let chess of row) {
      if (chess.status === 'empty') {
        availableDot++
      }
    }
  }
  return availableDot
}

export const getAllPossibleNextMoves = (board: Board): [Dot, Dot][] => {
  let res: [Dot, Dot][] = []
  let startDot: Dot | null = { x: 0, y: 0 }

  while (startDot) {
    const { nextDot, possibleMoves } = getPartOfPossibleNextMoves({ startDot, board })
    startDot = nextDot
    possibleMoves.forEach(move => res.push(move))
  }

  const comparator = (a: [Dot, Dot], b: [Dot, Dot]) => {
    if (a[0].x === b[1].x && a[0].y === b[1].y && a[1].x === b[0].x && a[1].y === b[0].y) return true
    else return false
  }

  return _.uniqWith(res, comparator)
}

type GetPartOfPossibleNextMovesInput = {
  startDot: Dot;
  board: Board
}
type GetPartOfPossibleNextMovesOutput = {
  possibleMoves: [Dot, Dot][]
  nextDot: Dot | null;
}
/**
 * 
 * @param input 拿到从 startDot 这个点出发的所有 move
 * @returns 
 */
export const getPartOfPossibleNextMoves = (input: GetPartOfPossibleNextMovesInput): GetPartOfPossibleNextMovesOutput => {
  const { board, startDot } = input
  const availableDot = findNumberOfEmptyDot(board)
  const row = board.length;
  const col = board[0].length;
  for (let x = startDot.x; x < row; x++) {
    for (let y = 0; y < col; y++) {
      if (x === startDot.x && y < startDot.y) continue
      if (board[x][y].status === 'empty') {
        let validMoves: [Dot, Dot][] = []
        for (let step = 1; step <= availableDot; step++) {
          const currentMoves = move(step, board, x, y)
          _.forEach(currentMoves, move => {
            // 不添加'自杀'的move。比如场上仅剩余 3 个一条直线上的点，则不把一次划 3 个点算作可能的move
            if (!(availableDot <= Math.max(row, col) && availableDot !== 1 && getNumberOfDotsPassed(move) === availableDot)) {
              validMoves.push(move)
            }
          })
          if (currentMoves.length === 0) {
            break
          }
        }
        // 添加棋子本身的这一步
        validMoves.unshift([{ x, y }, { x, y }])
        return {
          possibleMoves: validMoves,
          nextDot: getNextDot({ x, y }, row, col)
        }
      }
    }
  }
  return {
    possibleMoves: [],
    nextDot: null
  }
}

const getNextDot = (currentDot: Dot, row: number, col: number): Dot | null => {
  if (currentDot.x === row - 1 && currentDot.y === col - 1) return null
  if (currentDot.y === col - 1) return { x: currentDot.x + 1, y: 0 }
  return { x: currentDot.x, y: currentDot.y + 1 }
}

type Direction = 'top' | 'topRight' | 'right' | 'bottomRight' | 'bottom' | 'bottomLeft' | 'left' | 'topLeft'
type MoveStepTowardsDirection = {
  x: number;
  y: number;
  step: number;
  direction: Direction;
}
const moveStepTowardsDirection = (input: MoveStepTowardsDirection) => {
  const { x, y, step, direction } = input
  switch (direction) {
    case 'top': return { x: x - step, y }
    case 'topRight': return { x: x - step, y: y + step }
    case 'right': return { x, y: y + step }
    case 'bottomRight': return { x: x + step, y: y + step }
    case 'bottom': return { x: x + step, y }
    case 'bottomLeft': return { x: x + step, y: y - step }
    case 'left': return { x, y: y - step }
    case 'topLeft': return { x: x - step, y: y - step }
    default: return { x, y }
  }
}

type DirectionInput = {
  boundaryValidation: boolean;
  x: number;
  y: number;
  step: number;
  res: [Dot, Dot][];
  board: Board;
  direction: Direction
}
const checkAndAddValidMove = (input: DirectionInput) => {
  const { boundaryValidation, x, y, step, res, board, direction } = input

  if (boundaryValidation) {
    let isValid = true
    for (let i = 1; i <= step; i++) {
      const { x: newX, y: newY } = moveStepTowardsDirection({ x, y, step: i, direction })
      if (board[newX][newY].status !== 'empty') {
        isValid = false
        break
      }
    }

    if (isValid) {
      const { x: newX, y: newY } = moveStepTowardsDirection({ x, y, step, direction })
      res.push([
        { x, y },
        { x: newX, y: newY }
      ])
    }
  }
}

export const move = (step: number, board: Board, x: number, y: number): [Dot, Dot][] => {
  const row = board.length
  const col = board[0].length

  let res: [Dot, Dot][] = []
  checkAndAddValidMove({ boundaryValidation: x - step >= 0, x, y, step, res, board, direction: 'top' })
  checkAndAddValidMove({ boundaryValidation: x - step >= 0 && y + step < col, x, y, step, res, board, direction: 'topRight' })
  checkAndAddValidMove({ boundaryValidation: y + step < col, x, y, step, res, board, direction: 'right' })
  checkAndAddValidMove({ boundaryValidation: x + step < row && y + step < col, x, y, step, res, board, direction: 'bottomRight' })
  checkAndAddValidMove({ boundaryValidation: x + step < row, x, y, step, res, board, direction: 'bottom' })
  checkAndAddValidMove({ boundaryValidation: x + step < row && y - step >= 0, x, y, step, res, board, direction: 'bottomLeft' })
  checkAndAddValidMove({ boundaryValidation: y - step >= 0, x, y, step, res, board, direction: 'left' })
  checkAndAddValidMove({ boundaryValidation: x - step >= 0 && y - step >= 0, x, y, step, res, board, direction: 'topLeft' })
  return res
}

export const checkIfFinished = (visitedPath: string) => {
  return !visitedPath.includes(DotVisitedStatus.NotVisited)
}
