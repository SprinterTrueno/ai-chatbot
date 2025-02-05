import { FC, useRef, useState } from "react";
import { Input, Button } from "antd";
import { SendOutlined } from "@ant-design/icons";
import DOMPurify from "dompurify";
import { marked } from "marked";
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
  const [loading, setLoading] = useState<boolean>(false);

  // 消息队列
  const messageQueue = useRef([]);
  // 状态标识
  const isProcessing = useRef(false);
  // 是否是第一个数据块
  const firstChunk = useRef(true);

  /**
   * 新建对话
   */
  const handleCreateNewChat = () => {
    setInputValue(null);
    setChatHistory([]);
  };

  /**
   * 处理消息队列
   */
  const processNextMessage = async () => {
    if (messageQueue.current.length === 0) {
      isProcessing.current = false;
      return;
    }

    isProcessing.current = true;
    const line = messageQueue.current.shift();

    try {
      const parsedData = JSON.parse(line.slice(6).trim());
      const { session_id, text, finish_reason } = parsedData.output;

      if (!sessionId) {
        setSessionId(session_id);
      }

      if (finish_reason === "stop") {
        firstChunk.current = true;
        isProcessing.current = false;
        setLoading(false);
        return;
      }

      // 更新状态并等待状态更新完成
      await new Promise<void>((resolve) => {
        if (firstChunk.current) {
          firstChunk.current = false;
          setChatHistory((prevState) => {
            resolve(); // 在状态更新前解决 Promise
            return [
              ...prevState,
              { role: "assistant", sessionId: session_id, text },
            ];
          });
        } else {
          setChatHistory((prevState) => {
            resolve(); // 在状态更新前解决 Promise

            const updatedState = [...prevState];

            if (updatedState.length > 0) {
              updatedState[updatedState.length - 1] = {
                role: "assistant",
                sessionId: session_id,
                text: updatedState[updatedState.length - 1].text + text,
              };
            }

            return updatedState;
          });
        }
        isProcessing.current = false;
      });

      // 添加半秒延迟后再处理下一条消息
      setTimeout(() => {
        processNextMessage();
      }, 100);
    } catch {
      processNextMessage(); // 即使发生错误也继续处理下一条消息
    }
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
      { role: "user", sessionId, text: inputValue },
    ];

    setInputValue(null);
    setChatHistory(newChatHistory);
    setLoading(true);

    try {
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

      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        if (value) {
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n\n").filter((line) => {
            return line.startsWith("data: ");
          });

          // 更新缓冲区，移除已处理的行
          buffer = buffer.substring(buffer.lastIndexOf("\n") + 1);

          // 将新接收到的行添加到队列中
          messageQueue.current.push(...lines);

          // 如果当前没有正在处理的消息，则开始处理队列中的第一条消息
          if (!isProcessing.current) {
            processNextMessage();
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button type="primary" disabled={loading} onClick={handleCreateNewChat}>
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
                <div
                  className={styles.itemContent}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(
                      marked.parse(item.text, { async: false }),
                    ),
                  }}
                />
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
          disabled={loading}
          onClick={handleSendMessage}
        />
      </div>
    </div>
  );
};

export default AgriculturalTechnologyYard;
