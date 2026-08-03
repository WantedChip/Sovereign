import { lazy, Suspense } from "react"
import { createBrowserRouter, Navigate } from "react-router"
import { LandingPage } from "@/pages/LandingPage"
import { WorkspaceSkeleton } from "@/components/workspace/WorkspaceSkeleton"

const WorkspacePage = lazy(() =>
  import("@/pages/WorkspacePage").then((module) => ({
    default: module.WorkspacePage,
  }))
)

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/app",
    element: (
      <Suspense fallback={<WorkspaceSkeleton />}>
        <WorkspacePage />
      </Suspense>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
])
