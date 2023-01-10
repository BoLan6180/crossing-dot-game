import React, { ComponentPropsWithoutRef } from 'react'

export type NotSelectedChessProps = ComponentPropsWithoutRef<'svg'>
export const NotSelectedChess = (props: NotSelectedChessProps) => {
  return (
    <svg viewBox="0 0 256 256" {...props}>
      <path className='stroke-[10] stroke-slate-100' d="M128 8c66.274 0 120 53.726 120 120s-53.726 120-120 120S8 194.274 8 128 61.726 8 128 8zm0 24c-53.02 0-96 42.98-96 96s42.98 96 96 96 96-42.98 96-96-42.98-96-96-96z"></path>
    </svg>
  )
}