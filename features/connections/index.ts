/**
 * Connections Feature - Public API
 */

// API hooks
export {
    useConnections,
    useInboundRequests,
    useOutboundRequests,
    useConnectionStatus,
    usePendingRequestCount,
    useSendConnectionRequest,
    useAcceptConnectionRequest,
    useRejectConnectionRequest,
    useCancelConnectionRequest,
    useRemoveConnection,
} from "./api";

// Types
export type {
    Connection,
    ConnectionWithUser,
    InboundRequest,
    OutboundRequest,
    ConnectionStatus,
    SendConnectionRequestInput,
    SendConnectionRequestResponse,
} from "./types";

// Components (will be added)
export { ConnectionsModal } from "./components/ConnectionsModal";
export { ConnectionRequestModal } from "./components/ConnectionRequestModal";
