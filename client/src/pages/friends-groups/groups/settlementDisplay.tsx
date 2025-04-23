import React from "react";
import { GroupSettlementData } from "./index.model";
import { format } from "date-fns";
import { ListItemAvatar, Avatar } from "@mui/material";

interface SettlementDisplayProps {
    isCurrentUserPayer: boolean,
    payerImageUrl: string,
    payerName: string,
    debtorName: string,
    settlement: GroupSettlementData,
    currentUserImageUrl: string
}

const SettlementCard: React.FC<SettlementDisplayProps> = ({
    isCurrentUserPayer,
    payerImageUrl,
    payerName,
    debtorName,
    settlement,
    currentUserImageUrl,
}) => {

    const formatCurrency = (amount: string) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(parseFloat(amount));
    };

    return (
        <li className={`flex mb-1 px-2 ${isCurrentUserPayer ? 'justify-end' : 'justify-start'}`}>
            {!isCurrentUserPayer && (
                // <img
                //     src={payerImageUrl || '/vite.svg'}
                //     alt="avatar"
                //     className="rounded-full inline-flex self-end mr-3 shadow-md"
                //     width="32"
                // />
                <ListItemAvatar className="rounded-full inline-flex self-end mr-3 shadow-md" sx={{ minWidth: 32 }}>
                    <Avatar alt="Avatar" src={payerImageUrl ?? `assets/image.png`} sx={{ width: 40, height: 40 }} />
                </ListItemAvatar>
            )}

            <div className="flex flex-col justify-between items-center max-w-[38vw] max-h-[15vh] bg-black/20 border border-white/5 backdrop-blur-md shadow-md text-[calc(0.5vw+0.5em)] rounded-2xl p-3">
                <div className="flex justify-between w-full mb-2">
                    <div>
                        <p className="mb-0 text-black">
                            {payerName} paid {debtorName}{' '}
                            {formatCurrency(settlement?.settlement_amount)}
                        </p>
                        {settlement?.description && (
                            <p className="text-gray-600 mb-0 text-sm">{settlement?.description}</p>
                        )}
                    </div>
                </div>
                <p className="text-xs self-end text-end text-black/70 justify-self-end">{format(new Date(settlement.createdAt), "hh:mm a")}</p>
            </div>

            {isCurrentUserPayer && (
                // <img
                //     src={currentUserImageUrl || '/vite.svg'}
                //     alt="avatar"
                //     className="rounded-full inline-flex self-end ml-3 shadow-md"
                //     width="32"
                // />
                <ListItemAvatar className="rounded-full inline-flex self-end ml-3 shadow-md" sx={{ minWidth: 32 }}>
                    <Avatar alt="Avatar" src={currentUserImageUrl ?? `assets/image.png`} sx={{ width: 40, height: 40 }} />
                </ListItemAvatar>
            )}
        </li>
    );
};

export default SettlementCard;
