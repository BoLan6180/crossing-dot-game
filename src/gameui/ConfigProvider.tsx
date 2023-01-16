import _ from "lodash";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Board, getNextOptimalMove, initGame } from '../ai/game'
import type { Chess, Dot, Player } from '../ai/game'
import { difficultLevels } from "./options/Setting";

export type BoardMode = 'difficultyLevelMode' | 'customMode'

type InitGameBoard = {
  startPlayer?: Player;
  blockCount?: number;
  boardMode?: BoardMode;
  difficultyLevelName?: string;
  boardSize?: [number, number];
  blockedDots?: Dot[];
}

export type ContextValue = {
  /* 棋盘大小，[3,4] 表示3行4列 */
  boardSize: [number, number];
  /* 设置棋盘大小 */
  setBoardSize: React.Dispatch<React.SetStateAction<[number, number]>>;
  /* 棋盘的模式，选择难度或者自定义棋盘 */
  boardMode: BoardMode,
  /* 设置棋盘的模式 */
  setBoardMode: React.Dispatch<React.SetStateAction<BoardMode>>;
  /* 难度名称 */
  difficultyLevelName: string;
  /* 设置难度名称 */
  setDifficultyLevelName: React.Dispatch<React.SetStateAction<string>>;
  /* 在设置中的迷你棋盘，不是下棋的棋盘 */
  miniBoardInSetting: Chess[][];
  /* 设置迷你棋盘 */
  setMiniBoardInSetting: React.Dispatch<React.SetStateAction<Chess[][]>>;
  /* 在设置中的迷你棋盘的大小 */
  miniBoardSize: [number, number];
  /* 设置在设置中的迷你棋盘的大小 */
  setMiniBoardSize: React.Dispatch<React.SetStateAction<[number, number]>>;
  /* 下棋的棋盘 */
  gameBoard: Chess[][];
  /* 设置下棋的棋盘 */
  setGameBoard: React.Dispatch<React.SetStateAction<Chess[][]>>;
  /* 第几轮 */
  roundCount: number;
  /* 设置第几轮 */
  setRoundCount: React.Dispatch<React.SetStateAction<number>>;
  /* 当前玩家 */
  currentPlayer: Player;
  /* 设置当前玩家 */
  setCurrentPlayer: React.Dispatch<React.SetStateAction<Player>>;
  /* 先手，玩家或者电脑 */
  startPlayer: Player;
  /* 设置先手*/
  setStartPlayer: React.Dispatch<React.SetStateAction<Player>>;
  /* 障碍 */
  blockedDots: Dot[];
  /* 设置障碍 */
  setBlockedDots: React.Dispatch<React.SetStateAction<Dot[]>>;
  /* 提示的下法 */
  hintMove: [Dot, Dot] | null;
  /* 设置提示的下法 */
  setHintMove: React.Dispatch<React.SetStateAction<[Dot, Dot] | null>>;
  /* 是否展示提示 */
  isShowHint: boolean;
  /* 设置是否展示提示 */
  setIsShowHint: React.Dispatch<React.SetStateAction<boolean>>;
  initGameBoard: (input: InitGameBoard) => void;
  resetGameBoard: () => void;
  asyncGetNextOptimalMove: (board: Board, player?: Player) => Promise<[Dot, Dot][]>,
  checkIfFinished: (board: Board,) => boolean;
}

export const ConfigProviderContext = createContext<ContextValue | null>(null);

export const useConsumer = (): ContextValue => {
  const contextValue = useContext(ConfigProviderContext);
  if (contextValue === null) {
    throw new Error(`<ConfigProvider /> not found!`);
  }
  return contextValue;
};


export type ConfigProviderProps = {
  children: React.ReactNode
}

export const ConfigProvider = (props: ConfigProviderProps) => {

  const [boardSize, setBoardSize] = useState<[number, number]>([4, 4])

  const [boardMode, setBoardMode] = useState<BoardMode>('difficultyLevelMode')

  const [difficultyLevelName, setDifficultyLevelName] = useState<string>('入门')

  const [blockedDots, setBlockedDots] = useState<Dot[]>([])

  const [roundCount, setRoundCount] = useState(1)

  const [currentPlayer, setCurrentPlayer] = useState<Player>('opponent')

  const [startPlayer, setStartPlayer] = useState<Player>('opponent')

  const [hintMove, setHintMove] = useState<[Dot, Dot] | null>(null)

  const [isShowHint, setIsShowHint] = useState<boolean>(false)

  const [gameBoard, setGameBoard] = useState<Chess[][]>([])

  const initMiniBoard = useCallback(
    (boardSize: [number, number], blockedDots: Dot[]) => initGame({ boardSize, blockedList: blockedDots })
    , [])

  const [miniBoardSize, setMiniBoardSize] = useState<[number, number]>(boardSize)
  const [miniBoardInSetting, setMiniBoardInSetting] = useState<Chess[][]>(initMiniBoard(miniBoardSize, blockedDots))


  useEffect(() => {
    setMiniBoardInSetting(initMiniBoard(miniBoardSize, blockedDots))
  }, [miniBoardSize, blockedDots])


  const initGameBoard = useCallback((input: InitGameBoard) => {
    const newStartPlayer = input.startPlayer ?? startPlayer
    const newBlockCount = input.blockCount
    const newBoardMode = input.boardMode ?? boardMode
    const newDifficultyLevelName = input.difficultyLevelName ?? difficultyLevelName
    const newBoardSize = input.boardSize ?? boardSize
    const newBlockedDots = input.blockedDots ?? blockedDots

    let newGameBoard

    if (newBoardMode === 'difficultyLevelMode') {
      const blockCount = difficultLevels.filter(difficultyLevel => difficultyLevel.name === newDifficultyLevelName)[0].blockCount
      newGameBoard = initGame({ boardSize: newBoardSize, blockedList: genRandomBlockedDot(newBoardSize[0], newBoardSize[1], newBlockCount ?? blockCount) })
    } else {
      newGameBoard = initGame({ boardSize: newBoardSize, blockedList: newBlockedDots })
    }
    setCurrentPlayer(newStartPlayer)
    setRoundCount(1)
    setGameBoard(newGameBoard)
    setBoardMode(newBoardMode)
    setDifficultyLevelName(newDifficultyLevelName)
    setStartPlayer(newStartPlayer)
    setBoardSize(newBoardMode === 'difficultyLevelMode' ? [4, 4] : newBoardSize)
    setBlockedDots(newBoardMode === 'difficultyLevelMode' ? [] : newBlockedDots)
    setIsShowHint(false)
    setHintMove(null)
  }, [boardSize, blockedDots, boardMode, startPlayer, difficultyLevelName])

  useEffect(() => {
    initGameBoard({})
  }, [])

  const resetGameBoard = useCallback(() => {
    const newGameBoard = initGame({ boardSize })
    for (let x = 0; x < boardSize[0]; x++) {
      for (let y = 0; y < boardSize[1]; y++) {
        newGameBoard[x][y].round = undefined
        if (gameBoard[x][y].status === 'blocked') {
          newGameBoard[x][y].status = 'blocked'
        }
      }
    }
    setCurrentPlayer(startPlayer)
    setRoundCount(1)
    setGameBoard(newGameBoard)
    setIsShowHint(false)
    setHintMove(null)
  }, [boardSize, startPlayer, gameBoard])

  const genRandomBlockedDot = useCallback((row: number, col: number, blockedNumber: number): Dot[] => {
    let res: Dot[] = []
    while (res.length != blockedNumber) {
      const rowIndex = Math.floor(Math.random() * row)
      const colIndex = Math.floor(Math.random() * col)
      const dot: Dot = { x: rowIndex, y: colIndex }
      res.push(dot)
      res = _.uniqWith(res, _.isEqual)
    }
    return res
  }, [])

  const asyncGetNextOptimalMove = useCallback(async (board: Board, player?: Player): Promise<[Dot, Dot][]> => {
    return new Promise((res, rej) => {
      setTimeout(() => {
        res(getNextOptimalMove({ board, player }))
      }, 0);
    })
  }, [])

  const checkIfFinished = useCallback((board: Board) => {
    if (board.length === 0) return false
    const row = board.length;
    const col = board[0].length;
    for (let i = 0; i < row; i++) {
      for (let j = 0; j < col; j++) {
        if (['empty', 'selecting'].includes(board[i][j].status)) {
          return false
        }
      }
    }
    return true
  }, [])

  const configProviderContext = useMemo<ContextValue>(
    () =>
    ({
      boardSize,
      setBoardSize,
      boardMode,
      setBoardMode,
      difficultyLevelName,
      setDifficultyLevelName,
      miniBoardInSetting,
      setMiniBoardInSetting,
      miniBoardSize,
      setMiniBoardSize,
      gameBoard,
      setGameBoard,
      roundCount,
      setRoundCount,
      currentPlayer,
      setCurrentPlayer,
      startPlayer,
      setStartPlayer,
      blockedDots,
      setBlockedDots,
      hintMove,
      setHintMove,
      isShowHint,
      setIsShowHint,
      initGameBoard,
      resetGameBoard,
      asyncGetNextOptimalMove,
      checkIfFinished
    })
    ,
    [boardSize,
      setBoardSize,
      boardMode,
      setBoardMode,
      difficultyLevelName,
      setDifficultyLevelName,
      miniBoardInSetting,
      setMiniBoardInSetting,
      miniBoardSize,
      setMiniBoardSize,
      gameBoard,
      setGameBoard,
      roundCount,
      setRoundCount,
      currentPlayer,
      setCurrentPlayer,
      startPlayer,
      setStartPlayer,
      blockedDots,
      setBlockedDots,
      hintMove,
      setHintMove,
      isShowHint,
      setIsShowHint,
      initGameBoard,
      resetGameBoard,
      asyncGetNextOptimalMove,
      checkIfFinished
    ]);

  return (
    <ConfigProviderContext.Provider value={configProviderContext}>
      {props.children}
    </ConfigProviderContext.Provider>
  );
}