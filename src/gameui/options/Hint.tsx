import { useConsumer } from "../ConfigProvider";
import { HintIcon } from "../icons/HintIcon";

export const Hint = () => {
  const { gameBoard, setHintMove, isShowHint, setIsShowHint, asyncGetNextOptimalMove, checkIfFinished } = useConsumer()

  const handleClick = async () => {
    if (!isShowHint) {
      const optimalMoves = await asyncGetNextOptimalMove(gameBoard)
      // 为了方便只取第一个最优解，即使可能会有很多最优解
      setHintMove(optimalMoves[0])
    }
    setIsShowHint(!isShowHint)
  }
  const isGameFinished = checkIfFinished(gameBoard)
  return <>
    <button
      className={`btn text-xs sm:text-sm ${isGameFinished ? 'btn-disabled' : 'btn-outline btn-primary'}`}
      onClick={handleClick}
      disabled={isGameFinished}>
      {isShowHint ? '关闭' : ''}提示
      <HintIcon className="w-5 h-5" />
    </button>
  </>
}