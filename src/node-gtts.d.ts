
declare module 'node-gtts' {
    export default class gtts {
        public constructor(lang: string);
        stream(str: string): any;
    }
}