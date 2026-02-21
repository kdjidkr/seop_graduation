'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AdminContextType {
    isAdmin: boolean;
    login: (password: string) => boolean;
    logout: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const adminStatus = localStorage.getItem('is_seungseop_admin');
        if (adminStatus === 'true') {
            setIsAdmin(true);
        }
    }, []);

    const login = (password: string) => {
        if (password === 'dltmdtjq123!') {
            setIsAdmin(true);
            localStorage.setItem('is_seungseop_admin', 'true');
            return true;
        }
        return false;
    };

    const logout = () => {
        setIsAdmin(false);
        localStorage.removeItem('is_seungseop_admin');
    };

    return (
        <AdminContext.Provider value={{ isAdmin, login, logout }}>
            {children}
        </AdminContext.Provider>
    );
}

export function useAdmin() {
    const context = useContext(AdminContext);
    if (context === undefined) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
}
