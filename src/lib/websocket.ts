// import { WebsocketBuilder, WebsocketEvent, Websocket } from 'websocket-ts';
//
// let ws: Websocket;
//
// export function initWebSocket() {
// if (!ws) {
// ws = new WebsocketBuilder('wss://eventsub.wss.twitch.tv/ws').build();
// ws.addEventListener(WebsocketEvent.open, () => console.log('Opened!'));
// ws.addEventListener(WebsocketEvent.close, () => console.log('Closed!'));
// ws.addEventListener(WebsocketEvent.message, echoOnMessage);
// } else {
// console.log('Using existing connection');
// }
//
// console.log('WebSocket initialized');
// return ws;
// }
//
// export function isConnected() {
// return !!ws;
// }
//
// export function logWs() {
// console.log(ws);
// }
//
// function echoOnMessage(ws: Websocket, ev: MessageEvent) {
// console.log('Received:', ev.data);
// }
//
