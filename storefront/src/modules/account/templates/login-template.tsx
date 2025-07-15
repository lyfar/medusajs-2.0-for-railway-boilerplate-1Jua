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
    <div className="w-full flex justify-center py-24 bg-gray-900 dark:bg-black text-white">
      {currentView === LOGIN_VIEW.SIGN_IN ? (
        <Login setCurrentView={setCurrentView} />
      ) : (
        <Register setCurrentView={setCurrentView} />
      )}
    </div>
  )
}

export default LoginTemplate
