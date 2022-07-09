import {
  Avatar,
  Box,
  Button,
  Center,
  HStack,
  Icon,
  Skeleton,
  Table,
  TableProps,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
} from '@chakra-ui/react'
import {
  SortingState,
  createTable,
  getCoreRowModel,
  getSortedRowModel,
  useTableInstance,
} from '@tanstack/react-table'
import Fuse from 'fuse.js'
import { useRouter } from 'next/router'
import * as React from 'react'
import { FaBoxOpen, FaSortDown, FaSortUp } from 'react-icons/fa'

import { DecDisplay } from '@/components/NumberDisplay'
import { useAccountAddress } from '@/hooks'

import { Validator, useValidators } from './hooks'

export interface ValidatorTableProps extends TableProps {
  keyword: string
}

const table = createTable().setRowType<Validator>()

export const ValidatorTable = ({ keyword, ...props }: ValidatorTableProps) => {
  const router = useRouter()
  const address = useAccountAddress()
  const { data } = useValidators(address?.mer())

  const dataFuse = React.useMemo(
    () =>
      new Fuse(data, {
        includeScore: false,
        keys: ['description.moniker'],
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(data)]
  )
  const filterResult = React.useMemo(
    () => (keyword ? dataFuse.search(keyword).map(({ item }) => item) : data),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(data), dataFuse, keyword]
  )

  const [sorting, setSorting] = React.useState<SortingState>([])

  const columns = React.useMemo(
    () => [
      table.createDataColumn('description', {
        header: () => <Text>Moniker</Text>,
        cell: ({ getValue, row: { original } }) => (
          <Skeleton isLoaded={!!data}>
            <HStack spacing="3">
              {/* TODO */}
              <Avatar name={getValue()?.moniker} src="" boxSize="10" />
              <Text fontSize="md" fontWeight="medium">
                {getValue()?.moniker}
              </Text>
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
          <Skeleton isLoaded={!!data}>
            <Text color="muted" textAlign="end">
              <DecDisplay value={getValue()} precision={2} percentage />
            </Text>
          </Skeleton>
        ),
      }),
      // TODO: ve lock
      table.createDataColumn('delegation', {
        header: 'Delegated',
        cell: ({ getValue, row }) => (
          <Skeleton isLoaded={!!data}>
            <Text color="muted" textAlign="end">
              <DecDisplay value={getValue()?.amount} />{' '}
              {getValue()?.denom.toUpperCase()}
            </Text>
          </Skeleton>
        ),
      }),
      table.createDataColumn('rewards', {
        header: 'Rewards',
        cell: ({ getValue, row }) => (
          <Skeleton isLoaded={!!data}>
            <Text color="muted" textAlign="end">
              <DecDisplay value={getValue()?.amount} />{' '}
              {getValue()?.denom.toUpperCase()}
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
      table.createDataColumn('rewards', {
        id: 'action',
        header: '',
        enableSorting: false,
        cell: () => (
          <HStack>
            <Button variant="ghost" size="sm">
              Delegate
            </Button>
            <Button variant="ghost" size="sm">
              Withdraw
            </Button>
          </HStack>
        ),
      }),
    ],
    [data]
  )

  const { getHeaderGroups, getRowModel } = useTableInstance(table, {
    columns,
    data: filterResult,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const gotoValidator = async (address: string) => {
    await router.push(`/validators/${address}`)
  }

  return (
    <Table {...props}>
      <Thead>
        {getHeaderGroups().map(({ id, headers }) => (
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
                    {column.getCanSort() && (
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
                          opacity={
                            column.getIsSorted() === 'desc' ? '1' : '0.2'
                          }
                        />
                      </Box>
                    )}
                  </Center>
                </Button>
              </Th>
            ))}
          </Tr>
        ))}
      </Thead>
      <Tbody>
        {!data &&
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
        {getRowModel().rows.map(({ original, getVisibleCells }) => (
          <Tr
            key={original!.operatorAddress}
            onClick={() => gotoValidator(original!.operatorAddress)}
            _hover={{ cursor: 'pointer' }}
          >
            {getVisibleCells().map(({ id, renderCell }) => (
              <Td key={id}>{renderCell()}</Td>
            ))}
          </Tr>
        ))}
        {data && getRowModel().rows.length <= 0 && (
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
