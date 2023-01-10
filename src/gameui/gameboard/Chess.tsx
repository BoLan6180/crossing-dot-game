import React, { ComponentPropsWithoutRef } from "react";
import { ChessStatus } from '../../ai/game'
import { NotSelectedChess } from '../icons/NotSelectedChess'
import { SelectedChess } from '../icons/SelectedChess'
import { NotAvailable } from '../icons/NotAvailable'
import { twMerge } from 'tailwind-merge'

export type ChessProps = {
  type: ChessStatus;
  round?: number;
} & ComponentPropsWithoutRef<'svg'>

export const Chess = (props: ChessProps) => {
  const { type, round, className, ...restProps } = props

  const baseClasses = 'cursor-pointer h-16'
  const finalClass = twMerge(baseClasses, className)

  let FinalChess = () => <></>

  switch (type) {
    case 'empty':
      FinalChess = () => <NotSelectedChess  className={finalClass} {...restProps} />
      break
    case 'self':
      FinalChess = () => <SelectedChess fill="orange" className={finalClass} {...restProps} />
      break
    case 'opponent':
      FinalChess = () => <SelectedChess  fill="mediumseagreen" className={finalClass} {...restProps} />
      break
    case 'selecting':
      FinalChess = () => <SelectedChess  fill="lightgreen" className={finalClass} {...restProps} />
      break
    case 'blocked':
      FinalChess = () => <NotAvailable className={finalClass} {...restProps} />
      break
    default:
      FinalChess = () => <NotSelectedChess  className={finalClass} {...restProps} />
  }

  return <div className="relative">
    <FinalChess />
    {!['blocked', 'empty'].includes(type) && <Round round={round} />}
  </div>
}

type RoundProps = {
  round?: number;
}
const Round = (props: RoundProps) => {
  const { round } = props
  return <div className="absolute top-[50%] left-[50%] -translate-y-1/2 -translate-x-1/2 text-white text-sm">{round}</div>
}