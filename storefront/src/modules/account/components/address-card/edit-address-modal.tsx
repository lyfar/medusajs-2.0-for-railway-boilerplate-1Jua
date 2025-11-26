"use client"

import React, { useEffect, useState } from "react"
import { PencilSquare as Edit, Trash } from "@medusajs/icons"
import { Button, Heading, Text, clx } from "@medusajs/ui"

import useToggleState from "@lib/hooks/use-toggle-state"
import CountrySelect from "@modules/checkout/components/country-select"
import Input from "@modules/common/components/input"
import Modal from "@modules/common/components/modal"
import Spinner from "@modules/common/icons/spinner"
import { useFormState } from "react-dom"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import { HttpTypes } from "@medusajs/types"
import {
  deleteCustomerAddress,
  updateCustomerAddress,
} from "@lib/data/customer"
import { Building, MapPin, Phone, Trash2, Pencil } from "lucide-react"

type EditAddressProps = {
  region: HttpTypes.StoreRegion
  address: HttpTypes.StoreCustomerAddress
  isActive?: boolean
}

const EditAddress: React.FC<EditAddressProps> = ({
  region,
  address,
  isActive = false,
}) => {
  const [removing, setRemoving] = useState(false)
  const [successState, setSuccessState] = useState(false)
  const { state, open, close: closeModal } = useToggleState(false)

  const [formState, formAction] = useFormState(updateCustomerAddress, {
    success: false,
    error: null,
    addressId: address.id,
  })

  const close = () => {
    setSuccessState(false)
    closeModal()
  }

  useEffect(() => {
    if (successState) {
      close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [successState])

  useEffect(() => {
    if (formState.success) {
      setSuccessState(true)
    }
  }, [formState])

  const removeAddress = async () => {
    setRemoving(true)
    await deleteCustomerAddress(address.id)
    setRemoving(false)
  }

  return (
    <>
      <div
        className={clx(
          "group relative bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-6 flex flex-col justify-between transition-all duration-300 hover:bg-zinc-900/50 hover:border-zinc-700/50",
          {
            "border-indigo-500/50 bg-indigo-500/5": isActive,
          }
        )}
        data-testid="address-container"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <Heading
                className="text-base font-medium text-white flex items-center gap-2"
                data-testid="address-name"
              >
                {address.first_name} {address.last_name}
                {isActive && (
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full uppercase tracking-wider">Default</span>
                )}
              </Heading>
              {address.company && (
                <div className="flex items-center gap-1.5 text-sm text-zinc-400">
                  <Building size={14} />
                  <span data-testid="address-company">{address.company}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2 text-sm text-zinc-400 bg-black/20 p-3 rounded-lg border border-white/5">
            <div className="flex gap-2">
              <MapPin size={16} className="shrink-0 text-zinc-500 mt-0.5" />
              <div className="flex flex-col">
                <span data-testid="address-address">
                  {address.address_1}
                  {address.address_2 && <span>, {address.address_2}</span>}
                </span>
                <span data-testid="address-postal-city">
                  {address.city}, {address.postal_code}
                </span>
                <span data-testid="address-province-country">
                  {address.province && `${address.province}, `}
                  {address.country_code?.toUpperCase()}
                </span>
              </div>
            </div>
            {address.phone && (
              <div className="flex gap-2 pt-2 border-t border-white/5 mt-2">
                <Phone size={16} className="shrink-0 text-zinc-500" />
                <span>{address.phone}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6 pt-4 border-t border-zinc-800/50">
          <button
            className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            onClick={open}
            data-testid="address-edit-button"
          >
            <Pencil size={16} />
            Edit
          </button>
          <div className="h-4 w-px bg-zinc-800" />
          <button
            className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-red-400 transition-colors"
            onClick={removeAddress}
            data-testid="address-delete-button"
          >
            {removing ? <Spinner className="w-4 h-4" /> : <Trash2 size={16} />}
            Remove
          </button>
        </div>
      </div>

      <Modal isOpen={state} close={close} data-testid="edit-address-modal">
        <Modal.Title>
          <Heading className="mb-2">Edit address</Heading>
        </Modal.Title>
        <form action={formAction}>
          <Modal.Body>
            <div className="grid grid-cols-1 gap-y-2">
              <div className="grid grid-cols-2 gap-x-2">
                <Input
                  label="First name"
                  name="first_name"
                  required
                  autoComplete="given-name"
                  defaultValue={address.first_name || undefined}
                  data-testid="first-name-input"
                />
                <Input
                  label="Last name"
                  name="last_name"
                  required
                  autoComplete="family-name"
                  defaultValue={address.last_name || undefined}
                  data-testid="last-name-input"
                />
              </div>
              <Input
                label="Company"
                name="company"
                autoComplete="organization"
                defaultValue={address.company || undefined}
                data-testid="company-input"
              />
              <Input
                label="Address"
                name="address_1"
                required
                autoComplete="address-line1"
                defaultValue={address.address_1 || undefined}
                data-testid="address-1-input"
              />
              <Input
                label="Apartment, suite, etc."
                name="address_2"
                autoComplete="address-line2"
                defaultValue={address.address_2 || undefined}
                data-testid="address-2-input"
              />
              <div className="grid grid-cols-[144px_1fr] gap-x-2">
                <Input
                  label="Postal code"
                  name="postal_code"
                  required
                  autoComplete="postal-code"
                  defaultValue={address.postal_code || undefined}
                  data-testid="postal-code-input"
                />
                <Input
                  label="City"
                  name="city"
                  required
                  autoComplete="locality"
                  defaultValue={address.city || undefined}
                  data-testid="city-input"
                />
              </div>
              <Input
                label="Province / State"
                name="province"
                autoComplete="address-level1"
                defaultValue={address.province || undefined}
                data-testid="state-input"
              />
              <CountrySelect
                name="country_code"
                region={region}
                required
                autoComplete="country"
                defaultValue={address.country_code || undefined}
                data-testid="country-select"
              />
              <Input
                label="Phone"
                name="phone"
                autoComplete="phone"
                defaultValue={address.phone || undefined}
                data-testid="phone-input"
              />
            </div>
            {formState.error && (
              <div className="text-rose-500 text-small-regular py-2">
                {formState.error}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <div className="flex gap-3 mt-6">
              <Button
                type="reset"
                variant="secondary"
                onClick={close}
                className="h-10"
                data-testid="cancel-button"
              >
                Cancel
              </Button>
              <SubmitButton data-testid="save-button">Save</SubmitButton>
            </div>
          </Modal.Footer>
        </form>
      </Modal>
    </>
  )
}

export default EditAddress
