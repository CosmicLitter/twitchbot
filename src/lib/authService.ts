import { writable } from 'svelte/store';

export const authService = (() => {
	const { subscribe, set, update } = writable({ accessToken: 'test', sessionId: 'testing' });

	return {
		subscribe,
		setAccessToken: (token: string) => update((state) => ({ ...state, accessToken: token })),
		setSessionId: (sessionId: string) => update((state) => ({ ...state, sessionId: sessionId }))
	};
})();
