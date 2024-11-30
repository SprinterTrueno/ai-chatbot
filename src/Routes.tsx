import { FC } from "react";
import { useRoutes } from "react-router-dom";
import Homepage from "@/pages/Homepage";
import NotFound from "@/pages/NotFound";

const Routes: FC = () => {
  return useRoutes([
    {
      path: "/",
      element: <Homepage />,
    },
    {
      path: "*",
      element: <NotFound />,
    },
  ]);
};

export default Routes;
