import { createBrowserRouter, Navigate } from "react-router"
import { LandingPage } from "@/pages/LandingPage"
import { WorkspacePage } from "@/pages/WorkspacePage"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/app",
    element: <WorkspacePage />,
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
])
