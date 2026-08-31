import { THEME_NAMES } from "./themes";
import { WALLPAPERS } from "./desktop/wallpaper-data";

export const THEME_INIT_SCRIPT = `(function(){
var d=document.documentElement,t=null;
try{t=localStorage.getItem('yavor.theme');}catch(e){}
var valid=${JSON.stringify(THEME_NAMES)};
if(valid.indexOf(t)===-1){t=null;
try{if(matchMedia('(prefers-color-scheme: light)').matches)t='paper';}catch(e){}}
d.dataset.theme=t||'void';
try{d.dataset.boot=matchMedia('(prefers-reduced-motion: reduce)').matches?'static':(localStorage.getItem('yc:boot:v1')?'short':'full');}catch(e){d.dataset.boot='full';}
var wp=${JSON.stringify(Object.fromEntries(WALLPAPERS.map((w) => [w.id, w.css])))};
var id='sonoma';try{var v=localStorage.getItem('yavor.wallpaper');if(v&&wp[v])id=v;}catch(e){}
d.style.setProperty('--wallpaper',wp[id]);
})();`;
