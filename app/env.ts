export const env = {
  HUGGINGFACE_API_KEY: process.env.HUGGINGFACE_API_KEY,
}

// Validate
export function validateEnv() {
  const requiredEnvVars = ["HUGGINGFACE_API_KEY"]
  const missingEnvVars = requiredEnvVars.filter((key) => !env[key as keyof typeof env])

  if (missingEnvVars.length > 0) {
    console.warn(`Missing environment variables: ${missingEnvVars.join(", ")}`)
    return false
  }

  return true
}
