import { Text, Section, Hr } from '@react-email/components'
import * as React from 'react'
import { Base } from './base'
import { OrderDTO, OrderAddressDTO } from '@medusajs/framework/types'

export const ORDER_ADMIN_ALERT = 'order-admin-alert'

interface OrderAdminAlertPreviewProps {
  order: OrderDTO & { display_id: string; summary: { raw_current_order_total: { value: number } } }
  shippingAddress: OrderAddressDTO
}

export interface OrderAdminAlertTemplateProps {
  order: OrderDTO & { display_id: string; summary: { raw_current_order_total: { value: number } } }
  shippingAddress: OrderAddressDTO
  preview?: string
}

export const isOrderAdminAlertTemplateData = (
  data: any
): data is OrderAdminAlertTemplateProps =>
  typeof data === 'object' && typeof data.order === 'object' && typeof data.shippingAddress === 'object'

export const OrderAdminAlertTemplate: React.FC<OrderAdminAlertTemplateProps> & {
  PreviewProps: OrderAdminAlertPreviewProps
} = ({ order, shippingAddress, preview = `New order ${order.display_id} received` }) => {
  const customerName = [shippingAddress.first_name, shippingAddress.last_name].filter(Boolean).join(' ')

  return (
    <Base preview={preview}>
      <Section>
        <Text style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', margin: '0 0 30px' }}>
          New Order Received
        </Text>

        <Text style={{ margin: '0 0 10px' }}>
          Order <strong>{order.display_id}</strong> was just placed by{' '}
          <strong>{customerName || order.email}</strong>.
        </Text>
        <Text style={{ margin: '0 0 30px' }}>
          Review the summary below and fulfill the order in your Medusa admin dashboard.
        </Text>

        <Text style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 10px' }}>
          Order Summary
        </Text>
        <Text style={{ margin: '0 0 5px' }}>
          Customer Email: {order.email}
        </Text>
        <Text style={{ margin: '0 0 5px' }}>
          Placed: {new Date(order.created_at).toLocaleString()}
        </Text>
        <Text style={{ margin: '0 0 5px' }}>
          Total: {order.summary.raw_current_order_total.value} {order.currency_code}
        </Text>

        <Hr style={{ margin: '20px 0' }} />

        <Text style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 10px' }}>
          Shipping Address
        </Text>
        <Text style={{ margin: '0 0 5px' }}>
          {customerName || 'N/A'}
        </Text>
        <Text style={{ margin: '0 0 5px' }}>
          {shippingAddress.address_1}
        </Text>
        {shippingAddress.address_2 && (
          <Text style={{ margin: '0 0 5px' }}>
            {shippingAddress.address_2}
          </Text>
        )}
        <Text style={{ margin: '0 0 5px' }}>
          {shippingAddress.city}, {shippingAddress.province} {shippingAddress.postal_code}
        </Text>
        <Text style={{ margin: '0 0 20px' }}>
          {shippingAddress.country_code}
        </Text>

        <Hr style={{ margin: '20px 0' }} />

        <Text style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 15px' }}>
          Line Items
        </Text>

        <div
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            border: '1px solid #ddd',
            margin: '10px 0'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              backgroundColor: '#f2f2f2',
              padding: '8px',
              borderBottom: '1px solid #ddd'
            }}
          >
            <Text style={{ fontWeight: 'bold' }}>Item</Text>
            <Text style={{ fontWeight: 'bold' }}>Quantity</Text>
            <Text style={{ fontWeight: 'bold' }}>Price</Text>
          </div>
          {order.items.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px',
                borderBottom: '1px solid #ddd'
              }}
            >
              <Text>{item.product_title ?? item.title}</Text>
              <Text>{item.quantity}</Text>
              <Text>
                {item.unit_price} {order.currency_code}
              </Text>
            </div>
          ))}
        </div>
      </Section>
    </Base>
  )
}

OrderAdminAlertTemplate.PreviewProps = {
  order: {
    id: 'order_01',
    display_id: '1001',
    created_at: new Date().toISOString(),
    email: 'customer@example.com',
    currency_code: 'USD',
    items: [
      { id: 'item-1', title: 'Sticker Pack', product_title: 'Sticker Pack', quantity: 2, unit_price: 25 }
    ],
    shipping_address: {
      first_name: 'Jamie',
      last_name: 'Doe',
      address_1: '123 Main St',
      city: 'Metropolis',
      province: 'CA',
      postal_code: '90210',
      country_code: 'US'
    },
    summary: { raw_current_order_total: { value: 50 } }
  },
  shippingAddress: {
    first_name: 'Jamie',
    last_name: 'Doe',
    address_1: '123 Main St',
    city: 'Metropolis',
    province: 'CA',
    postal_code: '90210',
    country_code: 'US'
  }
} as OrderAdminAlertPreviewProps

export default OrderAdminAlertTemplate
