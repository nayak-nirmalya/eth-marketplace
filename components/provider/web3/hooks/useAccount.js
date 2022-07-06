import { useEffect } from 'react'
import useSWR from 'swr'

const adminAddresses = {
  '0xfa0b0a34eee0c746e3c81c9f5368c14f8a0fd5fd497478c9393fd49382c518e3': true,
}

export const handler = (web3, provider) => () => {
  const { data, mutate, ...rest } = useSWR(
    () => (web3 ? 'web3/accounts' : null),
    async () => {
      const accounts = await web3.eth.getAccounts()
      return accounts[0]
    },
  )

  useEffect(() => {
    provider &&
      provider.on('accountsChanged', (accounts) => {
        mutate(accounts[0] ?? null)
      })
  }, [provider])

  return {
    data,
    isAdmin: (data && adminAddresses[web3.utils.keccak256(data)]) ?? false,
    mutate,
    ...rest,
  }
}
