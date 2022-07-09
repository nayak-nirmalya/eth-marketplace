import { useWeb3 } from '@components/provider'
import { useAccount } from '@components/hooks/web3'
import { useRouter } from 'next/router'
import { ActiveLink, Button } from '@components/ui/common'

export default function Navbar() {
  const { connect, isLoading, requireInstall } = useWeb3()
  const { account } = useAccount()
  const { pathname } = useRouter()

  return (
    <section>
      <div className="relative pt-6 px-4 sm:px-6 lg:px-8">
        <nav className="relative" aria-label="Global">
          <div className="flex flex-col xs:flex-row justify-between items-center">
            <div>
              <ActiveLink href="/">
                <a className="font-medium mr-8 hover:text-gray-500">Home</a>
              </ActiveLink>

              <ActiveLink href="/marketplace">
                <a className="font-medium mr-8 hover:text-gray-500">
                  Marketplace
                </a>
              </ActiveLink>

              <ActiveLink href="/blogs">
                <a className="font-medium mr-8 hover:text-gray-500">Blog</a>
              </ActiveLink>
            </div>
            <div className="text-center">
              <ActiveLink href="/wishlist">
                <a className="font-medium sm:mr-8 mr-1 hover:text-gray-500">
                  Wishlist
                </a>
              </ActiveLink>

              {isLoading ? (
                <Button disabled={true} onClick={connect}>
                  Loading...
                </Button>
              ) : account.data ? (
                <Button
                  className="cursor-default"
                  // variant="red"
                  hoverable={false}
                >
                  Hi, There! {account.isAdmin && 'Admin'}
                </Button>
              ) : requireInstall ? (
                <Button
                  onClick={() =>
                    window.open('https://metamask.io/download/', '_blank')
                  }
                >
                  Install Metamask!
                </Button>
              ) : (
                <Button onClick={connect}>Connect</Button>
              )}
            </div>
          </div>
        </nav>
      </div>
      {account.data && !pathname.includes('marketplace') && (
        <div className="flex justify-end pt-1 sm:px-6 lg:px-8">
          <div className="text-white bg-indigo-600 rounded-md p-2">
            {account.data}
          </div>
        </div>
      )}
    </section>
  )
}
