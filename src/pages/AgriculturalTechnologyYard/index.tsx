import { FC, useEffect, useRef, useState } from "react";
import { Button, Input } from "antd";
import { SendOutlined } from "@ant-design/icons";
import DOMPurify from "dompurify";
import { marked, Tokens } from "marked";
import { nanoid } from "nanoid";
import API_URLS from "@/constants/apiUrls";
import styles from "./index.module.less";

// 自定义renderer
const renderer = new marked.Renderer();

renderer.link = ({ href, text }: Tokens.Link) => {
  // 判断是否是指定类型的链接。
  if (href.endsWith(".mp4")) {
    return `<a href="${href}" rel="noopener noreferrer" target="_blank">${text}</a>`;
  }
  return `<a href="${href}">${text}</a>`;
};

interface ChatHistory {
  role: string;
  text: string;
}

const AgriculturalTechnologyYard: FC = () => {
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [inputValue, setInputValue] = useState<string>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // 会话Id
  const sessionIdRef = useRef<string>(null);
  // 消息队列
  const messageQueueRef = useRef<string[]>([]);
  // 状态标识
  const isProcessingRef = useRef<boolean>(false);
  // 是否是第一个数据块
  const firstChunkRef = useRef<boolean>(true);

  useEffect(() => {
    document.title = "智农嘉云";
  }, []);

  /**
   * 新建对话
   */
  const handleCreateNewChat = () => {
    sessionIdRef.current = null;
    setInputValue(null);
    setChatHistory([]);
  };

  /**
   * 处理消息队列
   */
  const processNextMessage = async () => {
    if (messageQueueRef.current.length === 0) {
      isProcessingRef.current = false;
      return;
    }

    isProcessingRef.current = true;
    const line = messageQueueRef.current.shift();

    try {
      const parsedData = JSON.parse(line.slice(6).trim());
      const { session_id, text, finish_reason } = parsedData.output;

      if (!sessionIdRef.current) {
        sessionIdRef.current = session_id;
      }

      if (finish_reason === "stop") {
        firstChunkRef.current = true;
        isProcessingRef.current = false;
        setLoading(false);
        return;
      }

      // 更新状态并等待状态更新完成
      await new Promise<void>((resolve) => {
        if (firstChunkRef.current) {
          firstChunkRef.current = false;
          setChatHistory((prevState) => {
            resolve(); // 在状态更新前解决 Promise
            return [...prevState, { role: "assistant", text }];
          });
        } else {
          setChatHistory((prevState) => {
            resolve(); // 在状态更新前解决 Promise

            const updatedState = [...prevState];

            if (updatedState.length > 0) {
              updatedState[updatedState.length - 1] = {
                role: "assistant",
                text: updatedState[updatedState.length - 1].text + text,
              };
            }

            return updatedState;
          });
        }
        isProcessingRef.current = false;
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

    const newChatHistory = [...chatHistory, { role: "user", text: inputValue }];

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
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          text: inputValue,
        }),
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
          messageQueueRef.current.push(...lines);

          // 如果当前没有正在处理的消息，则开始处理队列中的第一条消息
          if (!isProcessingRef.current) {
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
                      marked.parse(item.text, {
                        async: false,
                        renderer,
                      }),
                      { ADD_ATTR: ["target"] },
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
