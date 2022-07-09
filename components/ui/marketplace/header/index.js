import { EthRates, WalletBar } from '@components/ui/web3'
import { Breadcrumb } from '@components/ui/common'

const LINKS = [
  {
    href: '/marketplace',
    value: 'Buy',
  },
  {
    href: '/marketplace/courses/owned',
    value: 'My Courses',
  },
  {
    href: '/marketplace/courses/manage',
    value: 'Manage Courses',
  },
]

export default function Header() {
  return (
    <>
      <div className="pt-4">
        <WalletBar />
      </div>
      <EthRates />
      <div className="flex flex-row-reverse p-4 sm:px-6 lg:px-8">
        <Breadcrumb items={LINKS} />
      </div>
    </>
  )
}
