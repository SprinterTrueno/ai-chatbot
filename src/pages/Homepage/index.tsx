import { FC, useState } from "react";
import { Input, Button, Upload, message } from "antd";
import { LoadingOutlined, PlusOutlined, SendOutlined } from "@ant-design/icons";
import { nanoid } from "nanoid";
import "./index.less";

type TextContent = string;
type ImageAndTextContent = {
  type: string;
  text?: string;
  image_url?: { url: string };
}[];

interface ChatHistory {
  role: string;
  content: TextContent | ImageAndTextContent;
}

const INITIAL_CHAT_HISTORY = [
  { role: "system", content: "You are a helpful assistant." },
];

const BASE_URL = "http://localhost:3001";
// const BASE_URL = "http://101.201.154.135";

const Homepage: FC = () => {
  const [chatHistory, setChatHistory] =
    useState<ChatHistory[]>(INITIAL_CHAT_HISTORY);

  const [inputValue, setInputValue] = useState();
  const [imageUrl, setImageUrl] = useState<string>();
  const [uploading, setUploading] = useState(false);

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
      {
        role: "user",
        content: imageUrl
          ? [
              { type: "text", text: inputValue },
              { type: "image_url", image_url: { url: imageUrl } },
            ]
          : inputValue,
      },
    ];

    setInputValue(null);
    setImageUrl(null);
    setChatHistory(newChatHistory);

    const res = await fetch(`${BASE_URL}/ai-chatbot-api/qwen/conversation`, {
      method: "POST",
      body: JSON.stringify(newChatHistory),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    setChatHistory([...newChatHistory, data]);
    console.log([...newChatHistory, data]);
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
          console.log(item);

          if (typeof item.content === "string") {
            return (
              index !== 0 && (
                <div
                  key={nanoid()}
                  className={`conversation-item ${item.role}`}
                >
                  <div className="item-container">
                    <div className="item-content">{item.content}</div>
                  </div>
                </div>
              )
            );
          }

          if (Array.isArray(item.content)) {
            return (
              index !== 0 && (
                <div
                  key={nanoid()}
                  className={`conversation-item ${item.role}`}
                >
                  {item.content.map((content) => {
                    if (content.type === "text") {
                      return (
                        <div className="item-container">
                          <div className="item-content">{content.text}</div>
                        </div>
                      );
                    }

                    if (content.type === "image_url") {
                      return (
                        // TODO: 图片预览功能
                        <div className="todo">
                          <img
                            src={content.image_url.url}
                            alt="avatar"
                            style={{ width: "100%" }}
                          />
                        </div>
                      );
                    }

                    return [];
                  })}
                </div>
              )
            );
          }

          return [];
        })}
      </div>
      <div className="footer">
        <Upload
          name="file123"
          method="POST"
          listType="picture-card"
          showUploadList={false}
          action={`${BASE_URL}/ai-chatbot-api/qwen/upload-file`}
          // TODO: 优化上传文件
          // beforeUpload={beforeUpload}
          onChange={(info) => {
            console.log(info);
            const { status, response } = info.file;

            if (status === "uploading") {
              setUploading(true);
              return;
            }

            if (status === "error") {
              setUploading(false);
              message.error(response.message);
              return;
            }

            if (status === "done") {
              setUploading(false);
              setImageUrl(response.url);
            }
          }}
        >
          {imageUrl ? (
            <img src={imageUrl} alt="avatar" style={{ width: "100%" }} />
          ) : (
            <button type="button" style={{ border: 0, background: "none" }}>
              {uploading ? <LoadingOutlined /> : <PlusOutlined />}
              <div style={{ marginTop: 8 }}>Upload</div>
            </button>
          )}
        </Upload>
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
