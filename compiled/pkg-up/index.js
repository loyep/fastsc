(function(){"use strict";var e={};!function(){e.d=function(t,n){for(var r in n){if(e.o(n,r)&&!e.o(t,r)){Object.defineProperty(t,r,{enumerable:true,get:n[r]})}}}}();!function(){e.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)}}();!function(){e.r=function(e){if(typeof Symbol!=="undefined"&&Symbol.toStringTag){Object.defineProperty(e,Symbol.toStringTag,{value:"Module"})}Object.defineProperty(e,"__esModule",{value:true})}}();if(typeof e!=="undefined")e.ab=__dirname+"/";var t={};e.r(t);e.d(t,{pkgUp:function(){return pkgUp},pkgUpSync:function(){return pkgUpSync}});var n=require("path");var r=require("url");var c=require("process");var i=require("fs");class Node{value;next;constructor(e){this.value=e}}class Queue{#e;#t;#n;constructor(){this.clear()}enqueue(e){const t=new Node(e);if(this.#e){this.#t.next=t;this.#t=t}else{this.#e=t;this.#t=t}this.#n++}dequeue(){const e=this.#e;if(!e){return}this.#e=this.#e.next;this.#n--;return e.value}clear(){this.#e=undefined;this.#t=undefined;this.#n=0}get size(){return this.#n}*[Symbol.iterator](){let e=this.#e;while(e){yield e.value;e=e.next}}}function pLimit(e){if(!((Number.isInteger(e)||e===Number.POSITIVE_INFINITY)&&e>0)){throw new TypeError("Expected `concurrency` to be a number from 1 and up")}const t=new Queue;let n=0;const next=()=>{n--;if(t.size>0){t.dequeue()()}};const run=async(e,t,r)=>{n++;const c=(async()=>e(...r))();t(c);try{await c}catch{}next()};const enqueue=(r,c,i)=>{t.enqueue(run.bind(undefined,r,c,i));(async()=>{await Promise.resolve();if(n<e&&t.size>0){t.dequeue()()}})()};const generator=(e,...t)=>new Promise((n=>{enqueue(e,n,t)}));Object.defineProperties(generator,{activeCount:{get:()=>n},pendingCount:{get:()=>t.size},clearQueue:{value:()=>{t.clear()}}});return generator}class EndError extends Error{constructor(e){super();this.value=e}}const testElement=async(e,t)=>t(await e);const finder=async e=>{const t=await Promise.all(e);if(t[1]===true){throw new EndError(t[0])}return false};async function pLocate(e,t,{concurrency:n=Number.POSITIVE_INFINITY,preserveOrder:r=true}={}){const c=pLimit(n);const i=[...e].map((e=>[e,c(testElement,e,t)]));const o=pLimit(r?1:Number.POSITIVE_INFINITY);try{await Promise.all(i.map((e=>o(finder,e))))}catch(e){if(e instanceof EndError){return e.value}throw e}}const o={directory:"isDirectory",file:"isFile"};function checkType(e){if(Object.hasOwnProperty.call(o,e)){return}throw new Error(`Invalid type specified: ${e}`)}const matchType=(e,t)=>t[o[e]]();const toPath=e=>e instanceof URL?(0,r.fileURLToPath)(e):e;async function locatePath(e,{cwd:t=c.cwd(),type:r="file",allowSymlinks:o=true,concurrency:s,preserveOrder:a}={}){checkType(r);t=toPath(t);const u=o?i.promises.stat:i.promises.lstat;return pLocate(e,(async e=>{try{const c=await u(n.resolve(t,e));return matchType(r,c)}catch{return false}}),{concurrency:s,preserveOrder:a})}function locatePathSync(e,{cwd:t=c.cwd(),type:r="file",allowSymlinks:o=true}={}){checkType(r);t=toPath(t);const s=o?i.statSync:i.lstatSync;for(const c of e){try{const e=s(n.resolve(t,c));if(matchType(r,e)){return c}}catch{}}}async function pathExists(e){try{await fsPromises.access(e);return true}catch{return false}}function pathExistsSync(e){try{fs.accessSync(e);return true}catch{return false}}const find_up_toPath=e=>e instanceof URL?(0,r.fileURLToPath)(e):e;const s=Symbol("findUpStop");async function findUpMultiple(e,t={}){let r=n.resolve(find_up_toPath(t.cwd)||"");const{root:c}=n.parse(r);const i=n.resolve(r,t.stopAt||c);const o=t.limit||Number.POSITIVE_INFINITY;const a=[e].flat();const runMatcher=async t=>{if(typeof e!=="function"){return locatePath(a,t)}const n=await e(t.cwd);if(typeof n==="string"){return locatePath([n],t)}return n};const u=[];while(true){const e=await runMatcher({...t,cwd:r});if(e===s){break}if(e){u.push(n.resolve(r,e))}if(r===i||u.length>=o){break}r=n.dirname(r)}return u}function findUpMultipleSync(e,t={}){let r=n.resolve(find_up_toPath(t.cwd)||"");const{root:c}=n.parse(r);const i=t.stopAt||c;const o=t.limit||Number.POSITIVE_INFINITY;const a=[e].flat();const runMatcher=t=>{if(typeof e!=="function"){return locatePathSync(a,t)}const n=e(t.cwd);if(typeof n==="string"){return locatePathSync([n],t)}return n};const u=[];while(true){const e=runMatcher({...t,cwd:r});if(e===s){break}if(e){u.push(n.resolve(r,e))}if(r===i||u.length>=o){break}r=n.dirname(r)}return u}async function findUp(e,t={}){const n=await findUpMultiple(e,{...t,limit:1});return n[0]}function findUpSync(e,t={}){const n=findUpMultipleSync(e,{...t,limit:1});return n[0]}async function pkgUp({cwd:e}={}){return findUp("package.json",{cwd:e})}function pkgUpSync({cwd:e}={}){return findUpSync("package.json",{cwd:e})}module.exports=t})();