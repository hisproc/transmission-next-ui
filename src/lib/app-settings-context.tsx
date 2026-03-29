import * as React from "react"

interface AppSettings {
  refreshInterval: number
  autoRefresh: boolean
}

interface AppSettingsContextType extends AppSettings {
  setRefreshInterval: (interval: number) => void
  setAutoRefresh: (enabled: boolean) => void
}

const AppSettingsContext = React.createContext<AppSettingsContextType | undefined>(undefined)

export function AppSettingsProvider({ children }: { children: React.ReactNode }) {
  const [refreshInterval, setRefreshIntervalState] = React.useState<number>(3000)
  const [autoRefresh, setAutoRefreshState] = React.useState<boolean>(true)

  // Load from localStorage on mount
  React.useEffect(() => {
    const savedInterval = localStorage.getItem("app_refresh_interval")
    if (savedInterval) {
      const val = parseInt(savedInterval, 10)
      if (!isNaN(val) && val >= 500) setRefreshIntervalState(val)
    }

    const savedAuto = localStorage.getItem("app_auto_refresh")
    if (savedAuto !== null) {
      setAutoRefreshState(savedAuto === "true")
    }
  }, [])

  const setRefreshInterval = (val: number) => {
    setRefreshIntervalState(val)
    localStorage.setItem("app_refresh_interval", val.toString())
  }

  const setAutoRefresh = (val: boolean) => {
    setAutoRefreshState(val)
    localStorage.setItem("app_auto_refresh", val.toString())
  }

  return (
    <AppSettingsContext.Provider value={{ refreshInterval, setRefreshInterval, autoRefresh, setAutoRefresh }}>
      {children}
    </AppSettingsContext.Provider>
  )
}

export function useAppSettings() {
  const context = React.useContext(AppSettingsContext)
  if (context === undefined) {
    throw new Error("useAppSettings must be used within an AppSettingsProvider")
  }
  return context
}
