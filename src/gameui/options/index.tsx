import { Setting } from './Setting'
import { Hint } from './Hint'
import { Restart } from './Restart'
import { Change } from './Change'

export const Options = () => {
  return <div className='flex flex-wrap justify-center mt-8 gap-4'>
    <Setting />
    <Hint />
    <Restart />
    <Change />
  </div>
}