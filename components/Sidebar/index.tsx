import {
  Flex,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import { BsCurrencyExchange } from 'react-icons/bs'
import { FiActivity, FiCamera, FiFilm, FiSearch } from 'react-icons/fi'
import { IoMdSwap } from 'react-icons/io'
import { GiWallet, GiVote } from 'react-icons/gi'
import { RiGovernmentLine, RiCurrencyFill } from 'react-icons/ri'
import { TbGauge } from 'react-icons/tb'
import { NavButton } from '@/components/Sidebar/NavButton'
import { Logo } from '@/components/Logo'
import { Social } from '@/components/Sidebar/Social'

interface SidebarProps {
  onButtonClick?: () => void
}

export const Sidebar = ({ onButtonClick = () => {} }: SidebarProps) => {
  const inputColor = useColorModeValue('bg-accent', 'muted')
  const textColor = useColorModeValue('on-accent-muted', 'muted')

  return (
    <Flex as="section" minH="100vh" bg="bg-canvas">
      <Flex
        flex="1"
        bg={useColorModeValue('bg-accent', 'bg-surface')}
        color={useColorModeValue('on-accent', 'white')}
        overflowY="auto"
        boxShadow={useColorModeValue('sm', 'sm-dark')}
        maxW={{ base: 'full', sm: '2xs' }}
        py={{ base: '4', sm: '6' }}
        px={{ base: '4', sm: '6' }}
      >
        <Stack justify="space-between" spacing="1" width="full">
          <Stack spacing="4" shouldWrapChildren>
            <Logo />
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <Icon as={FiSearch} color={inputColor} boxSize="5" />
              </InputLeftElement>
              <Input
                placeholder="Search"
                color={inputColor}
                _placeholder={{ color: inputColor }}
              />
            </InputGroup>
            <Stack spacing="1">
              <NavButton
                href="/portfolio"
                label="Portfolio"
                icon={GiWallet}
                onClick={onButtonClick}
              />
            </Stack>
            <Stack>
              <Text fontSize="sm" color={textColor} fontWeight="medium">
                Stablecoin
              </Text>
              <Stack spacing="1">
                <NavButton
                  href="/stablecoin-view"
                  label="General View"
                  icon={RiCurrencyFill}
                  onClick={onButtonClick}
                />
                <NavButton
                  href="/backing"
                  label="Backing"
                  icon={IoMdSwap}
                  onClick={onButtonClick}
                />
                <NavButton
                  href="/collateral"
                  label="Collateral"
                  icon={BsCurrencyExchange}
                  onClick={onButtonClick}
                />
              </Stack>
            </Stack>
            <Stack>
              <Text fontSize="sm" color={textColor} fontWeight="medium">
                Voting Escrow
              </Text>
              <Stack spacing="1">
                <NavButton
                  href="/venft"
                  label="veNFT"
                  icon={GiVote}
                  onClick={onButtonClick}
                />
                <NavButton
                  href="/gauge"
                  label="Gauge"
                  icon={TbGauge}
                  onClick={onButtonClick}
                />
              </Stack>
            </Stack>
            <Stack>
              <Text fontSize="sm" color={textColor} fontWeight="medium">
                Staking
              </Text>
              <Stack spacing="1">
                <NavButton
                  href="/stake"
                  label="Stake"
                  icon={FiFilm}
                  onClick={onButtonClick}
                />
                <NavButton
                  href="/validators"
                  label="Validators"
                  icon={FiCamera}
                  onClick={onButtonClick}
                />
              </Stack>
            </Stack>
            <Stack spacing="1">
              <Text fontSize="sm" color={textColor} fontWeight="medium">
                Governance
              </Text>
              <Stack spacing="1">
                <NavButton
                  href="/governance"
                  label="Governance"
                  icon={RiGovernmentLine}
                  onClick={onButtonClick}
                />
              </Stack>
            </Stack>
            <Stack spacing="1">
              <Text fontSize="sm" color={textColor} fontWeight="medium">
                Activity
              </Text>
              <Stack spacing="1">
                <NavButton
                  href="/activity"
                  label="Activity"
                  icon={FiActivity}
                  onClick={onButtonClick}
                />
              </Stack>
            </Stack>
            <Stack>
              <Text fontSize="sm" color={textColor} fontWeight="medium">
                Social
              </Text>
              <Stack spacing="1">
                <Social />
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </Flex>
    </Flex>
  )
}
