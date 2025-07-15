import React, { createContext, useState, useContext } from 'react';

// Create the context
const UserContext = createContext();

// Create a provider component
export const UserProvider = ({ children }) => {
    const [userName, setUserName] = useState('User'); // Default user name
    const [profileImage, setProfileImage] = useState(null); // Default profile image

    return (
        <UserContext.Provider value={{ userName, setUserName, profileImage, setProfileImage }}>
            {children}
        </UserContext.Provider>
    );
};

// Create a custom hook to use the UserContext
export const useUser = () => {
    return useContext(UserContext);
};
