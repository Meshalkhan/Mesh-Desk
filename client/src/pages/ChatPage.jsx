import { MainLayout } from '../layouts/MainLayout.jsx';
import { useChat } from '../hooks/useChat.js';

export function ChatPage() {
  const {
    chats,
    activeId,
    messages,
    models,
    selectedModelId,
    selectModel,
    loadingList,
    loadingChat,
    sending,
    selectChat,
    newChat,
    removeChat,
    send,
  } = useChat({ enabled: true });

  return (
    <MainLayout
      chats={chats}
      activeId={activeId}
      messages={messages}
      models={models}
      selectedModelId={selectedModelId}
      onSelectModel={selectModel}
      loadingList={loadingList}
      loadingChat={loadingChat}
      sending={sending}
      onSelectChat={selectChat}
      onNewChat={newChat}
      onDeleteChat={removeChat}
      onSend={send}
    />
  );
}
