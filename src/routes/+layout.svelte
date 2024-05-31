<script lang="ts">
	import { EventSubWsListener } from '@twurple/eventsub-ws';
	import '../app.css';
	import { StaticAuthProvider } from '@twurple/auth';
	import { Button } from '$lib/components/ui/button';
	import { ApiClient, HelixCustomReward } from '@twurple/api';
	import { onDestroy } from 'svelte';
	import { PUBLIC_ELEVENLABS_API_KEY } from '$env/static/public';
	import type { GetVoicesResponse } from '$lib/types';
	import * as Select from '$lib/components/ui/select';
	import type { Selected } from 'bits-ui';

	// Most events are tied to the permissions of VIEWER
	const VIEWER = 'ENTER_TWITCH_USERNAME_HERE';
	const BROADCASTER = 'ENTER_TWITCH_USERNAME_HERE';

	const CLIENT_ID = 'wryq0ptbcqok7crz9ajvlj25e05tqp';
	const REDIRECT_URI = 'http://localhost:5173/oauth';
	const SCOPES = `channel%3Aread%3Aredemptions+user%3Aread%3Achat`;
	const authURL = `https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${SCOPES}`;

	$: connected = false;
	let authProvider: StaticAuthProvider;
	let apiClient: ApiClient;
	let eventSubWsListener: EventSubWsListener;

	let messages: String[] = [];
	$: messages;

	let voices: GetVoicesResponse = [];
	if (localStorage.getItem('voices')) {
		voices = JSON.parse(localStorage.getItem('voices')!);
	}
	// $: voices;
	// $: console.log(voices);

	let voice: Selected<unknown>;
	$: voice;

	async function init() {
		authProvider = new StaticAuthProvider(CLIENT_ID, localStorage.getItem('token')!);
		apiClient = new ApiClient({ authProvider });

		let broadcaster = await getUserID(BROADCASTER);
		let viewer = await getUserID(VIEWER);
		let ttsRewardID = await getTTSReward();

		eventSubWsListener = new EventSubWsListener({ apiClient });

		eventSubWsListener.start();

		eventSubWsListener.onChannelChatMessage(broadcaster!, viewer!, (message) => {
			messages = [...messages, message.messageText];
		});

		eventSubWsListener.onChannelRedemptionAddForReward(broadcaster!, ttsRewardID!, (redemption) => {
			console.log('Redemption Details: ', redemption);

			// Text to speech input from TTS reward.
			const text = redemption.input;
			processTTS(text);
		});
	}

	async function testTTS() {
		await fetch('/api/elevenlabs', {
			method: 'POST'
		});
	}

	async function getVoices() {
		const headers = new Headers({
			'xi-api-key': PUBLIC_ELEVENLABS_API_KEY
		});
		const options = { method: 'GET', headers };
		const response = await fetch('https://api.elevenlabs.io/v1/voices', options);
		console.log(response);
		const data = await response.json();
		console.log(data);
		localStorage.setItem('voices', JSON.stringify(data.voices));
		voices = data.voices;
	}

	async function getUserID(username: string) {
		let user = await apiClient.users.getUserByName(username);
		return user?.id;
	}

	async function getTTSReward() {
		let broadcaster = await getUserID(BROADCASTER);
		let rewards: HelixCustomReward[] = await apiClient.channelPoints.getCustomRewards(broadcaster!);

		return rewards.find((reward) => reward.title === 'TTS Test')?.id;
	}

	async function processTTS(text: string) {
		if (!voice) {
			alert('Please select a voice');
			return;
		}
		const headers = new Headers({
			Accept: 'audio/mpeg',
			'Content-Type': 'application/json',
			'xi-api-key': PUBLIC_ELEVENLABS_API_KEY
		});

		const body = {
			text,
			voice_settings: {
				stability: 0.5,
				similarity_boost: 0.7
			}
		};

		const options = {
			method: 'POST',
			headers,
			body: JSON.stringify(body)
		};

		console.log(options);

		const response = await fetch(
			`https://api.elevenlabs.io/v1/text-to-speech/${voice.value}`,
			options
		);

		if (response.ok) {
			const blob = await response.blob();
			const audioUrl = URL.createObjectURL(blob);
			const audio = new Audio(audioUrl);
			audio.play();
		}
	}
	onDestroy(() => {
		eventSubWsListener!.stop();
	});

	if (localStorage.getItem('token')) {
		init();
		connected = true;
	} else {
		connected = false;
	}
</script>

{#if localStorage.getItem('token')}
	Twitch Account Connected
{:else}
	<Button href={authURL} variant="secondary">Connect Account</Button>
{/if}

<!-- {JSON.stringify(messages)} -->

<Button on:click={() => eventSubWsListener.stop()} variant="secondary">Unsubscribe</Button>
{#each messages as message}
	<p>{message}</p>
{/each}

<!-- <Button on:click={getTTSReward} variant="secondary">Get TTS Reward</Button> -->

<!-- <Button on:click={() => processTTS('woopdee doo')} variant="secondary">Test TTS</Button> -->

<!-- <Button on:click={testTTS} variant="secondary">Test TTS</Button> -->

<Button on:click={getVoices} variant="secondary">Get Voices</Button>

<!-- <Button on:click={processTTS} variant="secondary">Test TTS</Button> -->

<!-- {#each voices as voice}
	<p>{voice.name}</p>
{/each} -->
<Select.Root bind:selected={voice}>
	<Select.Trigger class="w-[180px]">
		<Select.Value placeholder="Select a Voice" />
	</Select.Trigger>
	<Select.Content>
		<Select.Group>
			<Select.Label>Voices</Select.Label>
			{#each voices as voice}
				<Select.Item value={voice.voice_id}>{voice.name}</Select.Item>
			{/each}
		</Select.Group>
	</Select.Content>
</Select.Root>

<!-- <pre>
{JSON.stringify(voice, null, 2)}
</pre> -->
{#if voice}
	{voice.value}
{/if}
<slot />
