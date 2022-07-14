import { useEffect } from 'react'
import useSWR from 'swr'

const adminAddresses = {
  '0xa09fcde252b0087768659812866c2db5ad450d306459f224d1e1de93308ea9c7': true,
}

// const adminAddresses = {
//   '0xcAAD19BB9De5ae90Ac1e765081698260c9E691e9': true,
// }

export const handler = (web3, provider) => () => {
  const { data, mutate, ...rest } = useSWR(
    () => (web3 ? 'web3/accounts' : null),
    async () => {
      const accounts = await web3.eth.getAccounts()
      const account = accounts[0]

      if (!account) {
        throw new Error(
          'Cannot retreive an account. Please refresh the browser.',
        )
      }

      return account
    },
  )

  useEffect(() => {
    const mutator = (accounts) => mutate(accounts[0] ?? null)
    provider?.on('accountsChanged', mutator)

    return () => {
      provider?.removeListener('accountsChanged', mutator)
    }
  }, [provider])

  return {
    data,
    isAdmin: (data && adminAddresses[web3.utils.keccak256(data)]) ?? false,
    // isAdmin: (data && adminAddresses[data]) ?? false,
    mutate,
    ...rest,
  }
}
