import { constantCase } from 'constant-case'

interface Config extends NodeJS.Dict<string | number | boolean> {
  chainID: string
  chainName: string
  rpcEndpoint: string
  restEndpoint: string
  bech32Prefix: string
  denom: string
  denomDecimals: number
  displayDenom: string
}

function buildConfig(): Config {
  const config: Config = {
    chainID: 'merlion_5000-101',
    chainName: 'Merlion Localnet',
    rpcEndpoint: 'http://127.0.0.1:26657',
    restEndpoint: 'http://127.0.0.1:1317',
    bech32Prefix: 'mer',
    denom: 'alion',
    denomDecimals: 18,
    displayDenom: 'LION',
  }

  const truthyValues = ['true', '1', 't']

  for (const key in config) {
    const defaultValue = config[key]
    // key: camelCase -> UPPER_CASE
    const envValue = process.env[constantCase(key)]

    if (envValue !== undefined && defaultValue !== undefined) {
      switch (typeof defaultValue) {
        case 'string':
          config[key] = envValue
          break
        case 'number':
          config[key] = Number(envValue)
          break
        case 'boolean':
          config[key] = truthyValues.includes((<string>envValue).toLowerCase())
      }
    }
  }

  return config
}

const config = buildConfig()

export default config
