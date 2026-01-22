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
    // const SOCKET_URL = 'http://192.168.1.4:4000/';
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

            newSocket.on("connect_error", (error) => {
                console.error("❌ connect_error");
                console.error("Message:", error.message);
                console.error("Name:", error.name);
                console.error("Stack:", error.stack);
            });

            newSocket.on("error", (error) => {
                console.error("❌ socket error:", error);
            });

            newSocket.on("disconnect", (reason) => {
                console.warn("⚠️ Socket disconnected:", reason);
            });

            newSocket.on("reconnect_attempt", (attempt) => {
            });

            newSocket.on("reconnect_failed", () => {
                console.error("❌ Reconnection failed");
            });
            setSocket(newSocket);
        }
        a()
        return () => {
            // newSocket.disconnect();
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