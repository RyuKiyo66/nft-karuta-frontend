import { useNetwork, useAccount } from 'wagmi'
import { useState, useEffect } from 'react'
import { Box, Text, Badge, UnorderedList } from '@chakra-ui/react'
import { NotAllowedIcon } from '@chakra-ui/icons'
import { useHas1155Token } from '../hooks/'
import { useTokenURI } from '../hooks/'
import { getContractAddress } from '../utils/contractAddress'
import { detectedTokenIds, tokenIdWithKana } from '../utils/tokenIds'
import { TokenDisplay } from '../components'

export const Erc1155Balance = () => {
  const [ownedTokens, setOwnedTokens] = useState<tokenIdWithKana[]>([])
  const { chain } = useNetwork()
  const { address, isConnected } = useAccount()
  const erc1155Contract = getContractAddress({
    name: 'erc1155Contract',
    chainId: chain?.id
  })
  const addressToAdd = address ? address : ''
  let addresses = [addressToAdd]
  while (addresses.length < detectedTokenIds.length)
    addresses.push(addressToAdd)
  const { balances, isError, error } = useHas1155Token(
    erc1155Contract,
    addresses,
    detectedTokenIds.map((e) => e.tokenId)
  )
  const { processedTokenURI } = useTokenURI(
    erc1155Contract,
    ownedTokens[0]?.tokenId || '0'
  )

  useEffect(() => {
    let tokens: any = []
    balances?.map((e) => {
      tokens.push(e.gt(0))
    })
    let tokenList: tokenIdWithKana[] = []
    tokens.map((e: boolean, i: number) => {
      if (e === true) tokenList.push(detectedTokenIds[i])
    })
    setOwnedTokens(tokenList)
  }, [balances])

  if (!isConnected) return <></>
  if (isError)
    return (
      <>
        <div>Error fetching Battle NFTs</div>
        {JSON.stringify(error)}
      </>
    )
  return (
    <Box mt="1em">
      {ownedTokens.length > 0 ? (
        <>
          <Text>{ownedTokens.length} tokens owned:</Text>
          <UnorderedList>
            {ownedTokens.map((token, i) => {
              return <TokenDisplay key={i} token={token} />
            })}
          </UnorderedList>
        </>
      ) : (
        <Text>
          <Badge colorScheme="red">
            <NotAllowedIcon></NotAllowedIcon> No tokens owned
          </Badge>
        </Text>
      )}
    </Box>
  )
}
