import {
  SimpleGrid,
  Stack,
  StackDivider,
  Stat,
  StatLabel,
  StatNumber,
  Text,
} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import numeral from 'numeral'
import { formatDistanceToNow } from 'date-fns'
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
            <StatNumber>{numeral(data.rate).format('0.00%')}</StatNumber>
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
            <StatNumber>{numeral(data.maxRate).format('0.00%')}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Max daily change</StatLabel>
            <StatNumber>
              {numeral(data.maxChangeRate).format('0.00%')}
            </StatNumber>
          </Stat>
        </SimpleGrid>
      </Stack>
    </Card>
  )
}
