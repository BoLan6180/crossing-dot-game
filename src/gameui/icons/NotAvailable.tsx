import React, { ComponentPropsWithoutRef } from 'react'

export type NotAvailableProps = ComponentPropsWithoutRef<'svg'>
export const NotAvailable = (props: NotAvailableProps) => {
  return <svg viewBox="0 0 256 256" {...props}>
    <path className='stroke-[10] stroke-slate-100' d="M62.895 47.353L128 112.458l65.105-65.105a5.334 5.334 0 0 1 7.04-.444l.502.444 7.543 7.542a5.334 5.334 0 0 1 .443 7.04l-.444.503-65.106 65.102 66.022 66.022a5.333 5.333 0 0 1 0 7.543l-7.543 7.542a5.333 5.333 0 0 1-7.542 0L128 142.628l-66.02 66.019a5.334 5.334 0 0 1-7.04.444l-.502-.444-7.543-7.542a5.334 5.334 0 0 1-.443-7.04l.444-.503 66.016-66.022L47.81 62.438a5.333 5.333 0 0 1 0-7.542l7.543-7.543a5.333 5.333 0 0 1 7.542 0z"></path>
  </svg>
}