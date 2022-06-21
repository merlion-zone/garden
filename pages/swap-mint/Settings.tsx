import {
  Text,
  Stack,
  useColorModeValue,
  HStack,
  Switch,
  Button,
  Input,
  InputGroup,
  InputRightElement,
  InputLeftElement,
} from '@chakra-ui/react'
import { useSwapMintSettings } from '@/hooks/useSetting'
import { WarningTwoIcon } from '@chakra-ui/icons'
import { Dec } from '@merlionzone/merlionjs'
import { useEffect, useState } from 'react'
import { Hint } from '@/components/Hint'

export const Settings = () => {
  const { slippageTolerance, setSlippageTolerance, expertMode, setExpertMode } =
    useSwapMintSettings()

  const [slippageFrontrun, setSlippageFrontrun] = useState(false)
  const [slippageInvalid, setSlippageInvalid] = useState(false)
  useEffect(() => {
    if (!slippageTolerance) {
      setSlippageFrontrun(false)
      setSlippageInvalid(false)
    } else {
      const slippage = new Dec(slippageTolerance)
      setSlippageFrontrun(slippage.greaterThan(1))
      setSlippageInvalid(slippage.greaterThan(50))
    }
  }, [slippageTolerance])

  const inputBorderColor = (useColorModeValue as any)(
    ...(!slippageTolerance
      ? ['gray.300', 'gray.600']
      : ['brand.300', 'brand.300'])
  )
  const inputHoverBorderColor = (useColorModeValue as any)(
    ...(!slippageTolerance
      ? ['gray.400', 'gray.500']
      : ['brand.500', 'brand.200'])
  )

  return (
    <Stack
      fontSize="sm"
      py="1"
      color={useColorModeValue('gray.600', 'gray.400')}
    >
      <Stack
        p="4"
        borderRadius="lg"
        border="1px"
        borderColor={useColorModeValue('gray.300', 'gray.700')}
        spacing="4"
      >
        <Text fontSize="sm" fontWeight="500">
          Transaction Settings
        </Text>
        <HStack>
          <Text>Slippage tolerance</Text>
          <Hint
            hint="Your transaction will revert if the price changes unfavorably by more than this percentage."
            ariaLabel="Slippage Tolerance Tooltip"
            outlineQuestionIcon
          />
        </HStack>
        <HStack>
          <Button
            variant={slippageTolerance ? 'ghost' : 'solid'}
            size="sm"
            onClick={() => {
              setSlippageTolerance('')
            }}
          >
            Auto
          </Button>
          <InputGroup size="sm">
            {slippageFrontrun && (
              <InputLeftElement>
                <WarningTwoIcon color={slippageInvalid ? 'red' : 'orange'} />
              </InputLeftElement>
            )}
            <Input
              placeholder="0.5"
              textAlign="right"
              variant="outline"
              sx={{ paddingInlineEnd: '28px' }}
              borderColor={inputBorderColor}
              _hover={{ borderColor: inputHoverBorderColor }}
              type="number"
              value={slippageTolerance}
              onChange={(event) => {
                setSlippageTolerance(event.target.value)
              }}
              onBlur={(event) => {
                if (event.target.value) {
                  const slippage = new Dec(event.target.value).toDecimalPlaces(
                    2
                  )
                  if (slippage.lessThanOrEqualTo(50)) {
                    setSlippageTolerance(slippage.toString())
                  } else {
                    setSlippageTolerance('')
                  }
                }
              }}
            ></Input>
            <InputRightElement>
              <Text>%</Text>
            </InputRightElement>
          </InputGroup>
        </HStack>
        {slippageInvalid ? (
          <Text color="red">Enter a valid slippage percentage</Text>
        ) : (
          slippageFrontrun && (
            <Text color="orange">Your transaction may be frontrun</Text>
          )
        )}
      </Stack>
      <Stack
        p="4"
        borderRadius="lg"
        border="1px"
        borderColor={useColorModeValue('gray.300', 'gray.700')}
        spacing="4"
      >
        <Text fontSize="sm" fontWeight="500">
          Interface Settings
        </Text>
        <HStack justify="space-between">
          <HStack>
            <Text>Expert Mode</Text>
            <Hint
              hint="Allow high price impact trades and skip the confirm screen. Use at your own risk."
              ariaLabel="Expert Mode Tooltip"
              outlineQuestionIcon
            />
          </HStack>
          <Switch
            isChecked={expertMode}
            onChange={() => setExpertMode(!expertMode)}
          ></Switch>
        </HStack>
      </Stack>
    </Stack>
  )
}
