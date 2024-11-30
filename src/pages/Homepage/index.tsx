import { FC } from "react";
import { Result } from "antd";
import ReactCartoonLogo from "@/assets/images/react-cartoon-logo.png";

const Homepage: FC = () => {
  return (
    <Result
      style={{ paddingTop: "15vh" }}
      icon={
        <img src={ReactCartoonLogo} width={391} alt="react-cartoon-logo.png" />
      }
      title="The library for web and native user interfaces"
    />
  );
};

export default Homepage;
