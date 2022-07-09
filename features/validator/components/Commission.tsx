import {
  SimpleGrid,
  Stack,
  StackDivider,
  Stat,
  StatLabel,
  StatNumber,
  Text,
} from '@chakra-ui/react'
import { formatDistanceToNow } from 'date-fns'

import { DecDisplay } from '@/components/NumberDisplay'

import { useCommission } from '../hooks'
import { Card } from './Card'

export interface CommissionProps {
  validatorAddress?: string
}

export function Commission({ validatorAddress }: CommissionProps) {
  const { data } = useCommission(validatorAddress)

  return (
    <Card>
      <Stack spacing="5" divider={<StackDivider />}>
        <Stack spacing="1">
          <Text fontSize="lg" fontWeight="medium">
            Commission
          </Text>
          <Text fontSize="sm" color="muted"></Text>
        </Stack>
        <SimpleGrid columns={2} gap={{ base: '5', md: '6' }}>
          <Stat>
            <StatLabel>Current rate</StatLabel>
            <StatNumber>
              <DecDisplay
                value={data.rate?.toNumber()}
                precision={2}
                percentage
              />
            </StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Last changed</StatLabel>
            <StatNumber>
              {data.updateTime
                ? formatDistanceToNow(data.updateTime, { addSuffix: true })
                : 'N/A'}
            </StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Max rate</StatLabel>
            <StatNumber>
              <DecDisplay
                value={data.maxRate?.toNumber()}
                precision={2}
                percentage
              />
            </StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Max daily change</StatLabel>
            <StatNumber>
              <DecDisplay
                value={data.maxChangeRate?.toNumber()}
                precision={2}
                percentage
              />
            </StatNumber>
          </Stat>
        </SimpleGrid>
      </Stack>
    </Card>
  )
}
