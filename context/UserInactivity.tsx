import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV({
    id: 'UserInactivity',
});

const LOCK_TIME = 1000;

interface UserInactivityProviderProps {
    children: React.ReactNode;
}

export const UserInactivityProvider = ({ children }: UserInactivityProviderProps) => {
    const appState = useRef(AppState.currentState);
    const router = useRouter();

    useEffect(() => {
        const subscription = AppState.addEventListener('change', handleAppStateChange);
        
        // Cleanup subscription on unmount
        return () => {
            subscription?.remove();
        };
    }, []);

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
        console.log('appState', appState.current, nextAppState);
        
        if (nextAppState === 'inactive') {
            router.push('/(modals)/white');
        } else if (nextAppState === 'active') {
            // Only try to go back if we can actually go back
            if (router.canGoBack()) {
                router.back();
            }
        }

        if (nextAppState === 'background') {
            recordStateTime();
        } else if (nextAppState === 'active' && appState.current.includes('background')) {
            const elapsed = Date.now() - (storage.getNumber('startTime') || 0);

            if (elapsed >= LOCK_TIME) {
                router.push('/(modals)/lock');
            }
        }
        
        // Update the current app state
        appState.current = nextAppState;
    };

    const recordStateTime = () => {
        storage.set('startTime', Date.now());
    };
    return children;
};