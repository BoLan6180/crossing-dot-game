import { ExportIcon } from './icons/ExportIcon'

export const Footer = () => {
  return <div className="p-5">
    原创为 Wilson 和 James Liang，网址：
    <a href="https://jamesliang.net/" target='_blank' className="inline-flex justify-center items-center">
      https://jamesliang.net/
      <ExportIcon className="w-4 h-4 mx-0.5" />
    </a>
  </div>
}