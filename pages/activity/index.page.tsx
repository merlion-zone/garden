import {
  Box,
  BoxProps,
  Container,
  HStack,
  SimpleGrid,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import { useState } from 'react'
import { TxList } from '@/pages/activity/TxList'

const Card = (props: BoxProps) => (
  <Box
    minH="2xs"
    p="4"
    bg="bg-surface"
    boxShadow={useColorModeValue('sm', 'sm-dark')}
    borderRadius="lg"
    {...props}
  />
)

export default function Activity() {
  const [txListIndex, setTxListIndex] = useState(0)

  return (
    <Container maxW="9xl" py="8">
      <Stack spacing={{ base: '8', lg: '6' }}>
        <SimpleGrid columns={1}>
          <Card>
            <HStack gap="4">
              <Text fontSize="3xl">Activity</Text>
              <Tabs
                variant="with-line"
                onChange={(index) => setTxListIndex(index)}
              >
                <TabList>
                  <Tab pb="3" px="4">
                    All
                  </Tab>
                  {/*<Tab pb="3" px="4">*/}
                  {/*  Local*/}
                  {/*</Tab>*/}
                </TabList>
              </Tabs>
            </HStack>

            <Tabs variant="with-line" index={txListIndex}>
              <TabPanels>
                <TabPanel px="0">
                  <TxList></TxList>
                </TabPanel>
                <TabPanel px="0"></TabPanel>
              </TabPanels>
            </Tabs>
          </Card>
        </SimpleGrid>
      </Stack>
    </Container>
  )
}
