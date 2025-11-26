import { Dialog, Transition } from "@headlessui/react"
import { clx } from "@medusajs/ui"
import React, { Fragment } from "react"

import { ModalProvider, useModal } from "@lib/context/modal-context"
import X from "@modules/common/icons/x"

type ModalProps = {
  isOpen: boolean
  close: () => void
  size?: "small" | "medium" | "large"
  search?: boolean
  children: React.ReactNode
  'data-testid'?: string
}

const Modal = ({
  isOpen,
  close,
  size = "medium",
  search = false,
  children,
  'data-testid': dataTestId
}: ModalProps) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[75]" onClose={close}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-hidden">
          <div
            className={clx(
              "flex min-h-full h-full justify-center p-4 text-center",
              {
                "items-center": !search,
                "items-start": search,
              }
            )}
          >
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                data-testid={dataTestId}
                className={clx(
                  "flex flex-col justify-start w-full transform p-6 text-left align-middle transition-all max-h-[75vh] h-fit",
                  {
                    "max-w-md": size === "small",
                    "max-w-xl": size === "medium",
                    "max-w-3xl": size === "large",
                    "bg-transparent shadow-none": search,
                    "bg-[#09090b] border border-zinc-800 shadow-2xl rounded-2xl": !search,
                  }
                )}
              >
                <ModalProvider close={close}>{children}</ModalProvider>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

const Title: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { close } = useModal()

  return (
    <Dialog.Title className="flex items-center justify-between mb-4">
      <div className="text-lg font-semibold text-white">{children}</div>
      <div>
        <button onClick={close} data-testid="close-modal-button" className="text-zinc-400 hover:text-white transition-colors p-1">
          <X size={20} />
        </button>
      </div>
    </Dialog.Title>
  )
}

const Description: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Dialog.Description className="flex text-sm text-zinc-400 items-center justify-center pt-2 pb-4 h-full">
      {children}
    </Dialog.Description>
  )
}

const Body: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="flex justify-center w-full text-zinc-300">{children}</div>
}

const Footer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="flex items-center justify-end gap-x-4 mt-6 pt-4 border-t border-zinc-800/50">{children}</div>
}

Modal.Title = Title
Modal.Description = Description
Modal.Body = Body
Modal.Footer = Footer

export default Modal
