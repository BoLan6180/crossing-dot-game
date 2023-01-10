import { useConsumer } from "../ConfigProvider";
import { RestartIcon } from "../icons/RestartIcon";

export const Restart = () => {
  const { resetGameBoard } = useConsumer()

  const handleClick = () => {
    resetGameBoard()
  }
  return <>
    <button className="btn btn-outline btn-primary text-xs sm:text-sm" onClick={handleClick}>
      重新开始<RestartIcon className="w-5 h-5" />
    </button>
  </>
}