/**
 * Messages Feature - Public API
 */

// API hooks
export {
    useUserMessages,
    useConversation,
    useSendMessage,
    useMarkMessageAsRead,
    useCurrentUser,
    useAllUsers,
} from "./api";

// Types
export type {
    Message,
    ConversationPartner,
    SendMessageInput,
    ConversationListProps,
} from "./types";

// Components (will be added as they are migrated)
// export { ConversationList } from "./components/ConversationList";
// export { MessageThread } from "./components/MessageThread";
// export { MessageInput } from "./components/MessageInput";
// export { EmptyMessageState } from "./components/EmptyMessageState";
