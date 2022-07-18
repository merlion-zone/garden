import { Button, Center, Input, Link, Stack, Text } from '@chakra-ui/react'
import { Address } from '@merlionzone/merlionjs'
import { useRouter } from 'next/router'
import { useCallback } from 'react'
import {
  GoogleReCaptchaProvider,
  useGoogleReCaptcha,
} from 'react-google-recaptcha-v3'
import { useForm } from 'react-hook-form'
import { useAsyncFn } from 'react-use'

import { useAccountAddress, useConnectWallet } from '@/hooks'
import { useToast } from '@/hooks/useToast'

const RE_CAPTCHA_KEY = process.env.NEXT_PUBLIC_SITE_KEY

interface FormData {
  address: string
}

function Faucet() {
  const toast = useToast()
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    watch,
  } = useForm<FormData>()

  const { executeRecaptcha } = useGoogleReCaptcha()
  const { connected } = useConnectWallet()
  const address = useAccountAddress()

  const sendTx = useCallback(
    async (address: string, callback?: Function) => {
      if (!executeRecaptcha) {
        console.log('Execute recaptcha not yet available')
        return
      }

      const token = await executeRecaptcha('faucet')

      const res = await fetch('/api/faucet', {
        method: 'POST',
        body: JSON.stringify({ address, token }),
      }).then((res) => res.json())

      if (res.ok) {
        toast({
          title: 'Transaction success',
          description: (
            <>
              <Link isExternal href={res.hash}>
                View on Explorer
              </Link>
            </>
          ),
          status: 'success',
          isClosable: true,
        })
        callback?.()
      } else {
        toast({
          title: res.error ?? 'Transaction error',
          status: 'error',
          isClosable: true,
        })
      }
    },
    [executeRecaptcha, toast]
  )

  const onSubmit = useCallback(
    async ({ address }: FormData) => {
      await sendTx(address, () => reset())
    },
    [reset, sendTx]
  )

  const [result, requestWithWallet] = useAsyncFn(
    async (address?: string) => {
      if (!connected || !address) {
        toast({
          title: 'Please connect wallet first',
          status: 'warning',
          isClosable: true,
        })
        return
      }

      await sendTx(address)
    },
    [connected, sendTx, toast]
  )

  return (
    <Center h="full" w="full">
      <Stack w="full" px="4" maxW="md">
        <Button
          w="full"
          onClick={() => requestWithWallet(address?.mer())}
          isLoading={result.loading}
        >
          Request LION with wallet
        </Button>
        <Text textAlign="center">or</Text>
        <Stack as="form" onSubmit={handleSubmit(onSubmit)}>
          <Input
            {...register('address', {
              required: 'Enter an address',
              validate: (v) => {
                try {
                  new Address(v)
                  return true
                } catch (error) {
                  return 'Invalid address'
                }
              },
            })}
          />
          <Button
            w="full"
            type="submit"
            isLoading={isSubmitting}
            isDisabled={!watch('address') || !!errors.address}
          >
            {watch('address')
              ? errors.address?.message || 'Request LION with address'
              : 'Enter an address'}
          </Button>
        </Stack>
      </Stack>
    </Center>
  )
}

export default function FaucetWrap() {
  const { locale } = useRouter()
  return (
    <GoogleReCaptchaProvider reCaptchaKey={RE_CAPTCHA_KEY} language={locale}>
      <Faucet />
    </GoogleReCaptchaProvider>
  )
}
