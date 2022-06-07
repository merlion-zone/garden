import { useState } from 'react'
import {
  Avatar,
  Box,
  Button,
  Center,
  HStack,
  Icon,
  Link,
  Skeleton,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
} from '@chakra-ui/react'
import {
  createTable,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useTableInstance,
} from '@tanstack/react-table'
import NextLink from 'next/link'
import numeral from 'numeral'
import Fuse from 'fuse.js'
import { FaBoxOpen, FaSortDown, FaSortUp } from 'react-icons/fa'
import { useMemo } from 'react'
import { BondStatusString } from '@/hooks'
import { useValidatorsData, Validator } from './hooks'

export interface ValidatorTableProps {
  status: BondStatusString
  keyword: string
}

const table = createTable().setRowType<Validator>()

numeral.nullFormat('N/A')

export function ValidatorTable({ status, keyword }: ValidatorTableProps) {
  const {
    data,
    missCounters,
    validatorRewards,
    isPoolLoading,
    isOracleParamsLoading,
    isValidatorsLoading,
  } = useValidatorsData(status)
  const validatorsFuse = useMemo(
    () =>
      new Fuse(data, {
        includeScore: false,
        keys: ['description.moniker'],
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(data)]
  )

  const filterResult = useMemo(
    () =>
      keyword ? validatorsFuse.search(keyword).map(({ item }) => item) : data,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [keyword, JSON.stringify(data), validatorsFuse]
  )

  const [sorting, setSorting] = useState<SortingState>([])

  const columns = useMemo(
    () => [
      table.createDataColumn('description', {
        header: () => <Text>Moniker</Text>,
        cell: ({ getValue, row: { original } }) => (
          <Skeleton isLoaded={!isValidatorsLoading}>
            <HStack spacing="3">
              {/* TODO */}
              <Avatar name={getValue()?.moniker} src="" boxSize="10" />
              <Box>
                <NextLink
                  href={`/validators/${original!.operatorAddress}`}
                  passHref
                >
                  <Link fontWeight="medium">{getValue()?.moniker}</Link>
                </NextLink>
              </Box>
            </HStack>
          </Skeleton>
        ),
        sortingFn: (a, b) => {
          const monikerA = a.original?.description?.moniker ?? ''
          const monikerB = b.original?.description?.moniker ?? ''

          if (monikerA > monikerB) return 1
          if (monikerA < monikerB) return -1

          return 0
        },
      }),
      table.createDataColumn('votingPower', {
        header: 'Voting power',
        cell: ({ getValue }) => (
          <Skeleton isLoaded={!isPoolLoading && !isValidatorsLoading}>
            <Text color="muted" textAlign="end">
              {numeral(getValue()).format('0.00%')}
            </Text>
          </Skeleton>
        ),
      }),
      table.createDataColumn('commission', {
        header: 'Commission',
        cell: ({ getValue, row }) => (
          <Skeleton isLoaded={!isValidatorsLoading}>
            <Text color="muted" textAlign="end">
              {numeral(getValue()).format('0.00%')}
            </Text>
          </Skeleton>
        ),
      }),
      table.createDataColumn('uptime', {
        header: 'Uptime',
        cell: ({ getValue, row }) => (
          <Skeleton
            isLoaded={
              !missCounters[row.index]?.isLoading && !isOracleParamsLoading
            }
          >
            <Text color="muted" textAlign="end">
              {numeral(getValue()).format('0.00%')}
            </Text>
          </Skeleton>
        ),
      }),
      table.createDataColumn('rewards', {
        header: 'Rewards',
        cell: ({ getValue, row }) => (
          <Skeleton
            isLoaded={
              !isValidatorsLoading && !validatorRewards[row.index]?.isLoading
            }
          >
            <Text color="muted" textAlign="end">
              {`${
                getValue().amount ?? 0 < 1000
                  ? numeral(getValue().amount).format('0.000000')
                  : numeral(getValue().amount).format('0.00a').toUpperCase()
              } ${getValue().denom.toUpperCase()}`}
            </Text>
          </Skeleton>
        ),
        sortingFn: (a, b) => {
          const amountA = a.original?.rewards.amount ?? 0
          const amountB = b.original?.rewards.amount ?? 0
          if (amountA > amountB) return 1
          if (amountA < amountB) return -1

          return 0
        },
      }),
    ],
    [
      isValidatorsLoading,
      isPoolLoading,
      missCounters,
      isOracleParamsLoading,
      validatorRewards,
    ]
  )

  const instance = useTableInstance(table, {
    data: filterResult,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <Table>
      <Thead>
        {instance.getHeaderGroups().map(({ id, headers }) => (
          <Tr key={id}>
            {headers.map(({ id, column, renderHeader }) => (
              <Th key={id} isNumeric={id !== 'description'}>
                <Button
                  h="unset"
                  variant="unstyled"
                  onClick={column.getToggleSortingHandler()}
                >
                  <Center>
                    {renderHeader()}
                    <Box position="relative" w="4" h="4">
                      <Icon
                        position="absolute"
                        as={FaSortUp}
                        color="muted"
                        opacity={column.getIsSorted() === 'asc' ? '1' : '0.2'}
                      />
                      <Icon
                        position="absolute"
                        as={FaSortDown}
                        color="muted"
                        opacity={column.getIsSorted() === 'desc' ? '1' : '0.2'}
                      />
                    </Box>
                  </Center>
                </Button>
              </Th>
            ))}
          </Tr>
        ))}
      </Thead>
      <Tbody>
        {isValidatorsLoading &&
          [0, 1, 2, 3].map((i) => (
            <Tr key={i}>
              <Td>
                <Skeleton>
                  <Text>&nbsp;</Text>
                </Skeleton>
              </Td>
              <Td>
                <Skeleton>
                  <Text>&nbsp;</Text>
                </Skeleton>
              </Td>
              <Td>
                <Skeleton>
                  <Text>&nbsp;</Text>
                </Skeleton>
              </Td>
              <Td>
                <Skeleton>
                  <Text>&nbsp;</Text>
                </Skeleton>
              </Td>
              <Td>
                <Skeleton>
                  <Text>&nbsp;</Text>
                </Skeleton>
              </Td>
            </Tr>
          ))}
        {instance.getRowModel().rows.map(({ original, getVisibleCells }) => (
          <Tr key={original?.operatorAddress}>
            {getVisibleCells().map(({ id, renderCell }) => (
              <Td key={id}>{renderCell()}</Td>
            ))}
          </Tr>
        ))}
        {!isValidatorsLoading && instance.getRowModel().rows.length <= 0 && (
          <Tr aria-rowspan={4}>
            <Td colSpan={5}>
              <Center minH="56">
                <VStack>
                  <Icon as={FaBoxOpen} boxSize="16" />
                  <Text color="muted">No Data</Text>
                </VStack>
              </Center>
            </Td>
          </Tr>
        )}
      </Tbody>
    </Table>
  )
}
