import { FC, useState } from "react";
import { Input, Button } from "antd";
import { SendOutlined } from "@ant-design/icons";
import { nanoid } from "nanoid";
import "./index.less";

const INITIAL_CHAT_HISTORY = [
  { role: "system", content: "You are a helpful assistant." },
];

const Homepage: FC = () => {
  const [chatHistory, setChatHistory] = useState(INITIAL_CHAT_HISTORY);

  const [inputValue, setInputValue] = useState();

  const handleCreateNewChat = () => {
    setInputValue(null);
    setChatHistory(INITIAL_CHAT_HISTORY);
  };

  /**
   * 发送消息
   */
  const handleSendMessage = async () => {
    if (!inputValue) {
      return;
    }

    const newChatHistory = [
      ...chatHistory,
      { role: "user", content: inputValue },
    ];

    setInputValue(null);
    setChatHistory(newChatHistory);

    fetch("http://101.201.154.135/ai-chatbot-api/qwen/conversation", {
      method: "POST",
      body: JSON.stringify(newChatHistory),
      headers: { "Content-Type": "application/json" },
    }).then((res) => {
      res.json().then((data) => {
        setChatHistory([...newChatHistory, data]);
      });
    });
  };

  return (
    <div className="container">
      <div className="header">
        <Button type="primary" onClick={handleCreateNewChat}>
          新建对话
        </Button>
      </div>
      <div className="content">
        {chatHistory.map((item, index) => {
          return (
            index !== 0 && (
              <div key={nanoid()} className={item.role}>
                <p>{item.content}</p>
              </div>
            )
          );
        })}
      </div>
      <div className="footer">
        <Input
          placeholder="请输入"
          size="large"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
          }}
          onPressEnter={handleSendMessage}
        />
        <Button
          className="submit"
          icon={<SendOutlined />}
          size="large"
          onClick={handleSendMessage}
        />
      </div>
    </div>
  );
};

export default Homepage;
