import { FC } from "react";
import { Input, Button } from "antd";
import { SendOutlined } from "@ant-design/icons";
import "./index.less";

const Homepage: FC = () => {
  return (
    <div className="container">
      <div className="header">
        <Button type="primary">新建对话</Button>
      </div>
      <div className="content">
        <div>这是内容区</div>
      </div>
      <div className="footer">
        <Input placeholder="请输入" size="large" />
        <Button className="submit" icon={<SendOutlined />} size="large" />
      </div>
    </div>
  );
};

export default Homepage;
