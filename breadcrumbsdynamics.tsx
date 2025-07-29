// components/BreadcrumbsDynamic.tsx

  import { Link, useLocation } from "react-router-dom"
  import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
  }from "./ui/breadcrumbd"
import React from "react"
  
  export default function BreadcrumbsDynamic() {
    const location = useLocation()
    const segments = location.pathname.split("/").filter(Boolean) // e.g., ["activity", "crash"]
  
    return (
      <Breadcrumb>
        <BreadcrumbList>
          {segments.map((segment, index) => {
            const isLast = index === segments.length - 1
            const path = "/" + segments.slice(0, index + 1).join("/")
            const label = segment.charAt(0).toUpperCase() + segment.slice(1)
  
            return (
              <React.Fragment key={path}>
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link to={path}>{label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>
    )
  }
  