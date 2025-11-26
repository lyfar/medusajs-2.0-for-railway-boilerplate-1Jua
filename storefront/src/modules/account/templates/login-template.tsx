"use client"

import { useState } from "react"

import Register from "@modules/account/components/register"
import Login from "@modules/account/components/login"

export enum LOGIN_VIEW {
  SIGN_IN,
  REGISTER,
}

const LoginTemplate = () => {
  const [currentView, setCurrentView] = useState(LOGIN_VIEW.SIGN_IN)

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-4 py-16 bg-neutral-950 text-white"
      style={{
        backgroundImage:
          "radial-gradient(circle at 20% 20%, rgba(99,102,241,0.12), transparent 30%), radial-gradient(circle at 80% 10%, rgba(14,165,233,0.1), transparent 35%)",
      }}
    >
      <div className="w-full max-w-3xl grid gap-8">
        <div className="text-center space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Account access</p>
          <h1 className="text-3xl font-semibold text-white">
            {currentView === LOGIN_VIEW.SIGN_IN ? "Welcome back" : "Create your sticker account"}
          </h1>
          <p className="text-sm text-neutral-400">
            Save designs, track orders, and reorder your favorite stickers faster.
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-8 shadow-[0_30px_80px_-50px_rgba(0,0,0,0.8)]">
          {currentView === LOGIN_VIEW.SIGN_IN ? (
            <Login setCurrentView={setCurrentView} />
          ) : (
            <Register setCurrentView={setCurrentView} />
          )}
        </div>
      </div>
    </div>
  )
}

export default LoginTemplate
