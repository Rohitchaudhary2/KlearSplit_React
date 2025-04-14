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

export interface SearchedUser {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
}

export type SelectableUser = SearchedUser & {
isAdmin?: boolean;
isCoAdmin?: boolean;
role?: "admin" | "coadmin" | "member";
};

export interface MembersData {
  members: [];
  admins: [];
  coadmins: [];
}

export interface CreateGroupData {
  group: {
    group_name: string;
    group_description: string;
    image_url: string;
  };
  memberData: MembersData;
}

export interface Group {
  group_id: string;
  group_name: string;
  group_description: string;
  image_url: string;
  creator_id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreateGroupResponse {
  success: string;
  message: string;
  data: Group;
}

export interface SearchedUserResponse {
  success: string;
  message: string;
  data: SearchedUser[];
}

export interface MemberData {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  image_url: string;
}

export interface GroupMemberData {
  group_membership_id: string;
  group_id: string;
  inviter_id: string;
  member_id: string;
  status: string;
  role: string;
  has_archived: boolean;
  has_blocked: boolean;
  balance_with_user: string;
  total_balance: string;
  first_name: string;
  last_name: string;
  image_url: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface GroupData {
  group_id: string;
  group_name: string;
  group_description: string;
  image_url: string;
  creator_id: string;
  balance_amount: string;
  status: string;
  role: string;
  has_blocked: boolean;
}

export interface Groups {
  success: string;
  message: string;
  data: {
    invitedGroups: GroupData[];
    acceptedGroups: GroupData[];
  };
}

export interface GroupResponse {
  success: string;
  message: string;
  data: GroupMemberData[];
}

export interface UpdateGroupResponse {
  success: string;
  message: string;
  data: [number, [Group]];
}

export interface UpdateMemberResponse {
  success: string;
  message: string;
  data: GroupMemberData;
}

export interface GroupMessageData {
  group_message_id: string;
  group_id: string;
  sender_id: string;
  senderName: string;
  senderImage?: string;
  message: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface GroupMessageResponse {
  success: string;
  message: string;
  data: GroupMessageData[];
}

export interface ExpenseParticipant {
  expense_participant_id: string;
  debtor_id: string;
  debtor_amount: string;
  group_expense_id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface GroupExpenseData {
  group_expense_id: string;
  group_id: string;
  expense_name: string;
  payer_id: string;
  total_amount: string;
  description: string | null;
  receipt_url: string | null;
  split_type: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  payer: {
    fullName: string;
    imageUrl?: string;
  };
  total_debt_amount: string;
  user_debt: string;
  participants: ExpenseParticipant[];
}

export interface GroupExpenseResponse {
  success: string;
  message: string;
  data: {
    expense: GroupExpenseData;
    expenseParticipants: ExpenseParticipant[];
  };
}

export interface GroupSettlementData {
  group_settlement_id: string;
  settlement_amount: string;
  payer_id: string;
  debtor_id: string;
  group_id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  description: string | null;
  payer: {
    fullName: string;
    imageUrl?: string;
  };
  debtor: {
    fullName: string;
    imageUrl?: string;
  };
}

export interface GroupSettlementResponse {
  success: string;
  message: string;
  data: GroupSettlementData;
}

export interface FetchExpenseResponse {
  success: string;
  message: string;
  data: (GroupExpenseData | GroupSettlementData)[];
}

export interface Debtors {
  debtor_id: string;
  debtor_share: number;
}

export interface GroupExpenseInput {
  expense_name: string;
  total_amount: number;
  payer_id: string;
  description?: string;
  split_type: string;
  payer_share: number;
  debtors: Debtors[];
}

export interface GroupSettlementInput {
  payer_id: string;
  debtor_id: string;
  settlement_amount: number;
  description?: string;
}

export interface CombinedGroupMessage extends GroupMessageData {
  type: string;
}

export interface CombinedGroupExpense extends GroupExpenseData {
  type: string;
}

export interface CombinedGroupSettlement extends GroupSettlementData {
  type: string;
}

export interface CombinedView {
  success: string;
  message: string;
  data: (
    | CombinedGroupExpense
    | CombinedGroupSettlement
    | CombinedGroupMessage
  )[];
}

export interface ExpenseDeletedEvent {
  id: string;
  payerId: string;
  debtorAmount: string;
}