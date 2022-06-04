interface Config extends NodeJS.Dict<string> {}

function buildConfig(): Config {
  const config: Config = {}

  for (const key in config) {
    if (process.env[key] !== undefined) {
      config[key] = process.env[key]
    }
  }

  return config
}

const config = buildConfig()

export default config
