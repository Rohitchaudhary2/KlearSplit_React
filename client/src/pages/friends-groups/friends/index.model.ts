export interface Friend {
  "conversation_id": string,
  "status": string,
  "balance_amount": string,
  "archival_status": string,
  "block_status": string,
  "friend": {
    "user_id": string,
    "first_name": string,
    "last_name": string,
    "email": string,
    "image_url": string | null
  }
}

export interface Message {
  message_id: string;
  conversation_id: string;
  sender_id: string;
  message: string;
  is_read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  createdAt: string;
  debtor_amount: string;
  debtor_id: string;
  deletedAt: string | null;
  conversation_id: string;
  description: string;
  expense_name: string;
  friend_expense_id: string;
  payer_id: string;
  receipt_url: string | null;
  split_type: string;
  total_amount: string;
  updatedAt: string;
  payer: string;
}

export interface ExpenseInfo {
  expense_name: string,
  total_amount: string,
  description: string,
  payer_id: string,
  debtor_id: string,
  participant1_share: string,
  participant2_share: string,
  split_type: string,
  debtor_share: string
}