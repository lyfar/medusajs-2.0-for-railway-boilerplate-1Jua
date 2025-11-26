import { Disclosure } from "@headlessui/react"
import { Badge, Button, clx } from "@medusajs/ui"
import { useEffect } from "react"
import useToggleState from "@lib/hooks/use-toggle-state"
import { useFormStatus } from "react-dom"
import { CheckCircle2, AlertCircle } from "lucide-react"

type AccountInfoProps = {
  label: string
  currentInfo: string | React.ReactNode
  isSuccess?: boolean
  isError?: boolean
  errorMessage?: string
  clearState: () => void
  children?: React.ReactNode
  'data-testid'?: string
}

const AccountInfo = ({
  label,
  currentInfo,
  isSuccess,
  isError,
  clearState,
  errorMessage = "An error occurred, please try again",
  children,
  'data-testid': dataTestid
}: AccountInfoProps) => {
  const { state, close, toggle } = useToggleState()
  const { pending } = useFormStatus()

  const handleToggle = () => {
    clearState()
    setTimeout(() => toggle(), 100)
  }

  useEffect(() => {
    if (isSuccess) {
      close()
    }
  }, [isSuccess, close])

  return (
    <div className="group bg-zinc-900/30 border border-zinc-800/50 rounded-xl overflow-hidden transition-colors hover:border-zinc-700/50" data-testid={dataTestid}>
      <div className="p-5 flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">{label}</span>
          <div className="flex items-center">
            {typeof currentInfo === "string" ? (
              <span className="text-base font-medium text-zinc-200 truncate" data-testid="current-info">{currentInfo}</span>
            ) : (
              currentInfo
            )}
          </div>
        </div>
        <Button
          variant="secondary"
          className="bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700 hover:text-white min-w-[80px]"
          onClick={handleToggle}
          type={state ? "reset" : "button"}
          data-testid="edit-button"
          data-active={state}
        >
          {state ? "Cancel" : "Edit"}
        </Button>
      </div>

      {/* Success state */}
      <Disclosure>
        <Disclosure.Panel
          static
          className={clx(
            "transition-[max-height,opacity] duration-300 ease-in-out overflow-hidden bg-emerald-500/10 border-t border-emerald-500/20",
            {
              "max-h-[100px] opacity-100": isSuccess,
              "max-h-0 opacity-0": !isSuccess,
            }
          )}
          data-testid="success-message"
        >
          <div className="p-4 flex items-center gap-2 text-emerald-400 text-sm font-medium">
            <CheckCircle2 size={18} />
            <span>{label} updated successfully</span>
          </div>
        </Disclosure.Panel>
      </Disclosure>

      {/* Error state  */}
      <Disclosure>
        <Disclosure.Panel
          static
          className={clx(
            "transition-[max-height,opacity] duration-300 ease-in-out overflow-hidden bg-red-500/10 border-t border-red-500/20",
            {
              "max-h-[100px] opacity-100": isError,
              "max-h-0 opacity-0": !isError,
            }
          )}
          data-testid="error-message"
        >
          <div className="p-4 flex items-center gap-2 text-red-400 text-sm font-medium">
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        </Disclosure.Panel>
      </Disclosure>

      <Disclosure>
        <Disclosure.Panel
          static
          className={clx(
            "transition-[max-height,opacity] duration-300 ease-in-out bg-zinc-900/50 border-t border-zinc-800/50",
            {
              "max-h-[1000px] opacity-100": state,
              "max-h-0 opacity-0": !state,
            }
          )}
        >
          <div className="p-5 flex flex-col gap-y-4">
            <div>{children}</div>
            <div className="flex items-center justify-end">
              <Button
                isLoading={pending}
                className="w-full small:max-w-[140px] bg-white text-black hover:bg-zinc-200"
                type="submit"
                data-testid="save-button"
              >
                Save changes
              </Button>
            </div>
          </div>
        </Disclosure.Panel>
      </Disclosure>
    </div>
  )
}

export default AccountInfo
