import { FC } from "react";
import { useRoutes } from "react-router-dom";
import Homepage from "@/pages/Homepage";
import AgriculturalTechnologyYard from "@/pages/AgriculturalTechnologyYard";
import NotFound from "@/pages/NotFound";

const Routes: FC = () => {
  return useRoutes([
    {
      path: "/",
      element: <Homepage />,
    },
    {
      path: "/agricultural-technology-yard",
      element: <AgriculturalTechnologyYard />,
    },
    {
      path: "*",
      element: <NotFound />,
    },
  ]);
};

export default Routes;
