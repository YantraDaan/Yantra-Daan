import * as React from "react"
import pngLogo from "@/assets/pngLogo.png"

const LogoSVG = () => {
    return (
        <img src={pngLogo} alt="YantraDaan Logo" width="60" height="60" className="flex items-center justify-center" />
    )
}

export { LogoSVG };