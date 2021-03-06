import {
  Avatar,
  Box,
  Button,
  Center,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Skeleton,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
  useColorModeValue,
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
import { useState } from 'react'
import { useMemo } from 'react'
import { FaBoxOpen, FaSortDown, FaSortUp } from 'react-icons/fa'
import { FiSearch } from 'react-icons/fi'

import { DecDisplay } from '@/components/NumberDisplay'
import { BondStatusString } from '@/hooks/query'

import { Validator, useValidatorsData } from './hooks'

export interface ValidatorTableProps {
  status: BondStatusString
}

const table = createTable().setRowType<Validator>()

export function ValidatorTable({ status }: ValidatorTableProps) {
  const router = useRouter()
  const {
    data,
    missCounters,
    validatorRewards,
    isPoolLoading,
    isOracleParamsLoading,
    isValidatorsLoading,
  } = useValidatorsData(status)
  const [keyword, setKeyword] = useState('')

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
        header: () => 'Moniker',
        cell: ({ getValue, row: { original } }) => (
          <Skeleton isLoaded={!isValidatorsLoading}>
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
          <Skeleton isLoaded={!isPoolLoading && !isValidatorsLoading}>
            <Text color="muted" textAlign="end">
              <DecDisplay value={getValue()} precision={2} percentage />
            </Text>
          </Skeleton>
        ),
      }),
      table.createDataColumn('commission', {
        header: 'Commission',
        cell: ({ getValue, row }) => (
          <Skeleton isLoaded={!isValidatorsLoading}>
            <Text color="muted" textAlign="end">
              <DecDisplay value={getValue()} precision={2} percentage />
            </Text>
          </Skeleton>
        ),
      }),
      table.createDataColumn('uptime', {
        header: 'Uptime',
        cell: ({ getValue, row }) => (
          <Skeleton
            isLoaded={
              missCounters.data?.[row.index] !== undefined &&
              missCounters.data?.[row.index] !== null &&
              !isOracleParamsLoading
            }
          >
            <Text color="muted" textAlign="end">
              <DecDisplay value={getValue()} precision={2} percentage />
            </Text>
          </Skeleton>
        ),
      }),
      table.createDataColumn('rewards', {
        header: 'Rewards',
        cell: ({ getValue, row }) => (
          <Skeleton
            isLoaded={
              !!validatorRewards.data?.[row.index] && !isValidatorsLoading
            }
          >
            <Text color="muted" textAlign="end">
              <DecDisplay value={getValue().amount} />{' '}
              {getValue().denom.toUpperCase()}
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

  const gotoValidator = async (address: string) => {
    await router.push(`/validators/${address}`)
  }

  return (
    <Box
      bg="bg-surface"
      boxShadow={useColorModeValue('sm', 'sm-dark')}
      borderRadius="lg"
    >
      <Stack spacing="5">
        <Box px={{ base: '4', md: '6' }} pt="5">
          <Stack
            direction={{ base: 'column', md: 'row' }}
            justify="space-between"
          >
            <Text fontSize="lg" fontWeight="medium">
              Validators
            </Text>
            <InputGroup maxW="xs">
              <InputLeftElement pointerEvents="none">
                <Icon as={FiSearch} color="muted" boxSize="5" />
              </InputLeftElement>
              <Input
                placeholder="Search"
                onChange={(e) => setKeyword(e.target.value)}
              />
            </InputGroup>
          </Stack>
        </Box>
        <Box overflowX="auto">
          <Table>
            <Thead>
              {instance.getHeaderGroups().map(({ id, headers }) => (
                <Tr key={id}>
                  {headers.map(({ id, column, renderHeader }) => (
                    <Th key={id} isNumeric={id !== 'description'} py="2">
                      <Button
                        h="unset"
                        variant="unstyled"
                        onClick={column.getToggleSortingHandler()}
                      >
                        <Center fontSize="xs">
                          {renderHeader()}
                          <Box position="relative" w="3" h="3">
                            <Icon
                              position="absolute"
                              as={FaSortUp}
                              color="muted"
                              left="1"
                              opacity={
                                column.getIsSorted() === 'asc' ? '1' : '0.2'
                              }
                            />
                            <Icon
                              position="absolute"
                              as={FaSortDown}
                              color="muted"
                              left="1"
                              opacity={
                                column.getIsSorted() === 'desc' ? '1' : '0.2'
                              }
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
              {instance
                .getRowModel()
                .rows.map(({ original, getVisibleCells }) => (
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
        </Box>
      </Stack>
    </Box>
  )
}
