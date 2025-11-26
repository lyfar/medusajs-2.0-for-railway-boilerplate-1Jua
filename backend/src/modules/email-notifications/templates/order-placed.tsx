import { Text, Section, Hr, Img, Row, Column, Link } from '@react-email/components'
import * as React from 'react'
import { Base } from './base'
import { OrderDTO, OrderAddressDTO } from '@medusajs/framework/types'

export const ORDER_PLACED = 'order-placed'

interface OrderPlacedPreviewProps {
  order: OrderDTO & { display_id: string; summary: { raw_current_order_total: { value: number } } }
  shippingAddress: OrderAddressDTO
}

export interface OrderPlacedTemplateProps {
  order: OrderDTO & { display_id: string; summary: { raw_current_order_total: { value: number } } }
  shippingAddress: OrderAddressDTO
  preview?: string
}

export const isOrderPlacedTemplateData = (data: any): data is OrderPlacedTemplateProps =>
  typeof data.order === 'object' && typeof data.shippingAddress === 'object'

export const OrderPlacedTemplate: React.FC<OrderPlacedTemplateProps> & {
  PreviewProps: OrderPlacedPreviewProps
} = ({ order, shippingAddress, preview = 'Your order has been placed!' }) => {
  // Helper to fix R2 URLs
  const normalizeCloudflareUrl = (url: string) => {
    if (!url) return null
    if (url.includes('r2.devpk_')) {
      const filename = url.split('/').pop()
      const baseUrl = 'https://stickers.lyfar.com/'
      return baseUrl + filename
    }
    return url
  }

  const formatToken = (value: string) => {
    if (!value) return null
    return value
      .split(/[\s_-]+/)
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(" ")
  }

  return (
    <Base preview={preview}>
      <Section>
        <Text style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', margin: '0 0 30px', color: '#111827' }}>
          Order Confirmation
        </Text>

        <Text style={{ margin: '0 0 15px', fontSize: '16px', color: '#374151' }}>
          Hi {shippingAddress.first_name},
        </Text>

        <Text style={{ margin: '0 0 30px', fontSize: '16px', color: '#374151', lineHeight: '24px' }}>
          Thank you for your order! We've received your request and are getting your stickers ready for production.
        </Text>

        <Section style={{ backgroundColor: '#f9fafb', padding: '24px', borderRadius: '12px', marginBottom: '32px' }}>
          <Text style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>
            Order Reference
          </Text>
          <Text style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: '0 0 4px' }}>
            #{order.display_id}
          </Text>
          <Text style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>
            {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </Text>
        </Section>

        <Text style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 20px', color: '#111827' }}>
          Your Custom Stickers
        </Text>

        {order.items.map((item, index) => {
          const metadata: any = item.metadata || {}
          const rawDesignUrl = metadata.design_url || metadata.file_key && `https://stickers.lyfar.com/${metadata.file_key}`
          const designUrl = normalizeCloudflareUrl(rawDesignUrl)
          
          const dimensions = metadata.dimensions
          const size = dimensions?.diameter 
            ? `${dimensions.diameter}"` 
            : dimensions?.width 
              ? `${dimensions.width}" × ${dimensions.height}"`
              : null

          return (
            <Section key={item.id} style={{ 
              border: '1px solid #e5e7eb', 
              borderRadius: '12px', 
              padding: '20px',
              marginBottom: '16px',
              backgroundColor: '#ffffff'
            }}>
              <Row>
                <Column style={{ width: '100px', paddingRight: '20px', verticalAlign: 'top' }}>
                  {designUrl ? (
                    <Img
                      src={designUrl}
                      alt="Design Preview"
                      width="80"
                      height="80"
                      style={{ 
                        borderRadius: '8px', 
                        objectFit: 'contain', 
                        backgroundColor: '#f3f4f6',
                        border: '1px solid #f3f4f6'
                      }}
                    />
                  ) : (
                    <div style={{ width: '80px', height: '80px', backgroundColor: '#f3f4f6', borderRadius: '8px' }} />
                  )}
                </Column>
                <Column style={{ verticalAlign: 'top' }}>
                  <Text style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 4px' }}>
                    {item.title}
                  </Text>
                  <Text style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 12px' }}>
                    Quantity: {item.quantity} units • {item.unit_price} {order.currency_code} / unit
                  </Text>
                  
                  {/* Specs Grid */}
                  <Row style={{ fontSize: '13px', color: '#4b5563' }}>
                    {size && (
                      <Column style={{ paddingRight: '12px' }}>
                        <Text style={{ margin: '0', color: '#9ca3af', fontSize: '11px', textTransform: 'uppercase' }}>Size</Text>
                        <Text style={{ margin: '0', fontWeight: '500' }}>{size}</Text>
                      </Column>
                    )}
                    {metadata.material && (
                      <Column style={{ paddingRight: '12px' }}>
                        <Text style={{ margin: '0', color: '#9ca3af', fontSize: '11px', textTransform: 'uppercase' }}>Material</Text>
                        <Text style={{ margin: '0', fontWeight: '500' }}>{formatToken(metadata.material)}</Text>
                      </Column>
                    )}
                    {metadata.format && (
                      <Column style={{ paddingRight: '12px' }}>
                        <Text style={{ margin: '0', color: '#9ca3af', fontSize: '11px', textTransform: 'uppercase' }}>Cut</Text>
                        <Text style={{ margin: '0', fontWeight: '500' }}>{formatToken(metadata.format)}</Text>
                      </Column>
                    )}
                  </Row>
                </Column>
                <Column style={{ width: '80px', textAlign: 'right', verticalAlign: 'top' }}>
                  <Text style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0' }}>
                    {item.unit_price * item.quantity} {order.currency_code}
                  </Text>
                </Column>
              </Row>
            </Section>
          )
        })}

        <Section style={{ marginTop: '32px', borderTop: '1px solid #e5e7eb', paddingTop: '32px' }}>
          <Row>
            <Column>
              <Text style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 12px', color: '#111827' }}>Shipping Address</Text>
              <Text style={{ margin: '0 0 4px', color: '#4b5563' }}>{shippingAddress.address_1}</Text>
              <Text style={{ margin: '0 0 4px', color: '#4b5563' }}>{shippingAddress.city}, {shippingAddress.province} {shippingAddress.postal_code}</Text>
              <Text style={{ margin: '0 0 4px', color: '#4b5563' }}>{shippingAddress.country_code}</Text>
            </Column>
            <Column style={{ textAlign: 'right' }}>
              <Text style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 8px' }}>Total Paid</Text>
              <Text style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', margin: '0' }}>
                 {order.summary.raw_current_order_total.value} {order.currency_code}
              </Text>
            </Column>
          </Row>
        </Section>

        <Hr style={{ margin: '40px 0 20px', borderColor: '#e5e7eb' }} />
        
        <Text style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center' }}>
          If you have any questions about your order, simply reply to this email.
        </Text>
      </Section>
    </Base>
  )
}

OrderPlacedTemplate.PreviewProps = {
  order: {
    id: 'test-order-id',
    display_id: 'ORD-123',
    created_at: new Date().toISOString(),
    email: 'test@example.com',
    currency_code: 'USD',
    items: [
      { 
        id: 'item-1', 
        title: 'Custom Die Cut Sticker', 
        product_title: 'Custom Die Cut Sticker', 
        quantity: 500, 
        unit_price: 0.45,
        metadata: {
            design_url: 'https://stickers.lyfar.com/preview-123.png',
            dimensions: { width: 3, height: 3 },
            material: 'vinyl_glossy',
            format: 'die_cut'
        }
      },
    ],
    shipping_address: {
      first_name: 'Test',
      last_name: 'User',
      address_1: '123 Main St',
      city: 'Anytown',
      province: 'CA',
      postal_code: '12345',
      country_code: 'US'
    },
    summary: { raw_current_order_total: { value: 225 } }
  },
  shippingAddress: {
    first_name: 'Test',
    last_name: 'User',
    address_1: '123 Main St',
    city: 'Anytown',
    province: 'CA',
    postal_code: '12345',
    country_code: 'US'
  }
} as OrderPlacedPreviewProps

export default OrderPlacedTemplate
