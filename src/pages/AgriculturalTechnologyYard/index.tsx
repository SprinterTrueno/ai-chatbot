import { FC, useState } from "react";
import { Input, Button } from "antd";
import { SendOutlined } from "@ant-design/icons";
import { nanoid } from "nanoid";
import API_URLS from "@/constants/apiUrls";
import styles from "./index.module.less";

interface ChatHistory {
  role: string;
  text: string;
  sessionId?: string;
}

const AgriculturalTechnologyYard: FC = () => {
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);

  const [inputValue, setInputValue] = useState<string>();
  const [sessionId, setSessionId] = useState<string>();

  const handleCreateNewChat = () => {
    setInputValue(null);
    setChatHistory([]);
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
      { role: "user", text: inputValue, sessionId },
    ];

    setInputValue(null);
    setChatHistory(newChatHistory);

    const res = await fetch(API_URLS.atYardCallDashScope, {
      method: "POST",
      body: JSON.stringify({ sessionId, text: inputValue }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (!sessionId) {
      setSessionId(data.sessionId);
    }

    console.log(data);

    setChatHistory([...newChatHistory, { role: "assistant", ...data }]);
    console.log([...newChatHistory, { role: "assistant", ...data }]);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button type="primary" onClick={handleCreateNewChat}>
          新建对话
        </Button>
      </div>
      <div className={styles.content}>
        {chatHistory.map((item) => {
          return (
            <div
              key={nanoid()}
              className={`${styles.conversationItem} ${styles[item.role]}`}
            >
              <div className={styles.itemContainer}>
                <div className={styles.itemContent}>{item.text}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div className={styles.footer}>
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
          className={styles.submit}
          icon={<SendOutlined />}
          size="large"
          onClick={handleSendMessage}
        />
      </div>
    </div>
  );
};

export default AgriculturalTechnologyYard;
