import { useConsumer } from "../../ConfigProvider"
import { DotIcon } from "../../icons/Dot"
import { NotAvailable } from '../../icons/NotAvailable'
import _ from 'lodash'
import { Chess, ChessStatus, findNumberOfEmptyDot } from "../../../ai/game"
import type { Dot } from "../../../ai/game";


type MiniBoardInSettingProps = {
  blockedDots: Dot[],
  setBlockedDots: (blockedDots: Dot[]) => void
}
export const MiniBoardInSetting = (props: MiniBoardInSettingProps) => {

  const { miniBoardInSetting, setMiniBoardInSetting } = useConsumer()

  const { blockedDots, setBlockedDots } = props

  const handleClick = (x: number, y: number, dot: Chess) => {
    if (findNumberOfEmptyDot(miniBoardInSetting) <= 2 && dot.status === 'empty') {
      return
    }
    const newMiniBoard = _.cloneDeep(miniBoardInSetting)
    newMiniBoard[x][y] = {
      status: dot.status === 'blocked' ? 'empty' : 'blocked'
    }

    const newBlockedDots = _.cloneDeep(blockedDots)
    if (dot.status === 'blocked') {
      _.remove(newBlockedDots, dot => dot.x === x && dot.y === y)
    } else {
      newBlockedDots.push({ x, y })
    }

    setBlockedDots(newBlockedDots)
    setMiniBoardInSetting(newMiniBoard)
  }


  return <div className="w-[50%] m-auto">
    {miniBoardInSetting.map((boardRow, x) => {
      return <div key={x} className="flex justify-around gap-x-2 mt-2">
        {
          boardRow.map((dot, y) => {
            return <DotComp key={x + y + dot.status}
              onClick={() => handleClick(x, y, dot)}
              status={dot.status}
            />
          })
        }
      </div>
    })}
    {findNumberOfEmptyDot(miniBoardInSetting) <= 2 ?
      <p className="text-sm text-gray-400 mt-3">
        至少存在两个空点
      </p>
      :
      <></>
    }
  </div>
}


export type DotProps = {
  status: ChessStatus;
  onClick?: () => void
}
export const DotComp = (props: DotProps) => {
  const { status, onClick } = props

  if (status === 'empty') return <DotIcon className="cursor-pointer h-12" onClick={onClick} />

  return <NotAvailable className="cursor-pointer h-12" onClick={onClick} />
}