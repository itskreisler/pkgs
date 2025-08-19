process.loadEnvFile('.env')

export enum EnvVars {
    APP_KEY = 'APP_KEY',
    APP_SECRET = 'APP_SECRET',
    ACCESS_TOKEN = 'ACCESS_TOKEN',
    ACCESS_SECRET = 'ACCESS_SECRET',
    GEMINI_API_KEY = 'GEMINI_API_KEY'
}

type EnvConfig = Record<EnvVars, string>

function getEnvVars(): EnvConfig {
    const config = {} as EnvConfig

    for (const varName of Object.values(EnvVars)) {
        const value = process.env[varName]
        if (typeof value === 'undefined') {
            throw new Error(`Missing required environment variable: ${varName}`)
        }
        config[varName as EnvVars] = value
    }

    return config
}

export const {
    APP_KEY,
    APP_SECRET,
    ACCESS_TOKEN,
    ACCESS_SECRET,
    GEMINI_API_KEY
} = getEnvVars()
