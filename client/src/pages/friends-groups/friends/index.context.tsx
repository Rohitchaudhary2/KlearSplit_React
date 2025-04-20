import { createContext, ReactNode, useState } from "react";
import { Friend } from "./index.model";
interface FriendsContextType {
    selectedFriend: Friend | undefined,
    view: 'All' | 'Messages' | 'Expenses',
    friends: Friend[],
    friendRequests: Friend[],
    handleSelectFriend: (friend: Friend) => void,
    handleViewChange: (view: 'All' | 'Messages' | 'Expenses') => void,
    handleFriendsChange: (friends: Friend[]) => void,
    handleFriendRequestsChange: (friendRequests: Friend[]) => void,
}

export const friendsContext = createContext<FriendsContextType>({
    selectedFriend: undefined,
    view: 'All',
    friends: [],
    friendRequests: [],
    handleSelectFriend: () => {},
    handleViewChange: () => {},
    handleFriendsChange: () => {},
    handleFriendRequestsChange: () => {},
});

export default function FriendContextProvider({ children }: { children: ReactNode }) {
    const [selectedFriend, setSelectedFriend] = useState<Friend | undefined>(undefined);
    const [view, setView] = useState<'All' | 'Messages' | 'Expenses'>('All');
    const [friends, setFriends] = useState<Friend[]>([]);
    const [friendRequests, setFriendRequests] = useState<Friend[]>([]);

    const handleSelectFriend = (friend: Friend) => {
        setSelectedFriend(friend);
    }

    const handleViewChange = (view: 'All' | 'Messages' | 'Expenses') => {
        setView(view);
    }

    const handleFriendsChange = (friends: Friend[]) => {
        setFriends(friends);
    }

    const handleFriendRequestsChange = (friendRequests: Friend[]) => {
        setFriendRequests(friendRequests);
    }

    const state = {
        selectedFriend,
        view,
        friends,
        friendRequests,
        handleSelectFriend,
        handleViewChange,
        handleFriendsChange,
        handleFriendRequestsChange,
    }

    return (
        <friendsContext.Provider value={state}>
            {children}
        </friendsContext.Provider>
    );
}
