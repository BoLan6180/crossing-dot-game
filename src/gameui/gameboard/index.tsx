import React, { useEffect, useRef, useState } from "react";
import { Board, checkIfFinished, makeMove, Dot, getPassedDotFromMove } from "../../ai/game";
import { Chess } from './Chess'

import _ from 'lodash'
import { useConsumer } from "../ConfigProvider";
import { difficultLevels } from "../options/Setting";


/**
 * self：电脑、ai，颜色为黄色
 * opponent：真人玩家，颜色为绿色
 */

export const GameBoard = () => {

  const isSelectingRef = useRef<boolean | null>(null)
  const snapshotBeforeSelectingRef = useRef<Board | null>(null)

  const {
    gameBoard,
    boardMode,
    difficultyLevelName,
    roundCount,
    currentPlayer,
    hintMove,
    isShowHint,
    setGameBoard,
    initGameBoard,
    resetGameBoard,
    setRoundCount,
    setCurrentPlayer,
    setIsShowHint,
    asyncGetNextOptimalMove
  } = useConsumer()

  const [isShowModal, setIsShowModal] = useState<boolean>(false)
  const [selectedFirstChess, setSelectedFirstChess] = useState<Dot | null>(null)
  const [hintDots, setHintDots] = useState<Dot[]>([])

  const onOk = () => {
    setIsShowModal(false)
    resetGameBoard()
  }

  const goToNextLevel = (nextLevel: number) => {
    const { blockCount } = difficultLevels[nextLevel]
    setIsShowModal(false)
    initGameBoard({
      blockCount,
      difficultyLevelName: difficultLevels[nextLevel].name
    })
  }

  const handleBodyPointerUp = () => {
    if (isSelectingRef.current) {
      setSelectedFirstChess(null)
      isSelectingRef.current = false
      setGameBoard(snapshotBeforeSelectingRef.current!)
    }
  }

  const isValidLine = (dotA: Dot, dotB: Dot): boolean => {
    if (dotA.x === dotB.x) return true
    if (dotA.y === dotB.y) return true
    if (Math.abs(dotA.x - dotB.x) === Math.abs(dotA.y - dotB.y)) {
      return true
    }
    return false
  }

  useEffect(() => {

    document.body.addEventListener('pointerup', handleBodyPointerUp)

    return () => {
      document.body.removeEventListener('pointerup', handleBodyPointerUp)
    }
  }, [])

  useEffect(() => {
    if (hintMove) {
      setHintDots(getPassedDotFromMove(hintMove))
    } else {
      setHintDots([])
    }
  }, [hintMove])

  useEffect(() => {

    const task = async () => {
      if (!checkIfFinished(gameBoard)) {
        if (currentPlayer === 'self') {
          const startTime = performance.now()

          const optimalMoves = await asyncGetNextOptimalMove(gameBoard, currentPlayer)
          const endTime = performance.now()

          console.log(`Call took ${endTime - startTime} milliseconds`)
          const newBoard = _.cloneDeep(gameBoard)
          const optimalMove = optimalMoves[0]

          makeMove({
            board: newBoard,
            moveFrom: optimalMove[0],
            moveTo: optimalMove[1],
            player: currentPlayer,
            round: roundCount
          })
          setRoundCount(roundCount + 1)
          setGameBoard(newBoard)
          setCurrentPlayer('opponent')
          setHintDots([])
        }
      } else {
        // 游戏结束，打开modal
        setIsShowModal(true)
      }
    }
    task()

  }, [currentPlayer, gameBoard])


  const handlePointerDown = (x: number, y: number) => {
    if (isShowHint) setIsShowHint(false)

    if (gameBoard[x][y].status !== 'empty') return

    if (isSelectingRef) isSelectingRef.current = true

    setSelectedFirstChess({ x, y })
    snapshotBeforeSelectingRef.current = gameBoard

    const newBoard = _.cloneDeep(gameBoard)
    if (newBoard[x][y].status === 'empty') {
      newBoard[x][y].status = 'selecting'
    }
    setGameBoard(newBoard)

  }

  const handlePointerUp = (e: React.PointerEvent, x: number, y: number) => {
    e.stopPropagation()

    if (isSelectingRef.current && selectedFirstChess) {
      // 变为selecting状态的前提是已经检查过是validline，所以不用检查validline
      if (gameBoard[x][y].status === 'selecting') {
        const newBoard = _.cloneDeep(gameBoard)
        const passedDots = getPassedDotFromMove([selectedFirstChess, { x, y }])
        for (let dot of passedDots) {
          const { x, y } = dot
          newBoard[x][y].status = 'opponent'
          newBoard[x][y].round = roundCount
        }
        setRoundCount(roundCount + 1)
        setGameBoard(newBoard)
        setCurrentPlayer(currentPlayer === 'opponent' ? 'self' : 'opponent')
      } else {
        setGameBoard(snapshotBeforeSelectingRef.current!)
      }
    }
    isSelectingRef.current = false
    setSelectedFirstChess(null)

  }

  const handlePointerLeave = (x: number, y: number) => {
    if (isSelectingRef.current) {

      const newBoard = _.cloneDeep(snapshotBeforeSelectingRef.current!)
      const { x, y } = selectedFirstChess!
      newBoard[x][y].status = 'selecting'
      setGameBoard(newBoard)

    }
  }

  const handlePointerEnter = (x: number, y: number) => {
    if (isSelectingRef.current && selectedFirstChess) {
      if (gameBoard[x][y].status === 'empty' && isValidLine(selectedFirstChess, { x, y })) {
        const newBoard = _.cloneDeep(gameBoard)
        const passedDots = getPassedDotFromMove([selectedFirstChess, { x, y }])

        for (let dot of passedDots) {
          const { x, y } = dot
          if (!['empty', 'selecting'].includes(newBoard[x][y].status)) return
          newBoard[x][y].status = 'selecting'
        }
        setGameBoard(newBoard)
      }
    }
  }
  const isPlayerWin = currentPlayer === 'opponent'
  const nextLevel = difficultLevels.findIndex(difficultLevel => difficultLevel.name === difficultyLevelName) + 1

  const renderHighestHonor = () => {
    return boardMode === 'difficultyLevelMode' &&
      nextLevel === difficultLevels.length &&
      isPlayerWin ?
      <p>您已通过最高难度</p>
      :
      <></>
  }

  const renderGotoNextLevel = () => {
    return isPlayerWin &&
      boardMode === 'difficultyLevelMode' &&
      nextLevel !== difficultLevels.length ?
      <label onClick={() => goToNextLevel(nextLevel)} htmlFor="my-modal-2" className="btn btn-primary btn-outline">
        下个难度：{difficultLevels[nextLevel].name}
      </label>
      :
      <></>
  }

  return <div className="relative sm:w-[50%] m-auto">
    <div className={` modal ${isShowModal ? 'modal-open' : ''} `}>
      <div className="modal-box relative">
        <label htmlFor="my-modal-2" className="btn btn-sm btn-circle absolute right-2 top-2" onClick={() => setIsShowModal(false)}>✕</label>
        <h3 className="text-lg font-bold">游戏结束</h3>
        <p>{currentPlayer === 'self' ? '再接再厉，黄色（电脑）' : '恭喜！绿色（玩家）'}胜利</p>
        {renderHighestHonor()}
        <div className="mt-6 flex justify-around">
          <label onClick={onOk} htmlFor="my-modal-2" className="btn btn-primary btn-outline">再来一局</label>
          {renderGotoNextLevel()}
        </div>
      </div>
    </div>
    {
      boardMode === 'difficultyLevelMode' &&
      <div className="text-sm pt-3 text-gray-400 flex justify-center">
        难度：{difficultyLevelName}
      </div>
    }
    <div className="touch-none">
      {gameBoard.map((row, x) => {
        return <div key={x} className="flex justify-around mt-[5%]">
          {row.map((_, y) => {
            let className = ''
            if (isShowHint) {
              const isHintDot = hintDots.some(dot => dot.x === x && dot.y === y)
              className = isHintDot ? 'animate-bounce' : ''
            }

            return <Chess
              key={x + y + gameBoard[x][y].status}
              onPointerDown={() => handlePointerDown(x, y)}
              onPointerUp={(e) => handlePointerUp(e, x, y)}
              onPointerEnter={() => handlePointerEnter(x, y)}
              onPointerLeave={() => handlePointerLeave(x, y)}
              type={gameBoard[x][y].status}
              round={gameBoard[x][y].round}
              className={className}
            />
          })}
        </div>
      })}
    </div>

  </div>
}