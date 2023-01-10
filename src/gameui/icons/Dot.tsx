import React, { ComponentPropsWithoutRef } from 'react'

export type DotIconProps = ComponentPropsWithoutRef<'svg'>

export const DotIcon = (props: DotIconProps) => {
  return (
    <svg viewBox="0 0 256 256" {...props}>
      <path className='stroke-[10] stroke-slate-100' d="M224 16c8.837 0 16 7.163 16 16v192c0 8.837-7.163 16-16 16H32c-8.837 0-16-7.163-16-16V32c0-8.837 7.163-16 16-16h192zm-8 24H40v176h176V40z"></path>
    </svg>
  )
}