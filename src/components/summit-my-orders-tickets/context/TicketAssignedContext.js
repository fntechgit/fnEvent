import React, { createContext, useContext, useCallback } from 'react';

export const TicketAssignedContext = createContext(null);

export const TicketAssignedProvider = ({ children, onTicketAssigned }) => {
    
    const onTicketAssignChange = useCallback((ticket) => {
        onTicketAssigned(ticket);
    }, []);

    return (
        <TicketAssignedContext.Provider value={{ onTicketAssignChange }}>
            {children}
        </TicketAssignedContext.Provider>
    );
};

export const useTicketAssignedContext = () => {
    const context = useContext(TicketAssignedContext);

    if (!context) throw new Error('useTicketAssignedContext must be used within a TicketAssignedProvider');

    return { ...context };
};