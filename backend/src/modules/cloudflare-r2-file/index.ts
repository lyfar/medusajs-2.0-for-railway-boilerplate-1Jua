import { ModuleProviderExports } from '@medusajs/framework/types'
import CloudflareR2FileProviderService from './service'

const services = [CloudflareR2FileProviderService]

const providerExport: ModuleProviderExports = {
  services,
}

export default providerExport 