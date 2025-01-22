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

  const [data, setData] = useState([]);

  const handleCreateNewChat = () => {
    setInputValue(null);
    setChatHistory([]);
  };

  /**
   * 发送消息
   */
  const handleSendMessage = async () => {
    const response = await fetch(API_URLS.atYardCallDashScope, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify({ sessionId, text: inputValue }),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let done = false;

    while (!done) {
      // eslint-disable-next-line no-await-in-loop
      const { value, done: streamDone } = await reader.read();
      done = streamDone;
      if (value) {
        const chunk = decoder.decode(value, { stream: true });
        // Process each line as a separate event
        const lines = chunk
          .split("\n")
          .filter((line) => line.startsWith("data: "));
        lines.forEach((line, index) => {
          const parsedData = JSON.parse(line.slice(6)); // Remove "data: " prefix
          setData((prevData) => [...prevData, parsedData.chunk]);
        });
      }
    }

    /* if (!inputValue) {
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
    console.log([...newChatHistory, { role: "assistant", ...data }]); */
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button
          type="primary"
          onClick={() => {
            console.log(data);
          }}
        >
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
