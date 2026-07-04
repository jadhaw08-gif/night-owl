export type MessageStatus = "sent" | "delivered" | "read";

export interface Message {
  id: string;
  chatId: string;
  senderId: string; // "me" or contact id
  text: string;
  timestamp: number;
  status: MessageStatus;
  reactions?: string[];
}

export interface Contact {
  id: string;
  name: string;
  avatar: string; // emoji or initials
  color: string; // tailwind bg class
  status: "online" | "typing" | "offline";
  lastSeen?: string;
  bio?: string;
}

export interface Chat {
  id: string;
  contactId: string;
  unread: number;
  pinned?: boolean;
  muted?: boolean;
}
