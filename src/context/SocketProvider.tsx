/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppDispatch, useAppSelector } from '../store';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;

}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,

});

export const useSocket = () => useContext(SocketContext);
export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const { user } = useAppSelector(state => state.userStore);
    const SOCKET_URL = 'https://socket.searchtalents.co/';
    useEffect(() => {
        const a = async () => {
            if (!user?.id) return;
            const role = await AsyncStorage.getItem("role") as "seeker" | "recruiter"
            const newSocket = io(SOCKET_URL, {
                auth: {
                    user_id: user.id,
                    role: role === "recruiter" ? "company" : "seeker"
                },
            });
            newSocket.connect()
            newSocket.on("connect", () => {
                setIsConnected(true);
            });
            setSocket(newSocket);
        }
        a()
        return () => {
        };
    }, [user?.id]);
    return (
        <SocketContext.Provider value={{
            socket,
            isConnected,
        }}>
            {children}
        </SocketContext.Provider>
    );
};