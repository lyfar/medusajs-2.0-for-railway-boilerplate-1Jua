import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"

const FALLBACK_COUNTRY =
  process.env.NEXT_PUBLIC_DEFAULT_REGION?.toLowerCase() || "us"

export async function listRegions() {
  return sdk.store.region
    .list()
    .then(({ regions }) => regions)
    .catch(medusaError)
}

export async function retrieveRegion(id: string) {
  return sdk.store.region
    .retrieve(id, {})
    .then(({ region }) => region)
    .catch(medusaError)
}

const regionMatchesCountry = (
  region: HttpTypes.StoreRegion,
  countryCode?: string
) => {
  if (!countryCode) {
    return false
  }

  const normalized = countryCode.toLowerCase()

  return region.countries?.some((country) => country?.iso_2 === normalized)
}

export async function getRegion(countryCode: string) {
  try {
    const regions = await listRegions()

    if (!regions?.length) {
      return null
    }

    const exactMatch = regions.find((region) =>
      regionMatchesCountry(region, countryCode)
    )

    if (exactMatch) {
      return exactMatch
    }

    const fallbackRegion = regions.find((region) =>
      regionMatchesCountry(region, FALLBACK_COUNTRY)
    )

    return fallbackRegion ?? regions[0] ?? null
  } catch {
    return null
  }
}
