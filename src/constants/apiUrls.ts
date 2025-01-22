const BASE_URL = DEVELOPMENT_ENV
  ? "http://localhost:3001"
  : "http://101.201.154.135";

const API_URLS = {
  flagShipConversation: `${BASE_URL}/ai-chatbot-api/flagship/conversation`,
  uploadFile: `${BASE_URL}/ai-chatbot-api/flagship/upload-file`,
};

export default API_URLS;
