import { useConsumer } from "../ConfigProvider";
import { HandRaisedIcon } from "../icons/HandRaisedIcon";

export const Change = () => {
  const { boardMode, initGameBoard } = useConsumer()

  const handleClick = () => {
    initGameBoard({})
  }
  return boardMode === 'difficultyLevelMode' ?
    <>
      <button className="btn btn-outline btn-primary text-xs sm:text-sm" onClick={handleClick}>
        换一个<HandRaisedIcon className="w-5 h-5" />
      </button>
    </>
    :
    <></>
}