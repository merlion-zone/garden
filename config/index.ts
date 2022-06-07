import { constantCase } from 'constant-case'
import { Config, config as defaultConfig } from '@/config/config'

function buildConfig(config: Config): Config {
  const truthyValues = ['true', '1', 't']

  for (const key in config) {
    const defaultValue = config[key]
    // key: camelCase -> UPPER_CASE
    const envValue = process.env[constantCase(key)]

    if (envValue !== undefined) {
      switch (typeof defaultValue) {
        case 'string':
          config[key] = envValue
          break
        case 'number':
          config[key] = Number(envValue)
          break
        case 'boolean':
          config[key] = truthyValues.includes((<string>envValue).toLowerCase())
          break
      }
    }
  }

  return config
}

const config = buildConfig(defaultConfig)

export default config
