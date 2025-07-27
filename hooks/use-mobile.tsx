import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const getIsMobile = () => window.innerWidth < MOBILE_BREAKPOINT
  const [isMobile, setIsMobile] = React.useState(getIsMobile)

  React.useEffect(() => {
    const handleResize = () => setIsMobile(getIsMobile())
    window.addEventListener("resize", handleResize)
    // Ensure state is correct on mount
    handleResize()
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return isMobile
}
