import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import AdminRoute from "./protections/AdminRoute";
/**
 * Limitations
 */
import ProtectedRoute from "./protections/ProtectedRoute";

/**
 * Contexts
 */
import { AuthProvider } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";

/**
 * Pages
 */
import App from "./App";
import About from "./pages/About/About";
import Account from "./pages/Account/Account";
import BackofficeMain from "./pages/Admin/Admin";
import Contact from "./pages/Contact/Contact";
import Dashboard from "./pages/Dashboard/DashBoard";
import Home from "./pages/Home/Home";
import Maps from "./pages/Map/Map";
import NotFound from "./pages/NotFound/NotFound";
import Connexion from "./pages/connexion/Connexion";

const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/home",
        element: <Home />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "/dashboard",
            element: <Dashboard />,
          },
          {
            path: "/account",
            element: <Account />,
          },
        ],
      },
      {
        path: "/about",
        element: <About />,
      },
      {
        path: "/contact",
        element: <Contact />,
      },
      {
        element: <AdminRoute />,
        children: [
          {
            path: "/backoffice",
            element: <BackofficeMain />,
          },
        ],
      },
      {
        path: "/maps",
        element: <Maps />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
      {
        path: "/connexion",
        element: <Connexion />,
      },
    ],
  },
]);

const rootElement = document.getElementById("root");

if (rootElement == null) {
  throw new Error(`Your HTML Document should contain a <div id="root"></div>`);
}

// Render the app inside the root element
createRoot(rootElement).render(
  <StrictMode>
    <HelmetProvider>
      <DataProvider>
        <AuthProvider>
          <RouterProvider router={router} />
          <ToastContainer />
        </AuthProvider>
      </DataProvider>
    </HelmetProvider>
  </StrictMode>,
);
