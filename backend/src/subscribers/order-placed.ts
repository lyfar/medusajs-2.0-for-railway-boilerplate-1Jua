import { Modules } from '@medusajs/framework/utils'
import { INotificationModuleService, IOrderModuleService } from '@medusajs/framework/types'
import { SubscriberArgs, SubscriberConfig } from '@medusajs/medusa'
import { EmailTemplates } from '../modules/email-notifications/templates'

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<any>) {
  const notificationModuleService: INotificationModuleService = container.resolve(Modules.NOTIFICATION)
  const orderModuleService: IOrderModuleService = container.resolve(Modules.ORDER)
  
  const order = await orderModuleService.retrieveOrder(data.id, { relations: ['items', 'summary', 'shipping_address'] })
  const shippingAddress = await (orderModuleService as any).orderAddressService_.retrieve(order.shipping_address.id)

  type NotificationPayload = Parameters<INotificationModuleService['createNotifications']>[0]
  const notifications: NotificationPayload[] = [
    {
      to: order.email,
      channel: 'email',
      template: EmailTemplates.ORDER_PLACED,
      data: {
        emailOptions: {
          replyTo: 'info@example.com',
          subject: 'Your order has been placed'
        },
        order,
        shippingAddress,
        preview: 'Thank you for your order!'
      }
    }
  ]

  const adminEmails =
    process.env.MEDUSA_ADMIN_EMAIL?.split(',').map((email) => email.trim()).filter(Boolean) ?? []

  if (adminEmails.length) {
    const adminCustomerName = [shippingAddress.first_name, shippingAddress.last_name].filter(Boolean).join(' ')
    const adminPreview = adminCustomerName
      ? `New order ${order.display_id} from ${adminCustomerName}`
      : `New order ${order.display_id}`

    adminEmails.forEach((adminEmail) => {
      notifications.push({
        to: adminEmail,
        channel: 'email',
        template: EmailTemplates.ORDER_ADMIN_ALERT,
        data: {
          emailOptions: {
            replyTo: order.email,
            subject: `New order ${order.display_id} placed`
          },
          order,
          shippingAddress,
          preview: adminPreview
        }
      })
    })
  }

  try {
    await Promise.all(
      notifications.map((payload) => notificationModuleService.createNotifications(payload))
    )
  } catch (error) {
    console.error('Error sending order notifications:', error)
  }
}

export const config: SubscriberConfig = {
  event: 'order.placed'
}
