import React, { createContext, useEffect, useState } from "react";

export const ToggleContext = createContext();

export const ToggleProvider = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);;

    const onClickHandler = () => {
        setCollapsed(!collapsed)
    };
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            setCollapsed(false); // Ensure the sidebar is expanded if token exists
        }
    }, []);
    return (
        <ToggleContext.Provider value={{ collapsed,onClickHandler }}>
            {children}
        </ToggleContext.Provider>
    );
};