import {
  Button,
  Container,
  Divider,
  Flex,
  Heading,
  HStack,
  List,
  ListItem,
  Stack,
  Stat,
  StatGroup,
  StatLabel,
  StatNumber,
  Tab,
  TabList,
  Tabs,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react'
import NextLink from 'next/link'

export function Governance() {
  const proposals: any[] = [] // TODO
  return (
    <>
      <Container
        as="section"
        maxW="5xl"
        pt={{ base: '6', md: '10' }}
        pb={{ base: '4', md: '8' }}
      >
        <Stack
          spacing="4"
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
        >
          <Stack spacing="1">
            <Heading
              size={useBreakpointValue({ base: 'xs', md: 'sm' })}
              fontWeight="medium"
            >
              Governance
            </Heading>
            <Text color="muted">{/*  */}</Text>
          </Stack>
          <NextLink href="/proposal/new" passHref>
            <Button as="a" variant="primary" rounded="full">
              New proposal
            </Button>
          </NextLink>
        </Stack>
      </Container>
      <Container maxW="5xl">
        <StatGroup bg="bg-surface" rounded="lg">
          <Stat p="6">
            <StatLabel>Minimum deposit</StatLabel>
            <StatNumber>500</StatNumber>
          </Stat>
          <Stat p="6">
            <StatLabel>Maximum deposit period</StatLabel>
            <StatNumber>7 days</StatNumber>
          </Stat>
          <Stat p="6">
            <StatLabel>Voting period</StatLabel>
            <StatNumber>7 days</StatNumber>
          </Stat>
        </StatGroup>
      </Container>
      <Container maxW="5xl" py={{ base: '4', md: '8' }}>
        <Tabs variant="with-line">
          <TabList>
            <Tab>All</Tab>
            <Tab>Deposit</Tab>
            <Tab>Voting</Tab>
            <Tab>Passed</Tab>
            <Tab>Rejected</Tab>
          </TabList>
        </Tabs>
      </Container>
      <Container maxW="5xl" py={{}}>
        <List spacing="4">
          {proposals.length <= 0 && (
            <ListItem
              py="4"
              px="4"
              rounded="lg"
              bg="bg-surface"
              justifyContent="space-between"
              alignItems="center"
            >
              No proposals.
            </ListItem>
          )}
          {proposals.map((p, i) => (
            <ListItem key={i}>
              <Flex
                w="full"
                py="4"
                px="4"
                rounded="lg"
                bg="bg-surface"
                justifyContent="space-between"
                alignItems="center"
                cursor="pointer"
              >
                <Stack>
                  <HStack>
                    <Text fontSize="xs" color="brand">
                      100
                    </Text>
                    <Divider orientation="vertical" h="3" />
                    <Text fontSize="xs">Text proposal</Text>
                  </HStack>
                  <Text fontSize="lg" fontWeight="medium">
                    Proposal 001
                  </Text>
                  <Text fontSize="xs" color="brand">
                    7 days ago
                  </Text>
                </Stack>
                <Button variant="ghost">Vote</Button>
              </Flex>
            </ListItem>
          ))}
        </List>
      </Container>
    </>
  )
}
