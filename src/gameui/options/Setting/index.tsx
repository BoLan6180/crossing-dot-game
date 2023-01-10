import { useEffect, useState } from "react";
import { SettingIcon } from "../../icons/SettingIcon";
import { BoardMode, useConsumer } from "../../ConfigProvider";
import { MiniBoardInSetting } from "./MiniBoardInSetting";
import _ from 'lodash'
import type { Dot, Player } from "../../../ai/game";

const BOARD_SIZE_MAP = [
  [3, 3],
  [4, 3],
  [4, 4]
] as [number, number][]

export const difficultLevels = [
  {
    name: '入门',
    blockCount: 14,
  },
  {
    name: '简单',
    blockCount: 11,
  },
  {
    name: '中等',
    blockCount: 8,
  },
  {
    name: '困难',
    blockCount: 5,
  },
  {
    name: '极难',
    blockCount: 0,
  },
]

type PlayerMap = {
  [key: string]: Player
}

export const playerMap: PlayerMap = {
  '玩家': 'opponent',
  '电脑': 'self'
}

type SettingState = {
  boardMode: BoardMode;
  difficultyLevelName: string;
  startPlayer: Player;
  blockedDots: Dot[];
}

export const Setting = () => {

  const {
    miniBoardSize,
    boardMode,
    startPlayer,
    blockedDots,
    difficultyLevelName,
    setMiniBoardSize,
    initGameBoard,

  } = useConsumer()

  const [settingState, setSettingState] = useState<SettingState>({ difficultyLevelName, boardMode, startPlayer, blockedDots })
  const [isShowModal, setIsShowModal] = useState<boolean>(false)

  const startGame = () => {
    initGameBoard({
      startPlayer: settingState.startPlayer,
      difficultyLevelName: settingState.difficultyLevelName,
      boardMode: settingState.boardMode,
      boardSize: settingState.boardMode === 'difficultyLevelMode' ? [4, 4] : miniBoardSize,
      blockedDots: settingState.boardMode === 'difficultyLevelMode' ? [] : settingState.blockedDots
    })
    closeModal()
  }

  const closeModal = () => {
    setIsShowModal(false)
    resetValues()
  }

  const showModal = () => {
    setIsShowModal(true)
  }

  const resetValues = () => {
    setSettingState({
      difficultyLevelName,
      boardMode,
      startPlayer,
      blockedDots
    })
  }

  useEffect(() => {
    if (isShowModal) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isShowModal])

  useEffect(() => {
    resetValues()
  }, [difficultyLevelName, boardMode, startPlayer, blockedDots])


  return <div>

    <button className="btn btn-outline btn-primary text-xs sm:text-sm" onClick={showModal}>
      设置<SettingIcon className="w-5 h-5" />
    </button>

    <div className={`modal ${isShowModal ? 'modal-open' : ''}`} >
      <div className="modal-box relative">
        <label className="btn btn-sm btn-circle absolute right-2 top-2" onClick={closeModal}>✕</label>
        {/* 先后手 */}
        <div>
          <div className="text-lg font-semibold">先手</div>
          <div className="form-control flex-row justify-center">
            {Object.keys(playerMap).map(playerKey => {
              return <label key={playerKey} className="label cursor-pointer justify-center">
                <input
                  type="radio"
                  name="radio-start-player"
                  className="radio radio-primary"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSettingState({
                        ...settingState,
                        startPlayer: playerMap[playerKey]
                      })
                    }
                  }}
                  checked={playerMap[playerKey] === settingState.startPlayer}
                />
                <span className="label-text ml-1">{playerKey}</span>
              </label>
            })}
          </div>
        </div>

        <div className="divider"></div>

        {/* 棋盘设置 */}
        <div>
          <div className="text-lg font-semibold">棋盘设置</div>
          <div className="btn-group mt-3.5 w-full">
            <button
              className={`btn btn-ghost flex-1 ${settingState.boardMode === 'difficultyLevelMode' && 'btn-active'}`}
              onClick={() => {
                setSettingState({
                  ...settingState,
                  boardMode: 'difficultyLevelMode'
                })
              }}
            >
              选择难度模式
            </button>
            <button
              className={`btn btn-ghost flex-1 ${settingState.boardMode === 'customMode' && 'btn-active'}`}
              onClick={() => setSettingState({
                ...settingState,
                boardMode: 'customMode'
              })}
            >
              自定义棋盘模式
            </button>
          </div>
        </div>
        {
          settingState.boardMode === 'difficultyLevelMode' && <>
            <div className="form-control flex-col justify-center mt-3.5">
              {difficultLevels.map(difficultLevel => {
                const levelName = difficultLevel.name
                return <label key={levelName} className="label cursor-pointer justify-center">
                  <input
                    type="radio"
                    name="radio-block-mode"
                    className="radio radio-primary"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSettingState({
                          ...settingState,
                          difficultyLevelName: levelName
                        })
                      }
                    }}
                    checked={settingState.difficultyLevelName === levelName}
                  />
                  <span className="label-text ml-1">{levelName}</span>
                </label>
              })}
            </div>
          </>
        }
        {
          settingState.boardMode === 'customMode' && <>
            <div className="text-sm text-gray-400 mt-3">选择棋盘大小</div>
            <div>
              {BOARD_SIZE_MAP.map(_boardSize => {
                const row = _boardSize[0]
                const col = _boardSize[1]
                return <div
                  key={row + col + ''}
                  onClick={() => {
                    setSettingState({
                      ...settingState,
                      blockedDots: []
                    })
                    setMiniBoardSize(_boardSize)
                  }}
                  className={`badge badge-outline mr-2 cursor-pointer ${_.isEqual(miniBoardSize, _boardSize) && 'badge-primary'}`} >
                  {row + 'x' + col}
                </div>
              })}
            </div>
            <div className="text-sm text-gray-400 mt-3">点击下方棋盘中的棋子来设置障碍</div>
            <div>
              <MiniBoardInSetting
                setBlockedDots={(blockedDots) => setSettingState({
                  ...settingState,
                  blockedDots: blockedDots
                })}
                blockedDots={settingState.blockedDots}
              />
            </div>
          </>
        }

        <div className="mt-6">
          <label onClick={startGame} className="btn btn-primary">开始</label>
        </div>
      </div>
    </div>
  </div>
}

