import Decimal from 'decimal.js'

import { Config, config as defaultConfig, envConfig } from '@/config/config'

function hydrateConfigFromEnv(config: Config): Config {
  const truthyValues = ['true', '1', 't']

  for (const key in config) {
    const defaultValue = config[key]
    const envValue = (envConfig as any)[key]

    if (envValue !== undefined) {
      switch (typeof defaultValue) {
        case 'string':
          config[key] = envValue
          break
        case 'number':
          config[key] = Number(envValue)
          break
        case 'boolean':
          config[key] = truthyValues.includes((envValue as any).toLowerCase())
          break
      }
    }
  }

  return config
}

const config = hydrateConfigFromEnv(defaultConfig)

export default config

Decimal.set({ rounding: Decimal.ROUND_DOWN })
