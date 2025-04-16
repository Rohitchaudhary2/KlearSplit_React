import React from "react";
import { GroupExpenseData } from "./index.model";
import { format } from "date-fns";

const ExpenseItem: React.FC<{
  expense: GroupExpenseData;
  isCurrentUserPayer: boolean;
  imageUrl: string;
  currentUserImageUrl: string;
}> = ({ expense, isCurrentUserPayer, imageUrl, currentUserImageUrl }) => {
  const startsWithPrefix = (id: string, prefix: string) => id.startsWith(prefix);
  const onRetryExpenseAddition = (id: string) => {
    console.log(id);
  }
  return (
    <li className={`flex mb-1 px-2 ${isCurrentUserPayer ? "justify-end" : "justify-start"}`}>
      {/* Avatar for other user */}
      {!isCurrentUserPayer && (
        <img
          src={imageUrl || "/profile.png"}
          alt="avatar"
          className="rounded-full inline-flex self-end mr-3 shadow-md"
          width="32"
        />
      )}

      {/* Expense Card */}
      <div className="flex justify-between items-center max-w-[38vw] max-h-[15vh] bg-black/20 border border-white/5 backdrop-blur-md shadow-md text-[calc(0.5vw+0.5em)] rounded-2xl p-3">
        {/* Status handling */}
        {startsWithPrefix(expense.group_expense_id, "adding") ? (
          <div className="flex items-center justify-center w-[15vw] h-[10vh] text-black rounded-2xl">
            <p>Adding Expense...</p>
          </div>
        ) : startsWithPrefix(expense.group_expense_id, "error") ? (
          <div className="flex items-center justify-around p-3 w-[15vw] h-[10vh] text-black bg-red-400 rounded-2xl">
            <button className="btn btn-sm" onClick={() => onRetryExpenseAddition(expense.group_expense_id)}>
              Retry
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="inline ml-1" viewBox="0 0 16 16">
                <path d="M11 5.466V4H5a4 4 0 0 0-3.584 5.777.5.5 0 1 1-.896.446A5 5 0 0 1 5 3h6V1.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192m3.81.086a.5.5 0 0 1 .67.225A5 5 0 0 1 11 13H5v1.466a.25.25 0 0 1-.41.192l-2.36-1.966a.25.25 0 0 1 0-.384l2.36-1.966a.25.25 0 0 1 .41.192V12h6a4 4 0 0 0 3.585-5.777.5.5 0 0 1 .225-.67Z" />
              </svg>
            </button>
            <div className="bg-transparent border-none text-center">
              <p className="font-bold mb-0">{expense.expense_name}</p>
              <p className="mb-0">{expense.total_amount}</p>
            </div>
          </div>
        ) : startsWithPrefix(expense.group_expense_id, "retry") ? (
          <div className="flex items-center justify-center w-[15vw] h-[10vh] text-black">
            <div>Retrying...</div>
          </div>
        ) : (
          <>
            <div className="px-3 text-black max-w-[10vw] break-words">
              <p className="m-0">{expense.expense_name}</p>
            </div>

            <div className="bg-transparent border-none text-center mr-2">
              <p className="font-bold">{isCurrentUserPayer ? "You paid" : `${expense.payer.fullName} paid`}</p>
              <p>{expense.total_amount}</p>
              <div className="flex justify-end items-end w-full text-xs text-gray-700">
                <span>&#8193;</span>
              </div>
            </div>

            <div className="bg-transparent border-none text-center">
              <p className="font-bold">{isCurrentUserPayer ? "You lent" : `${expense.payer.fullName} lent`}</p>
              <p>{expense.total_debt_amount}</p>
              <p className="text-xs text-black/70 justify-self-end">{format(new Date(expense.createdAt), "hh:mm a")}</p>
            </div>
          </>
        )}
      </div>

      {/* Avatar for current user */}
      {isCurrentUserPayer && (
        <img
          src={currentUserImageUrl || "/profile.png"}
          alt="avatar"
          className="rounded-full inline-flex self-end ml-3 shadow-md"
          width="32"
        />
      )}
    </li>
  );
};

export default ExpenseItem;
