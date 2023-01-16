import { InformationIcon } from './icons/InformationIcon'
import { GithubIcon } from './icons/GithubIcon'
export const Header = () => {
  const classes = {
    title: 'p-2 text-3xl ',
    description: 'p-2 text-sm text-gray-600 m-auto',
    githubIcon: 'absolute top-10 right-10 cursor-pointer'
  }
  const tooltipText = `'X'表示障碍，障碍无法被选择；'O'表示空的点，玩家通过在空的点上长按鼠标左键，不松开鼠标的同时并移动至临近空的点，然后松开鼠标，既表示完成一次划点。注：被划过的点中间的数字表示轮数。`

  return <>
    <div className={classes.title}>
      划点游戏
      <GithubIcon
        onClick={() => window.location.href = 'https://github.com/BoLan6180/crossing-dot-game'}
        className={classes.githubIcon}
      />
    </div>
    <span className={classes.description}>
      两个玩家交替用直线划点，线的起始和终点都必须落在空的点上，可以画水平直线、垂直直线、或者倾斜45°的直线。每次只能画一条线，划线至少包含一个点（包括一个点），最后划线的玩家视为输掉游戏。
      <span className='tooltip' data-tip={tooltipText}>
        <div className='flex italic'>
          操作说明
          <InformationIcon />
        </div>
      </span>
    </span>
  </>
}