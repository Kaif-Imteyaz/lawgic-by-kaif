export const env = {
  NEXT_PUBLIC_HF_API_TOKEN: process.env.NEXT_PUBLIC_HF_API_TOKEN,
}

// Validate
export function validateEnv() {
  const requiredEnvVars = ["NEXT_PUBLIC_HF_API_TOKEN"]
  const missingEnvVars = requiredEnvVars.filter((key) => !env[key as keyof typeof env])

  if (missingEnvVars.length > 0) {
    console.warn(`Missing environment variables: ${missingEnvVars.join(", ")}`)
    return false
  }

  return true
}
