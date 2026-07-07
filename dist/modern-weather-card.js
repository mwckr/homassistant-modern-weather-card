const t="modern-weather-card",e="modern-weather-card-editor",i={show_forecast:!0,show_low_temp:!1,show_no_temp:!1,forecast_days:5,sun_entity:"sun.sun",time_format:"default",alert_lookahead:12,tap_action:{action:"more-info"}},s={sunny:{forecastIcon:"sun",skyClass:"clear"},"clear-night":{forecastIcon:"moon",skyClass:"clear"},partlycloudy:{forecastIcon:"sun-cloud",skyClass:"clear"},cloudy:{forecastIcon:"cloud",skyClass:"cloudy"},fog:{forecastIcon:"cloud",skyClass:"fog",group:"fog",notable:!0},rainy:{forecastIcon:"rain",skyClass:"rain",group:"rain",notable:!0},pouring:{forecastIcon:"rain",skyClass:"rain",group:"rain",notable:!0},hail:{forecastIcon:"rain",skyClass:"rain",group:"rain",notable:!0},lightning:{forecastIcon:"lightning",skyClass:"storm",group:"thunder",notable:!0},"lightning-rainy":{forecastIcon:"lightning",skyClass:"storm",group:"rain",notable:!0},snowy:{forecastIcon:"snow",skyClass:"snow",group:"snow",notable:!0},"snowy-rainy":{forecastIcon:"snow",skyClass:"snow",group:"snow",notable:!0},windy:{forecastIcon:"cloud",skyClass:"clear",group:"wind",notable:!0},"windy-variant":{forecastIcon:"cloud",skyClass:"clear",group:"wind",notable:!0},exceptional:{forecastIcon:"warning",skyClass:"clear"}},n=t=>s[t]?.notable??!1,r=t=>s[t]?.group??t;function o(t,e,i,s){var n,r=arguments.length,o=r<3?e:null===s?s=Object.getOwnPropertyDescriptor(e,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(t,e,i,s);else for(var a=t.length-1;a>=0;a--)(n=t[a])&&(o=(r<3?n(o):r>3?n(e,i,o):n(e,i))||o);return r>3&&o&&Object.defineProperty(e,i,o),o}"function"==typeof SuppressedError&&SuppressedError;const a=globalThis,l=a.ShadowRoot&&(void 0===a.ShadyCSS||a.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,c=Symbol(),d=new WeakMap;let h=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==c)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(l&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=d.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&d.set(e,t))}return t}toString(){return this.cssText}};const u=l?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new h("string"==typeof t?t:t+"",void 0,c))(e)})(t):t,{is:f,defineProperty:p,getOwnPropertyDescriptor:g,getOwnPropertyNames:m,getOwnPropertySymbols:y,getPrototypeOf:$}=Object,b=globalThis,_=b.trustedTypes,v=_?_.emptyScript:"",w=b.reactiveElementPolyfillSupport,x=(t,e)=>t,C={toAttribute(t,e){switch(e){case Boolean:t=t?v:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},k=(t,e)=>!f(t,e),A={attribute:!0,type:String,converter:C,reflect:!1,useDefault:!1,hasChanged:k};Symbol.metadata??=Symbol("metadata"),b.litPropertyMetadata??=new WeakMap;let T=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=A){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(t,i,e);void 0!==s&&p(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){const{get:s,set:n}=g(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:s,set(e){const r=s?.call(this);n?.call(this,e),this.requestUpdate(t,r,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??A}static _$Ei(){if(this.hasOwnProperty(x("elementProperties")))return;const t=$(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(x("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(x("properties"))){const t=this.properties,e=[...m(t),...y(t)];for(const i of e)this.createProperty(i,t[i])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,i]of e)this.elementProperties.set(t,i)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(u(t))}else void 0!==t&&e.push(u(t));return e}static _$Eu(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,e)=>{if(l)t.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const i of e){const e=document.createElement("style"),s=a.litNonce;void 0!==s&&e.setAttribute("nonce",s),e.textContent=i.cssText,t.appendChild(e)}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){const i=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,i);if(void 0!==s&&!0===i.reflect){const n=(void 0!==i.converter?.toAttribute?i.converter:C).toAttribute(e,i.type);this._$Em=t,null==n?this.removeAttribute(s):this.setAttribute(s,n),this._$Em=null}}_$AK(t,e){const i=this.constructor,s=i._$Eh.get(t);if(void 0!==s&&this._$Em!==s){const t=i.getPropertyOptions(s),n="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:C;this._$Em=s;const r=n.fromAttribute(e,t.type);this[s]=r??this._$Ej?.get(s)??r,this._$Em=null}}requestUpdate(t,e,i,s=!1,n){if(void 0!==t){const r=this.constructor;if(!1===s&&(n=this[t]),i??=r.getPropertyOptions(t),!((i.hasChanged??k)(n,e)||i.useDefault&&i.reflect&&n===this._$Ej?.get(t)&&!this.hasAttribute(r._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:s,wrapped:n},r){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??e??this[t]),!0!==n||void 0!==r)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===s&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,i]of t){const{wrapped:t}=i,s=this[e];!0!==t||this._$AL.has(e)||void 0===s||this.C(e,void 0,i,s)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};T.elementStyles=[],T.shadowRootOptions={mode:"open"},T[x("elementProperties")]=new Map,T[x("finalized")]=new Map,w?.({ReactiveElement:T}),(b.reactiveElementVersions??=[]).push("2.1.2");const S=globalThis,E=t=>t,M=S.trustedTypes,N=M?M.createPolicy("lit-html",{createHTML:t=>t}):void 0,O="$lit$",U=`lit$${Math.random().toFixed(9).slice(2)}$`,P="?"+U,G=`<${P}>`,B=document,F=()=>B.createComment(""),R=t=>null===t||"object"!=typeof t&&"function"!=typeof t,z=Array.isArray,L="[ \t\n\f\r]",I=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,H=/-->/g,D=/>/g,j=RegExp(`>|${L}(?:([^\\s"'>=/]+)(${L}*=${L}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),W=/'/g,Z=/"/g,q=/^(?:script|style|textarea|title)$/i,V=(t=>(e,...i)=>({_$litType$:t,strings:e,values:i}))(1),Q=Symbol.for("lit-noChange"),K=Symbol.for("lit-nothing"),J=new WeakMap,Y=B.createTreeWalker(B,129);function X(t,e){if(!z(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==N?N.createHTML(e):e}const tt=(t,e)=>{const i=t.length-1,s=[];let n,r=2===e?"<svg>":3===e?"<math>":"",o=I;for(let e=0;e<i;e++){const i=t[e];let a,l,c=-1,d=0;for(;d<i.length&&(o.lastIndex=d,l=o.exec(i),null!==l);)d=o.lastIndex,o===I?"!--"===l[1]?o=H:void 0!==l[1]?o=D:void 0!==l[2]?(q.test(l[2])&&(n=RegExp("</"+l[2],"g")),o=j):void 0!==l[3]&&(o=j):o===j?">"===l[0]?(o=n??I,c=-1):void 0===l[1]?c=-2:(c=o.lastIndex-l[2].length,a=l[1],o=void 0===l[3]?j:'"'===l[3]?Z:W):o===Z||o===W?o=j:o===H||o===D?o=I:(o=j,n=void 0);const h=o===j&&t[e+1].startsWith("/>")?" ":"";r+=o===I?i+G:c>=0?(s.push(a),i.slice(0,c)+O+i.slice(c)+U+h):i+U+(-2===c?e:h)}return[X(t,r+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),s]};class et{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let n=0,r=0;const o=t.length-1,a=this.parts,[l,c]=tt(t,e);if(this.el=et.createElement(l,i),Y.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(s=Y.nextNode())&&a.length<o;){if(1===s.nodeType){if(s.hasAttributes())for(const t of s.getAttributeNames())if(t.endsWith(O)){const e=c[r++],i=s.getAttribute(t).split(U),o=/([.?@])?(.*)/.exec(e);a.push({type:1,index:n,name:o[2],strings:i,ctor:"."===o[1]?ot:"?"===o[1]?at:"@"===o[1]?lt:rt}),s.removeAttribute(t)}else t.startsWith(U)&&(a.push({type:6,index:n}),s.removeAttribute(t));if(q.test(s.tagName)){const t=s.textContent.split(U),e=t.length-1;if(e>0){s.textContent=M?M.emptyScript:"";for(let i=0;i<e;i++)s.append(t[i],F()),Y.nextNode(),a.push({type:2,index:++n});s.append(t[e],F())}}}else if(8===s.nodeType)if(s.data===P)a.push({type:2,index:n});else{let t=-1;for(;-1!==(t=s.data.indexOf(U,t+1));)a.push({type:7,index:n}),t+=U.length-1}n++}}static createElement(t,e){const i=B.createElement("template");return i.innerHTML=t,i}}function it(t,e,i=t,s){if(e===Q)return e;let n=void 0!==s?i._$Co?.[s]:i._$Cl;const r=R(e)?void 0:e._$litDirective$;return n?.constructor!==r&&(n?._$AO?.(!1),void 0===r?n=void 0:(n=new r(t),n._$AT(t,i,s)),void 0!==s?(i._$Co??=[])[s]=n:i._$Cl=n),void 0!==n&&(e=it(t,n._$AS(t,e.values),n,s)),e}class st{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,s=(t?.creationScope??B).importNode(e,!0);Y.currentNode=s;let n=Y.nextNode(),r=0,o=0,a=i[0];for(;void 0!==a;){if(r===a.index){let e;2===a.type?e=new nt(n,n.nextSibling,this,t):1===a.type?e=new a.ctor(n,a.name,a.strings,this,t):6===a.type&&(e=new ct(n,this,t)),this._$AV.push(e),a=i[++o]}r!==a?.index&&(n=Y.nextNode(),r++)}return Y.currentNode=B,s}p(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class nt{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,s){this.type=2,this._$AH=K,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=it(this,t,e),R(t)?t===K||null==t||""===t?(this._$AH!==K&&this._$AR(),this._$AH=K):t!==this._$AH&&t!==Q&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>z(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==K&&R(this._$AH)?this._$AA.nextSibling.data=t:this.T(B.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:i}=t,s="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=et.createElement(X(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(e);else{const t=new st(s,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=J.get(t.strings);return void 0===e&&J.set(t.strings,e=new et(t)),e}k(t){z(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,s=0;for(const n of t)s===e.length?e.push(i=new nt(this.O(F()),this.O(F()),this,this.options)):i=e[s],i._$AI(n),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=E(t).nextSibling;E(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class rt{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,s,n){this.type=1,this._$AH=K,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=n,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=K}_$AI(t,e=this,i,s){const n=this.strings;let r=!1;if(void 0===n)t=it(this,t,e,0),r=!R(t)||t!==this._$AH&&t!==Q,r&&(this._$AH=t);else{const s=t;let o,a;for(t=n[0],o=0;o<n.length-1;o++)a=it(this,s[i+o],e,o),a===Q&&(a=this._$AH[o]),r||=!R(a)||a!==this._$AH[o],a===K?t=K:t!==K&&(t+=(a??"")+n[o+1]),this._$AH[o]=a}r&&!s&&this.j(t)}j(t){t===K?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class ot extends rt{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===K?void 0:t}}class at extends rt{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==K)}}class lt extends rt{constructor(t,e,i,s,n){super(t,e,i,s,n),this.type=5}_$AI(t,e=this){if((t=it(this,t,e,0)??K)===Q)return;const i=this._$AH,s=t===K&&i!==K||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,n=t!==K&&(i===K||s);s&&this.element.removeEventListener(this.name,this,i),n&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class ct{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){it(this,t)}}const dt=S.litHtmlPolyfillSupport;dt?.(et,nt),(S.litHtmlVersions??=[]).push("3.3.3");const ht=globalThis;let ut=class extends T{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{const s=i?.renderBefore??e;let n=s._$litPart$;if(void 0===n){const t=i?.renderBefore??null;s._$litPart$=n=new nt(e.insertBefore(F(),t),t,void 0,i??{})}return n._$AI(t),n})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return Q}};ut._$litElement$=!0,ut.finalized=!0,ht.litElementHydrateSupport?.({LitElement:ut});const ft=ht.litElementPolyfillSupport;ft?.({LitElement:ut}),(ht.litElementVersions??=[]).push("4.2.2");const pt=t=>(e,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(t,e)}):customElements.define(t,e)},gt={attribute:!0,type:String,converter:C,reflect:!1,hasChanged:k},mt=(t=gt,e,i)=>{const{kind:s,metadata:n}=i;let r=globalThis.litPropertyMetadata.get(n);if(void 0===r&&globalThis.litPropertyMetadata.set(n,r=new Map),"setter"===s&&((t=Object.create(t)).wrapped=!0),r.set(i.name,t),"accessor"===s){const{name:s}=i;return{set(i){const n=e.get.call(this);e.set.call(this,i),this.requestUpdate(s,n,t,!0,i)},init(e){return void 0!==e&&this.C(s,void 0,t,e),e}}}if("setter"===s){const{name:s}=i;return function(i){const n=this[s];e.call(this,i),this.requestUpdate(s,n,t,!0,i)}}throw Error("Unsupported decorator location: "+s)};function yt(t){return(e,i)=>"object"==typeof i?mt(t,e,i):((t,e,i)=>{const s=e.hasOwnProperty(i);return e.constructor.createProperty(i,t),s?Object.getOwnPropertyDescriptor(e,i):void 0})(t,e,i)}function $t(t){return yt({...t,state:!0,attribute:!1})}const bt=1,_t=2,vt=t=>(...e)=>({_$litDirective$:t,values:e});let wt=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,i){this._$Ct=t,this._$AM=e,this._$Ci=i}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}};const xt=vt(class extends wt{constructor(t){if(super(t),t.type!==bt||"class"!==t.name||t.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(t){return" "+Object.keys(t).filter(e=>t[e]).join(" ")+" "}update(t,[e]){if(void 0===this.st){this.st=new Set,void 0!==t.strings&&(this.nt=new Set(t.strings.join(" ").split(/\s/).filter(t=>""!==t)));for(const t in e)e[t]&&!this.nt?.has(t)&&this.st.add(t);return this.render(e)}const i=t.element.classList;for(const t of this.st)t in e||(i.remove(t),this.st.delete(t));for(const t in e){const s=!!e[t];s===this.st.has(t)||this.nt?.has(t)||(s?(i.add(t),this.st.add(t)):(i.remove(t),this.st.delete(t)))}return Q}}),Ct="important",kt=" !"+Ct,At=vt(class extends wt{constructor(t){if(super(t),t.type!==bt||"style"!==t.name||t.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(t){return Object.keys(t).reduce((e,i)=>{const s=t[i];return null==s?e:e+`${i=i.includes("-")?i:i.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${s};`},"")}update(t,[e]){const{style:i}=t.element;if(void 0===this.ft)return this.ft=new Set(Object.keys(e)),this.render(e);for(const t of this.ft)null==e[t]&&(this.ft.delete(t),t.includes("-")?i.removeProperty(t):i[t]=null);for(const t in e){const s=e[t];if(null!=s){this.ft.add(t);const e="string"==typeof s&&s.endsWith(kt);t.includes("-")||e?i.setProperty(t,e?s.slice(0,-11):s,e?Ct:""):i[t]=s}}return Q}});class Tt extends wt{constructor(t){if(super(t),this.it=K,t.type!==_t)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(t){if(t===K||null==t)return this._t=void 0,this.it=t;if(t===Q)return t;if("string"!=typeof t)throw Error(this.constructor.directiveName+"() called with a non-string value");if(t===this.it)return this._t;this.it=t;const e=[t];return e.raw=e,this._t={_$litType$:this.constructor.resultType,strings:e,values:[]}}}Tt.directiveName="unsafeHTML",Tt.resultType=1;const St=vt(Tt),Et=(t,e,i)=>{t.dispatchEvent(new CustomEvent(e,{bubbles:!0,composed:!0,detail:i}))},Mt={en:{alertUntil:"{condition} until {time}",alertIn:"{condition} in {mins} min",alertFrom:"{condition} from {time}"},de:{alertUntil:"{condition} bis {time} Uhr",alertIn:"{condition} in {mins} Min.",alertFrom:"{condition} ab {time} Uhr"}},Nt=(t,e,i={})=>{const s=(t?.language||navigator.language||"en").split("-")[0];let n=(Mt[s]||Mt.en)[e]||Mt.en[e];for(const[t,e]of Object.entries(i))n=n.replace(`{${t}}`,String(e));return n},Ot=(t,e,i="default")=>{const s=e?.language||navigator.language||"en",n=i&&"default"!==i?i:e?.time_format||"language",r={hour:"2-digit",minute:"2-digit"};if("24"===n)r.hour12=!1,r.hourCycle="h23";else if("12"===n)r.hour12=!0,r.hourCycle="h12";else if("system"===n){const t=(new Intl.DateTimeFormat).resolvedOptions();r.hourCycle=t.hourCycle}return new Intl.DateTimeFormat(s,r).format(t)},Ut=((t,...e)=>{const i=1===t.length?t[0]:e.reduce((e,i,s)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[s+1],t[0]);return new h(i,t,c)})`
  :host {
    display: block;
    font-family: Roboto, -apple-system, sans-serif;
    isolation: isolate;
  }
  ha-card {
    background: none !important;
    border: none !important;
    box-shadow: none !important;
    overflow: visible;
  }
  ha-card[data-action]:not([data-action='none']) {
    cursor: pointer;
  }

  .hero {
    position: relative;
    border-radius: var(--ha-card-border-radius, 20px);
    padding: 24px 26px 22px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    overflow: hidden;
    min-height: 125px;
    box-shadow:
      0 10px 25px -5px rgba(0, 0, 0, 0.3),
      inset 0 1px 1px rgba(255, 255, 255, 0.15);
    transition: background 1.5s ease-in-out;
  }
  .hero:focus {
    outline: 2px solid rgba(255, 255, 255, 0.6);
    outline-offset: 2px;
  }
  .hero:focus:not(:focus-visible) {
    outline: none;
  }
  .hero::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1), transparent 50%);
    pointer-events: none;
    z-index: 0;
  }

  .stars {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 1;
  }
  .scene-bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 2;
    overflow: hidden;
    border-radius: inherit;
  }
  .weather-tint {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 3;
    border-radius: inherit;
    transition: background 1.5s ease;
  }
  .weather-layer {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 4;
    overflow: hidden;
    border-radius: inherit;
  }

  .hero-text {
    position: relative;
    z-index: 5;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  .loc {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 2px;
    letter-spacing: 0.3px;
  }
  .temp {
    font-size: 56px;
    font-weight: 200;
    line-height: 1;
    color: #ffffff;
    letter-spacing: -1.5px;
  }
  .cond {
    font-size: 14px;
    font-weight: 400;
    color: rgba(255, 255, 255, 0.9);
    margin-top: 6px;
  }

  .hero-center {
    position: relative;
    z-index: 5;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 0 12px;
  }

  .short-fc {
    font-size: 12px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
    background: rgba(255, 255, 255, 0.15);
    padding: 4px 10px;
    border-radius: 6px;
    text-align: center;
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    width: fit-content;
    max-width: 135px;
  }

  .hero-icon {
    position: relative;
    z-index: 5;
    flex-shrink: 0;
    margin-right: -4px;
  }
  .hero-icon svg {
    display: block;
    filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.25));
  }

  .error-overlay {
    display: flex;
    position: absolute;
    inset: 0;
    z-index: 20;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.55);
    border-radius: inherit;
    padding: 16px;
    color: var(--error-color, #ef4444);
    font-size: 13px;
    text-align: center;
  }

  /* the thunderstorm icon ships a dim and a lit bolt; the flash class
     reveals the lit one so the SVG string never changes mid-storm */
  .hero-icon .bolt-lit {
    opacity: 0;
  }
  .hero.lightning-flash .hero-icon .bolt-lit {
    opacity: 1;
  }

  .hero.lightning-flash::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(
      circle at 78% 12%,
      rgba(226, 240, 255, 0.85),
      rgba(148, 190, 250, 0.4) 35%,
      rgba(59, 90, 180, 0.12) 60%,
      transparent 78%
    );
    mix-blend-mode: screen;
    opacity: 0.75;
    z-index: 10;
    pointer-events: none;
    border-radius: inherit;
  }

  @media (prefers-reduced-motion: reduce) {
    .weather-layer {
      display: none;
    }
  }

  .forecast {
    display: flex;
    gap: 8px;
    margin-top: 12px;
  }
  .fc-day {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 12px 6px;
    border-radius: calc(var(--ha-card-border-radius, 20px) - 4px);
    background: var(--card-background-color, rgba(255, 255, 255, 0.06));
    border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.08));
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    box-shadow:
      0 4px 10px rgba(0, 0, 0, 0.05),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
    transition:
      transform 0.2s ease,
      background 0.2s ease;
  }
  @media (hover: hover) {
    .fc-day:hover {
      background: var(--secondary-background-color, rgba(255, 255, 255, 0.1));
      transform: translateY(-1px);
    }
  }
  .fc-d {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--secondary-text-color, #94a3b8);
  }
  .fc-icon {
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .fc-t {
    font-size: 14px;
    font-weight: 500;
    color: var(--primary-text-color, #f8fafc);
  }
  .fc-lo {
    font-size: 11px;
    font-weight: 400;
    color: var(--secondary-text-color, #64748b);
    margin-top: -2px;
  }
`,Pt=t=>{const e=Math.max(.3,.32*t).toFixed(2),i=(.5*t).toFixed(2),s=(.87*t).toFixed(2);return`<g stroke="#f8fafc" stroke-width="${e}" stroke-linecap="round">\n    <line x1="${-t}" y1="0" x2="${t}" y2="0"/>\n    <line x1="-${i}" y1="-${s}" x2="${i}" y2="${s}"/>\n    <line x1="-${i}" y1="${s}" x2="${i}" y2="-${s}"/>\n  </g>`},Gt='<filter id="iconGlow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5" result="b"/><feComposite in="SourceGraphic" in2="b" operator="over"/></filter>',Bt='<linearGradient id="sunGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fffbeb"/><stop offset="30%" stop-color="#fbbf24"/><stop offset="100%" stop-color="#ea580c"/></linearGradient>',Ft='<linearGradient id="cloudFront" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#ffffff"/><stop offset="100%" stop-color="#cbd5e1"/></linearGradient>\n  <linearGradient id="cloudBack" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#94a3b8" stop-opacity="0.6"/><stop offset="100%" stop-color="#475569" stop-opacity="0.6"/></linearGradient>',Rt='<linearGradient id="moonGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#f8fafc"/><stop offset="100%" stop-color="#94a3b8"/></linearGradient>',zt=(...t)=>`<defs>${t.join("\n  ")}</defs>`,Lt="M41,0 L14,34 L23,34 L4,64 L45,24 L33,24 L52,0 Z",It=(t,e,i,s)=>`<path d="M20,40 C20,30 28,22 38,22 C41,22 44,23 46,25 C50,15 60,10 70,10 C82,10 92,18 94,30 C100,31 106,37 106,44 C106,51 100,58 92,58 L20,58 C13,58 8,53 8,46 C8,41 13,36 18,36Z" fill="${s}" transform="translate(${t},${e}) scale(${.7*i})"/>`,Ht=(t,e,i)=>{let s="";for(let n=0;n<i;n++){const r=n/i*360,o=r*Math.PI/180,a=(r-6)*Math.PI/180,l=(r+6)*Math.PI/180;s+=`<polygon points="${t*Math.cos(a)},${t*Math.sin(a)} ${e*Math.cos(o)},${e*Math.sin(o)} ${t*Math.cos(l)},${t*Math.sin(l)}" fill="#f59e0b" opacity="0.45"/>`}return s},Dt=t=>{const e=[{dropCount:Math.ceil(.3*t),strokeWidth:.4,opacity:.14,speed:1.3,length:4},{dropCount:Math.ceil(.45*t),strokeWidth:.6,opacity:.25,speed:.85,length:6},{dropCount:Math.ceil(.25*t),strokeWidth:.9,opacity:.38,speed:.55,length:8}];let i="";return e.forEach((t,e)=>{for(let s=0;s<t.dropCount;s++){const n=18+(31*s+19*e+7)%64,r=73+(7*s+3*e)%5,o=t.speed+11*s%5*.06,a=(17*s+13*e)%18*.06,l=-1-e,c=80;i+=`<line x1="${n}" y1="${r}" x2="${n+l}" y2="${r+t.length}"\n        stroke="rgba(180,215,250,${t.opacity})" stroke-width="${t.strokeWidth}" stroke-linecap="round" opacity="0">\n        <animateTransform attributeName="transform" type="translate"\n          from="0,0" to="${2*l},${c}" dur="${o}s" begin="${a}s" repeatCount="indefinite"/>\n        <animate attributeName="opacity" values="0;1;1;0"\n          keyTimes="0;0.05;0.88;1" dur="${o}s" begin="${a}s" repeatCount="indefinite"/>\n      </line>`}}),`<g>${i}</g>`},jt=(t,e=100)=>{switch(t){case"sun":return`<svg width="${e}" height="${e}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${zt(Gt,Bt)}\n        <g filter="url(#iconGlow)"><g transform="translate(50,50)">\n          <g><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="50s" repeatCount="indefinite"/>${Ht(20,36,8)}</g>\n          <circle cx="0" cy="0" r="20" fill="url(#sunGradient)"/>\n          <circle cx="0" cy="0" r="20" fill="url(#sunGradient)" opacity="0.35"><animate attributeName="r" values="20;23;20" dur="4s" repeatCount="indefinite"/></circle>\n        </g></g></svg>`;case"partly-cloudy":return`<svg width="${e}" height="${e}" viewBox="0 0 110 100" xmlns="http://www.w3.org/2000/svg">${zt(Gt,Bt,Ft)}\n        <g filter="url(#iconGlow)"><g transform="translate(75,30)">\n          <g><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="60s" repeatCount="indefinite"/>${Ht(14,28,8)}</g>\n          <circle cx="0" cy="0" r="15" fill="url(#sunGradient)"/>\n        </g></g>\n        <g><animateTransform attributeName="transform" type="translate" values="-3,0; 3,0; -3,0" dur="7s" repeatCount="indefinite"/>${It(20,42,.9,"url(#cloudBack)")}</g>\n        <g><animateTransform attributeName="transform" type="translate" values="0,0; 1.5,-1; 0,0" dur="5s" repeatCount="indefinite"/>${It(10,48,1,"url(#cloudFront)")}</g>\n      </svg>`;case"cloud-moon":return`<svg width="${e}" height="${e}" viewBox="0 0 110 100" xmlns="http://www.w3.org/2000/svg">${zt(Gt,Rt,Ft)}\n        <g filter="url(#iconGlow)"><animateTransform attributeName="transform" type="translate" values="0,0; 0,-2; 0,0" dur="8s" repeatCount="indefinite"/>\n          <path d="M65,15 A18,18 0 1,0 85,38 A14,14 0 1,1 65,15 Z" fill="url(#moonGradient)"/></g>\n        <g><animateTransform attributeName="transform" type="translate" values="-2,0; 2,0; -2,0" dur="8s" repeatCount="indefinite"/>${It(22,44,.9,"url(#cloudBack)")}</g>\n        ${It(12,50,1,"url(#cloudFront)")}\n      </svg>`;case"overcast":return`<svg width="${e}" height="${e}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${zt(Ft)}\n        <g><animateTransform attributeName="transform" type="translate" values="3,2; -3,-1; 3,2" dur="12s" repeatCount="indefinite"/>${It(5,34,1.05,"url(#cloudBack)")}</g>\n        <g><animateTransform attributeName="transform" type="translate" values="-2,-2; 2,1; -2,-2" dur="9s" repeatCount="indefinite"/>${It(12,44,1.15,"url(#cloudFront)")}</g>\n      </svg>`;case"rain":case"rain-heavy":{const i="rain-heavy"===t;return`<svg width="${e}" height="${e}" viewBox="0 0 100 100" overflow="visible" xmlns="http://www.w3.org/2000/svg">${zt(Ft)}\n        <g opacity="0.5"><animateTransform attributeName="transform" type="translate" values="2,1; -2,-1; 2,1" dur="10s" repeatCount="indefinite"/>${It(8,26,.95,"url(#cloudBack)")}</g>\n        <g><animateTransform attributeName="transform" type="translate" values="-1,0; 1.5,-0.5; -1,0" dur="7s" repeatCount="indefinite"/>${It(10,32,1,"url(#cloudFront)")}</g>\n        ${Dt(i?16:8)}\n      </svg>`}case"thunderstorm":return`<svg width="${e}" height="${e}" viewBox="0 0 100 100" overflow="visible" xmlns="http://www.w3.org/2000/svg">${zt('<linearGradient id="stormCloudFront" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#64748b"/><stop offset="100%" stop-color="#1e293b"/></linearGradient>\n  <linearGradient id="stormCloudBack" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#334155" stop-opacity="0.75"/><stop offset="100%" stop-color="#0f172a" stop-opacity="0.75"/></linearGradient>','<filter id="boltGlow" x="-150%" y="-40%" width="400%" height="180%"><feGaussianBlur in="SourceGraphic" stdDeviation="1.3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>\n  <linearGradient id="boltGradient" x1="50%" y1="0%" x2="50%" y2="100%"><stop offset="0%" stop-color="#ffffff"/><stop offset="35%" stop-color="#bfe4ff"/><stop offset="70%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#1d4ed8"/></linearGradient>')}\n        <g opacity="0.7">${It(8,20,1,"url(#stormCloudBack)")}</g>\n        ${It(10,26,1.1,"url(#stormCloudFront)")}\n        <g transform="translate(46,60) scale(0.55)">\n          <path d="${Lt}" fill="url(#boltGradient)" opacity="0.35"/>\n          <path class="bolt-lit" d="${Lt}" fill="url(#boltGradient)" filter="url(#boltGlow)"/>\n        </g>\n        ${Dt(10)}\n      </svg>`;case"snow":return`<svg width="${e}" height="${e}" viewBox="0 0 100 100" overflow="visible" xmlns="http://www.w3.org/2000/svg">${zt(Ft)}\n        <g opacity="0.45">${It(8,24,.95,"url(#cloudBack)")}</g>\n        ${It(10,30,1,"url(#cloudFront)")}\n        ${(t=>{let e="";for(let i=0;i<t;i++){const t=22+(29*i+11)%56,s=3.2+11*i%5*.4,n=17*i%12*.25;e+=`<g opacity="0">\n      <animateTransform attributeName="transform" type="translate"\n        from="${t},74" to="${t+(i%2?7:-7)},134" dur="${s}s" begin="${n}s" repeatCount="indefinite"/>\n      <animate attributeName="opacity" values="0;0.9;0.9;0" keyTimes="0;0.08;0.85;1" dur="${s}s" begin="${n}s" repeatCount="indefinite"/>\n      <g>\n        <animateTransform attributeName="transform" type="rotate" from="0" to="${i%2?360:-360}" dur="${.7*s}s" repeatCount="indefinite"/>\n        ${Pt(1.6+7*i%3*.5)}\n      </g>\n    </g>`}return`<g>${e}</g>`})(7)}\n      </svg>`;case"hail":return`<svg width="${e}" height="${e}" viewBox="0 0 100 100" overflow="visible" xmlns="http://www.w3.org/2000/svg">${zt(Ft)}\n        <g opacity="0.5">${It(8,24,.95,"url(#cloudBack)")}</g>\n        ${It(10,30,1,"url(#cloudFront)")}\n        ${(()=>{let t="";[[25,0],[42,.15],[60,.3],[35,.5],[55,.1],[75,.4]].forEach(([e,i])=>{const s=.6+11*e%4*.1;t+=`<circle cx="${e}" cy="70" r="${2+7*e%3}" fill="#dce4ed" opacity="0">\n      <animateTransform attributeName="transform" type="translate"\n        from="0,0" to="-1,50" dur="${s}s" begin="${i}s" repeatCount="indefinite"/>\n      <animate attributeName="opacity" values="0;0.85;0.85;0"\n        keyTimes="0;0.06;0.84;1" dur="${s}s" begin="${i}s" repeatCount="indefinite"/>\n    </circle>`});for(let e=0;e<4;e++){const i=13*e%8*.12;t+=`<circle cx="${25+(19*e+5)%50}" cy="97" r="0" fill="#dce4ed" opacity="0.5">\n      <animate attributeName="r" values="0;2.5;0" dur="0.5s" begin="${i}s" repeatCount="indefinite"/>\n      <animate attributeName="opacity" values="0.6;0;0.6" dur="0.5s" begin="${i}s" repeatCount="indefinite"/>\n    </circle>`}return`<g>${t}</g>`})()}\n      </svg>`;case"fog":return`<svg width="${e}" height="${e}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${zt(Ft)}\n        <g opacity="0.55">${It(16,16,.8,"url(#cloudBack)")}</g>\n        ${It(10,20,.95,"url(#cloudFront)")}\n        <g stroke-linecap="round" fill="none">\n          <line x1="26" y1="70" x2="80" y2="70" stroke="#e8edf4" stroke-width="5" opacity="0.85">\n            <animateTransform attributeName="transform" type="translate" values="-5,0; 4,0; -5,0" dur="9s" repeatCount="indefinite"/>\n            <animate attributeName="opacity" values="0.85;0.6;0.85" dur="6s" repeatCount="indefinite"/>\n          </line>\n          <line x1="18" y1="80" x2="68" y2="80" stroke="#cbd5e1" stroke-width="5" opacity="0.6">\n            <animateTransform attributeName="transform" type="translate" values="4,0; -6,0; 4,0" dur="11s" repeatCount="indefinite"/>\n            <animate attributeName="opacity" values="0.6;0.42;0.6" dur="7s" repeatCount="indefinite"/>\n          </line>\n          <line x1="30" y1="90" x2="74" y2="90" stroke="#aeb9c8" stroke-width="5" opacity="0.45">\n            <animateTransform attributeName="transform" type="translate" values="-4,0; 5,0; -4,0" dur="8s" repeatCount="indefinite"/>\n            <animate attributeName="opacity" values="0.45;0.3;0.45" dur="5.5s" repeatCount="indefinite"/>\n          </line>\n        </g>\n      </svg>`;case"wind":return`<svg width="${e}" height="${e}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">\n        <g fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="3" stroke-linecap="round">\n          <path d="M10,35 Q35,25 55,35 T90,35" stroke-dasharray="40 100"><animate attributeName="stroke-dashoffset" values="140;-140" dur="3.5s" repeatCount="indefinite"/></path>\n          <path d="M5,52 Q30,60 60,48 T95,52" stroke-dasharray="50 90"><animate attributeName="stroke-dashoffset" values="140;-140" dur="2.8s" repeatCount="indefinite"/></path>\n          <path d="M15,68 Q40,60 60,68 T85,64" stroke-dasharray="30 110"><animate attributeName="stroke-dashoffset" values="140;-140" dur="4.2s" repeatCount="indefinite"/></path>\n        </g></svg>`;case"moon":return`<svg width="${e}" height="${e}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${zt(Gt,Rt)}\n        <g filter="url(#iconGlow)"><animateTransform attributeName="transform" type="translate" values="0,0; -2,-3; 0,0" dur="10s" repeatCount="indefinite"/>\n          <path d="M35,25 A24,24 0 1,0 65,58 A19,19 0 1,1 35,25 Z" fill="url(#moonGradient)"/>\n          <path d="M35,25 A24,24 0 1,0 65,58 A19,19 0 1,1 35,25 Z" fill="#fff" opacity="0.12"/></g>\n      </svg>`;case"warning":return`<svg width="${e}" height="${e}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${zt(Gt)}\n        <g filter="url(#iconGlow)">\n          <polygon points="50,8 94,88 6,88" fill="#f59e0b" opacity="0.9">\n            <animate attributeName="opacity" values="0.9;0.6;0.9" dur="2s" repeatCount="indefinite"/>\n          </polygon>\n          <text x="50" y="74" text-anchor="middle" font-size="38" font-weight="bold" fill="#1c1917">!</text>\n        </g>\n      </svg>`;case"sunrise":case"sunset":{const i="sunset"===t;return`<svg width="${e}" height="${e}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${zt(Bt)}\n        <g transform="translate(50,70)">\n          <g><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="80s" repeatCount="indefinite"/>${Ht(15,34,8)}</g>\n          <circle cx="0" cy="0" r="16" fill="url(#sunGradient)">${i?"":'<animateTransform attributeName="transform" type="translate" from="0,15" to="0,0" dur="3.5s" fill="freeze"/>'}</circle>\n        </g>\n      </svg>`}default:return`<svg width="${e}" height="${e}" viewBox="0 0 100 100"><circle cx="50" cy="50" r="20" fill="#888"/></svg>`}},Wt=320,Zt=t=>(3.2*t).toFixed(1),qt=t=>`<svg viewBox="0 0 ${Wt} 100" preserveAspectRatio="xMidYMax slice"\n    style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none" xmlns="http://www.w3.org/2000/svg">${t}</svg>`,Vt=()=>{let t="";return[{count:4,minRadius:1.3,maxRadius:1.9,duration:5,opacity:.95,drift:9,flake:!0},{count:6,minRadius:.8,maxRadius:1.2,duration:8,opacity:.6,drift:6,flake:!0},{count:8,minRadius:.4,maxRadius:.7,duration:12,opacity:.3,drift:3,flake:!1}].forEach((e,i)=>{for(let s=0;s<e.count;s++){const n=5+(41*s+17*i+7)%90,r=e.minRadius+(13*s+7*i)%10/10*(e.maxRadius-e.minRadius),o=e.duration+7*s%4*.5,a=e.drift*((s+i)%2?1:-1),l=(11*s+5*i)%10*.3,c=4+(5*s+3*i)%6,d=s%2?360:-360,h=e.flake?Pt(r):`<circle r="${r.toFixed(1)}" fill="#f0f4f8"/>`,u=Zt(n),f=Zt(n+a);t+=`<g opacity="${e.opacity}">\n        <animateTransform attributeName="transform" type="translate"\n          from="${u},-5" to="${f},105" dur="${o}s" begin="${l}s" repeatCount="indefinite"/>\n        <g>\n          ${e.flake?`<animateTransform attributeName="transform" type="rotate" from="0" to="${d}" dur="${c}s" repeatCount="indefinite"/>`:""}\n          ${h}\n        </g>\n      </g>`}}),qt(`${t}${(()=>{const t=Wt.toFixed(1);return`<path d="M0,100 L0,93 Q${Zt(8)},87 ${Zt(16)},91 T${Zt(34)},89 Q${Zt(42)},85 ${Zt(50)},90 T${Zt(68)},88 Q${Zt(76)},84 ${Zt(84)},89 T${t},91 L${t},100 Z" fill="#dce6f2" opacity="0.8"/>\n  <path d="M0,100 L0,97 Q${Zt(10)},94 ${Zt(20)},97 T${Zt(42)},96 Q${Zt(55)},93 ${Zt(65)},97 T${Zt(88)},96 T${t},97 L${t},100 Z" fill="#f8fafc" opacity="0.95"/>\n  <circle cx="${Zt(14)}" cy="95" r="0.5" fill="#fff" opacity="0.9">\n    <animate attributeName="opacity" values="0.9;0.25;0.9" dur="3.4s" repeatCount="indefinite"/>\n  </circle>\n  <circle cx="${Zt(63)}" cy="94" r="0.4" fill="#fff" opacity="0.8">\n    <animate attributeName="opacity" values="0.8;0.2;0.8" dur="4.1s" begin="1s" repeatCount="indefinite"/>\n  </circle>\n  <circle cx="${Zt(88)}" cy="95.5" r="0.45" fill="#fff" opacity="0.85">\n    <animate attributeName="opacity" values="0.85;0.2;0.85" dur="2.8s" begin="0.6s" repeatCount="indefinite"/>\n  </circle>`})()}`)},Qt=t=>{const e=[{count:Math.round(9*t),strokeWidth:.3,opacity:.1,length:5,speed:1.5},{count:Math.round(7*t),strokeWidth:.45,opacity:.16,length:7,speed:1.1},{count:Math.round(5*t),strokeWidth:.6,opacity:.22,length:9,speed:.8}];let i="";return e.forEach((t,e)=>{for(let s=0;s<t.count;s++){const n=+Zt((37*s+23*e+11)%102-1),r=t.speed+(13*s+7*e)%6*.07,o=(17*s+11*e)%20*.09,a=-(1.2+.5*e),l=(n+a*(t.length/10)).toFixed(1);i+=`<line x1="${n}" y1="-10" x2="${l}" y2="${-10+t.length}"\n        stroke="rgba(205,228,255,${t.opacity})" stroke-width="${t.strokeWidth}" stroke-linecap="round">\n        <animateTransform attributeName="transform" type="translate"\n          from="0,0" to="${12*a},120" dur="${r}s" begin="${o}s" repeatCount="indefinite"/>\n      </line>`}}),qt(i+(t=>{const e=Math.round(11*t);let i="";for(let t=0;t<e;t++){const e=+Zt((47*t+13)%100),s=94+7*t%4,n=.9+13*t%5*.12,r=29*t%24*.11;if(i+=`<g transform="translate(${e},${s}) scale(1,0.32)">\n      <circle r="0" fill="none" stroke="rgba(205,228,255,1)" stroke-width="0.35" stroke-opacity="0">\n        <animate attributeName="r" values="0;${2.2+11*t%4*.4}" dur="${n}s" begin="${r}s" repeatCount="indefinite"/>\n        <animate attributeName="stroke-opacity" values="0;${.38+5*t%3*.09};0" keyTimes="0;0.2;1" dur="${n}s" begin="${r}s" repeatCount="indefinite"/>\n      </circle>\n    </g>`,t%3==0){const o=t%2?.9:-.9,a=(.45*n).toFixed(2);i+=`<circle cx="${e}" cy="${s}" r="0.32" fill="rgba(205,228,255,0.9)" opacity="0">\n        <animateTransform attributeName="transform" type="translate"\n          from="0,0" to="${o},-2.4" dur="${a}s" begin="${r}s" repeatCount="indefinite"/>\n        <animate attributeName="opacity" values="0;0.5;0" dur="${a}s" begin="${r}s" repeatCount="indefinite"/>\n      </circle>`}}return i})(t))},Kt=t=>{switch(t){case"rainy":case"hail":case"lightning-rainy":return Qt(1);case"pouring":return Qt(1.7);case"lightning":return Qt(.5);case"snowy":case"snowy-rainy":return Vt();case"fog":return(()=>{let t="";return[{x:20,y:26,rx:90,ry:16,fill:"mistBright",drift:16,dur:27,baseOpacity:.7},{x:66,y:34,rx:110,ry:18,fill:"mistMid",drift:-20,dur:34,baseOpacity:.8},{x:38,y:55,rx:120,ry:19,fill:"mistMid",drift:14,dur:23,baseOpacity:.9},{x:84,y:60,rx:95,ry:16,fill:"mistBright",drift:-13,dur:30,baseOpacity:.65},{x:14,y:80,rx:105,ry:18,fill:"mistDeep",drift:18,dur:38,baseOpacity:.95},{x:60,y:86,rx:125,ry:20,fill:"mistDeep",drift:-15,dur:29,baseOpacity:1}].forEach((e,i)=>{const s=(3.2*e.drift*.35).toFixed(1),n=8+i%4*2.5,r=(.72*e.baseOpacity).toFixed(2);t+=`<ellipse cx="${Zt(e.x)}" cy="${e.y}" rx="${e.rx}" ry="${e.ry}" fill="url(#${e.fill})" opacity="${e.baseOpacity}">\n      <animateTransform attributeName="transform" type="translate" values="${s},0; ${-e.drift},0; ${s},0" dur="${e.dur}s" repeatCount="indefinite"/>\n      <animate attributeName="opacity" values="${e.baseOpacity};${r};${e.baseOpacity}" dur="${n}s" repeatCount="indefinite"/>\n    </ellipse>`}),t+=`<rect x="0" y="58" width="${Wt}" height="42" fill="url(#fogGroundVeil)"/>`,qt('<defs>\n    <radialGradient id="mistBright" cx="50%" cy="50%" r="50%">\n      <stop offset="0%" stop-color="#e8edf4" stop-opacity="0.4"/>\n      <stop offset="55%" stop-color="#e8edf4" stop-opacity="0.18"/>\n      <stop offset="100%" stop-color="#e8edf4" stop-opacity="0"/>\n    </radialGradient>\n    <radialGradient id="mistMid" cx="50%" cy="50%" r="50%">\n      <stop offset="0%" stop-color="#c3ccd8" stop-opacity="0.34"/>\n      <stop offset="55%" stop-color="#c3ccd8" stop-opacity="0.15"/>\n      <stop offset="100%" stop-color="#c3ccd8" stop-opacity="0"/>\n    </radialGradient>\n    <radialGradient id="mistDeep" cx="50%" cy="50%" r="50%">\n      <stop offset="0%" stop-color="#9aa8b8" stop-opacity="0.38"/>\n      <stop offset="60%" stop-color="#9aa8b8" stop-opacity="0.16"/>\n      <stop offset="100%" stop-color="#9aa8b8" stop-opacity="0"/>\n    </radialGradient>\n    <linearGradient id="fogGroundVeil" x1="0" y1="0" x2="0" y2="1">\n      <stop offset="0%" stop-color="#aab6c4" stop-opacity="0"/>\n      <stop offset="100%" stop-color="#aab6c4" stop-opacity="0.3"/>\n    </linearGradient>\n  </defs>'+t)})();default:return""}},Jt=t=>{if(!t?.attributes||null==t.attributes.elevation){const t=(new Date).getHours();return t>=7&&t<18?"day":t>=18&&t<21?"dusk":t>=5&&t<7?"dawn":"night"}const e=t.attributes.elevation,i=t.attributes.rising;return e>6?"day":e>-6?null!=i?i?"dawn":"dusk":(new Date).getHours()<12?"dawn":"dusk":"night"},Yt={clear:{day:["#38bdf8","#2563eb"],dawn:["#2e1b4b","#b45309","#f59e0b"],dusk:["#111827","#6b21a8","#db2777"],night:["#030712","#0b1329","#111827"]},cloudy:{day:["#7d93ab","#5b708e","#465b73"],dawn:["#413a56","#6b5d66","#8a7266"],dusk:["#272c3d","#3e3a54","#514660"],night:["#0a0e18","#141927","#1d2331"]},rain:{day:["#5b718c","#42566f","#2e3f55"],dawn:["#39364f","#4d475e","#655a63"],dusk:["#232838","#33344e","#443f5c"],night:["#0a0e17","#141b29","#1d2536"]},storm:{day:["#414c61","#2d3646","#1e2430"],dawn:["#2b2839","#38304a","#453853"],dusk:["#1e2130","#2c2842","#3b2c4e"],night:["#0a0d15","#12141f","#1a1c2b"]},snow:{day:["#8ea6bf","#6f88a2","#566b84"],dawn:["#4c4a63","#6f6878","#8d7f80"],dusk:["#2b3145","#42435f","#565270"],night:["#0d1220","#182135","#232c44"]},fog:{day:["#9aa6b3","#8592a1","#6d7988"],dawn:["#6b6a7a","#847d89","#9a8d88"],dusk:["#454455","#585568","#696274"],night:["#151922","#20242f","#292d39"]}},Xt=(t,e)=>Yt[(t=>s[t]?.skyClass??"clear")(t)][e],te=(t,e)=>{const i=t.localize(`component.weather.entity_component._.state.${e}`)||t.localize(`component.weather.state._.${e}`)||e.replaceAll("-"," ");return i.charAt(0).toUpperCase()+i.slice(1)};let ee=class extends ut{constructor(){super(...arguments),this._forecast=[],this._hourlyForecast=[],this._flash=!1,this._subscribedTarget=null,this._subGeneration=0,this._failedSubTarget=null,this._failedSubTime=0,this._activeTimeouts=new Set,this._lightningActive=!1,this._lastSceneKey=""}get hass(){return this._hass}set hass(t){const e=this._hass;if(this._hass=t,!t||!this._config)return;(!e||e.states[this._config.entity]!==t.states[this._config.entity]||e.states[this._config.sun_entity]!==t.states[this._config.sun_entity]||e.locale?.language!==t.locale?.language||e.locale?.time_format!==t.locale?.time_format)&&(this._ensureForecastSub(),this.requestUpdate("hass",e))}setConfig(t){if(!t.entity)throw new Error("Please define a weather entity");const e={...i,...t,forecast_entity:t.forecast_entity||t.entity},s=!this._config||this._config.entity!==e.entity||this._config.forecast_entity!==e.forecast_entity;this._config=e,this._failedSubTarget=null,s&&(this._unsubForecast(),this._forecast=[],this._hourlyForecast=[],this._hass&&this._ensureForecastSub())}connectedCallback(){super.connectedCallback(),this._ensureForecastSub(),this._lightningActive&&this._scheduleLightning(),window.clearInterval(this._tickInterval),this._tickInterval=window.setInterval(()=>{document.hidden||(0!==this._hourlyForecast.length||this._config?.show_forecast)&&this.requestUpdate()},6e4)}disconnectedCallback(){super.disconnectedCallback(),this._unsubForecast(),this._clearAllTimeouts(),window.clearInterval(this._tickInterval)}static async getConfigElement(){return document.createElement(e)}static getStubConfig(t){const e=t&&Object.keys(t.states).find(t=>t.startsWith("weather."))||"weather.home";return{entity:e,name:"Weather",show_forecast:!0,show_low_temp:!1,time_format:"default",alert_lookahead:12}}getCardSize(){return this._config?.show_forecast?5:3}getGridOptions(){return this._config?.show_forecast?{rows:4,columns:12,min_rows:4}:{rows:2,columns:12,min_rows:2}}render(){if(!this._config||!this._hass)return K;const t=this._config,e=this._hass,i=e.states[t.entity];if(!i)return V`
        <ha-card>
          <div class="hero">
            <div class="error-overlay">Entity not found: ${t.entity}</div>
          </div>
        </ha-card>
      `;const s=i.state,o=i.attributes.temperature,a=null!=o&&Number.isFinite(+o)?Math.round(+o):null,l=Jt(e.states[t.sun_entity]),c=((t,e)=>{const i="night"===e,s="dawn"===e,n="dusk"===e;let r,o="",a=null;switch(t){case"lightning":case"lightning-rainy":r="thunderstorm",o="linear-gradient(180deg, rgba(5,8,18,0.35), transparent 60%)";break;case"pouring":r="rain-heavy",o="linear-gradient(180deg, rgba(10,16,28,0.3), transparent 65%)";break;case"rainy":r="rain",o="linear-gradient(180deg, rgba(15,23,42,0.2), transparent 60%)";break;case"hail":r="hail",o="linear-gradient(180deg, rgba(15,23,42,0.2), transparent 60%)";break;case"snowy":case"snowy-rainy":r="snow";break;case"fog":r="fog";break;case"windy":case"windy-variant":r="wind";break;case"cloudy":r="overcast";break;case"partlycloudy":r=i?"cloud-moon":"partly-cloudy",i||(o="linear-gradient(180deg, rgba(51,65,85,0.1), transparent)"),s&&(a="horizon-dawn"),n&&(a="horizon-dusk");break;case"clear-night":r="moon";break;default:"exceptional"===t?(r="warning",o="linear-gradient(180deg, rgba(120,53,15,0.4), rgba(180,83,9,0.2))"):i?r="moon":s?(r="sunrise",a="horizon-dawn"):n?(r="sunset",a="horizon-dusk"):r="sun"}return{icon:r,tint:o,scene:a}})(s,l),d=te(e,s),h=void 0!==t.name?t.name:i.attributes.friendly_name??"",u=this._forecast[0],f=null!=u?.temperature?Math.round(u.temperature):null,p=null!=u?.templow?Math.round(u.templow):null,g=((t,e,{lookaheadHours:i,timeFormat:s,locale:o,localizeCondition:a})=>{if(!t||0===t.length)return"";if(i<=0)return"";const l=new Date,c=new Date(l.getTime()+36e5*i),d=n(e)?e:null;for(const e of t){const t=new Date(e.datetime);if(Number.isNaN(t.getTime()))continue;if(t<l)continue;if(t>c)break;const i=!!e.condition&&n(e.condition);if(d){if(!i||r(e.condition)!==r(d)){const e=Ot(t,o,s);return Nt(o,"alertUntil",{condition:a(d),time:e})}}else if(i){const i=Ot(t,o,s),n=Math.round((t.getTime()-l.getTime())/6e4),r=a(e.condition);return n>0&&n<60?Nt(o,"alertIn",{condition:r,mins:n}):Nt(o,"alertFrom",{condition:r,time:i})}}return""})(this._hourlyForecast,s,{lookaheadHours:t.alert_lookahead,timeFormat:t.time_format,locale:e.locale,localizeCondition:t=>te(e,t)}),m=`linear-gradient(135deg, ${Xt(s,l).join(", ")})`,y=t.tap_action?.action??"more-info",$="none"!==y,b=[h,d,null!=a?`${a}°`:""].filter(Boolean).join(", ");return V`
      <ha-card
        role=${$?"button":"region"}
        tabindex=${$?"0":"-1"}
        data-action=${y}
        aria-label=${b}
        @click=${this._handleTap}
        @keydown=${this._handleKeydown}
      >
        <div
          class="hero ${xt({"lightning-flash":this._flash})}"
          style=${At({background:m})}
        >
          <div class="stars" aria-hidden="true">
            ${"night"===l?St((()=>{const t=[[15,12],[72,8],[88,24],[26,6],[42,14],[80,32],[10,28],[52,8],[38,22],[94,10],[18,35],[60,5],[82,18],[35,10],[68,28],[8,18],[48,6],[75,15],[30,30],[90,8]];let e="";for(let i=0;i<t.length;i++){const[s,n]=t[i];e+=`<circle cx="${s}%" cy="${n}%" r="${.5+(7*i+3)%6*.1}" fill="#fff" opacity="0.6">\n      <animate attributeName="opacity" values="0.15;0.8;0.15" dur="${2.5+i%4*1.1}s" repeatCount="indefinite"/>\n    </circle>`}return((t,e=!0)=>`<svg ${e?'viewBox="0 0 100 100" preserveAspectRatio="none" ':""}style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none" xmlns="http://www.w3.org/2000/svg">${t}</svg>`)(e,!1)})()):K}
          </div>
          <div class="scene-bg" aria-hidden="true">
            ${c.scene?St((_="horizon-dawn"===c.scene?"dawn":"dusk",`<svg style="position:absolute;bottom:0;left:0;width:100%;height:45%;pointer-events:none" viewBox="0 0 400 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">\n    <g>${"dawn"===_?'<animateTransform attributeName="transform" type="translate" values="0,8; 0,0; 0,8" dur="20s" repeatCount="indefinite"/>':'<animateTransform attributeName="transform" type="translate" values="0,0; 0,8; 0,0" dur="20s" repeatCount="indefinite"/>'}<path d="M0,80 Q100,50 200,70 T400,60 L400,100 L0,100 Z" fill="${"dawn"===_?"rgba(30,27,75,0.4)":"rgba(17,24,39,0.5)"}"/></g>\n  </svg>`)):K}
          </div>
          <div
            class="weather-tint"
            aria-hidden="true"
            style=${At({background:c.tint||"none"})}
          ></div>
          <div class="weather-layer" aria-hidden="true">
            ${St(Kt(s))}
          </div>

          <div class="hero-text">
            ${h?V`<div class="loc">${St('<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>')}<span>${h}</span></div>`:K}
            <div class="temp">${null!=a?`${a}°`:"--"}</div>
            <div class="cond">
              ${null!=f?`${d} · ${f}°${null!=p?` / ${p}°`:""}`:d}
            </div>
          </div>

          <div class="hero-center">
            ${g?V`<div class="short-fc">${g}</div>`:K}
          </div>

          <div class="hero-icon" aria-hidden="true">
            ${St(jt(c.icon,120))}
          </div>
        </div>
        ${this._renderForecast()}
      </ha-card>
    `;var _}_renderForecast(){const t=this._config,e=this._hass;if(!t.show_forecast||0===this._forecast.length)return K;const i=this._forecast.slice(0,t.forecast_days).map(t=>({day:t,date:new Date(t.datetime)})).filter(({date:t})=>!Number.isNaN(t.getTime())),n=e.locale?.language||"en",r=(new Date).toDateString();return V`
      <div class="forecast">
        ${i.map(({day:e,date:i},o)=>{const a=(l=e.condition,s[l??""]?.forecastIcon??"sun");var l;const c=0===o&&i.toDateString()===r?((t="en")=>new Intl.RelativeTimeFormat(t,{numeric:"auto"}).format(0,"day"))(n):((t,e="en")=>new Intl.DateTimeFormat(e,{weekday:"short"}).format(t))(i,n),d=t.show_no_temp||null==e.temperature?null:`${Math.round(e.temperature)}°`,h=t.show_low_temp&&!t.show_no_temp&&null!=e.templow?`${Math.round(e.templow)}°`:null;return V`
            <div class="fc-day">
              <span class="fc-d">${c}</span>
              <div class="fc-icon" aria-hidden="true">
                ${St(((t,e)=>{switch(t){case"sun":return`<svg width="${e}" height="${e}" viewBox="0 0 32 32"><circle cx="16" cy="16" r="7" fill="#fbbf24"/></svg>`;case"moon":return`<svg width="${e}" height="${e}" viewBox="0 0 32 32"><path d="M12,10 A8,8 0 1,0 22,22 A6,6 0 1,1 12,10Z" fill="#94a3b8"/></svg>`;case"sun-cloud":return`<svg width="${e}" height="${e}" viewBox="0 0 32 32"><circle cx="20" cy="12" r="5" fill="#fbbf24"/><path d="M8,24 C8,20 12,18 15,18 C17,15 22,15 24,18 C27,18 29,20 29,23 C29,25 27,27 25,27L8,27Z" fill="#cbd5e1"/></svg>`;case"cloud":return`<svg width="${e}" height="${e}" viewBox="0 0 32 32"><path d="M6,22 C6,18 9,16 12,16 C14,13 19,13 21,16 C24,16 26,18 26,21 C26,24 24,25 22,25L6,25Z" fill="#cbd5e1"/></svg>`;case"rain":return`<svg width="${e}" height="${e}" viewBox="0 0 32 32"><path d="M8,18 C8,15 11,13 14,13 C16,10 21,10 23,13 C26,13 28,15 28,18 C28,21 26,22 24,22L8,22Z" fill="#94a3b8"/><line x1="13" y1="25" x2="11" y2="29" stroke="#38bdf8" stroke-width="1.5" stroke-linecap="round"/><line x1="19" y1="25" x2="17" y2="29" stroke="#38bdf8" stroke-width="1.5" stroke-linecap="round"/></svg>`;case"snow":return`<svg width="${e}" height="${e}" viewBox="0 0 32 32"><path d="M8,18 C8,15 11,13 14,13 C16,10 21,10 23,13 C26,13 28,15 28,18 C28,21 26,22 24,22L8,22Z" fill="#94a3b8"/><circle cx="13" cy="26" r="1" fill="#fff"/><circle cx="19" cy="27" r="1" fill="#fff"/></svg>`;case"lightning":return`<svg width="${e}" height="${e}" viewBox="0 0 32 32"><defs><linearGradient id="miniBolt" x1="50%" y1="0%" x2="50%" y2="100%"><stop offset="0%" stop-color="#ffffff"/><stop offset="35%" stop-color="#bfe4ff"/><stop offset="70%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#1d4ed8"/></linearGradient></defs><path d="M8,16 C8,13 11,11 14,11 C16,8 21,8 23,11 C26,11 28,13 28,16 C28,19 26,20 24,20L8,20Z" fill="#334155"/><polygon points="17,18 13,24 16,24 14,30 21,22 18,22" fill="url(#miniBolt)"/></svg>`;case"warning":return`<svg width="${e}" height="${e}" viewBox="0 0 32 32"><polygon points="16,3 30,28 2,28" fill="#f59e0b"/><text x="16" y="24" text-anchor="middle" font-size="14" font-weight="bold" fill="#1c1917">!</text></svg>`;default:return`<svg width="${e}" height="${e}" viewBox="0 0 32 32"><circle cx="16" cy="16" r="6" fill="#888"/></svg>`}})(a,28))}
              </div>
              ${d?V`<span class="fc-t">${d}</span>`:K}
              ${h?V`<span class="fc-lo">${h}</span>`:K}
            </div>
          `})}
      </div>
    `}updated(t){if(super.updated(t),!this._config||!this._hass)return;const e=this._hass.states[this._config.entity];if(!e)return;const i=Jt(this._hass.states[this._config.sun_entity]),s=`${e.state}|${i}`;s!==this._lastSceneKey&&(this._lastSceneKey=s,this._clearAllTimeouts(),this._flash&&(this._flash=!1),this._manageLightning(e.state))}_manageLightning(t){this._lightningActive="lightning"===t||"lightning-rainy"===t,this._lightningActive&&this._scheduleLightning()}_scheduleLightning(){if(!this.isConnected||!this._lightningActive)return;const t=4e3+14e3*Math.random();this._safeTimeout(()=>{this._lightningActive&&(this._triggerFlash(),this._scheduleLightning())},t)}_triggerFlash(){this._flash=!0,this._safeTimeout(()=>{this._flash=!1},120),Math.random()>.6&&this._safeTimeout(()=>{this._flash=!0,this._safeTimeout(()=>{this._flash=!1},80)},200)}_safeTimeout(t,e){const i=window.setTimeout(()=>{this._activeTimeouts.delete(i),t()},e);this._activeTimeouts.add(i)}_clearAllTimeouts(){for(const t of this._activeTimeouts)window.clearTimeout(t);this._activeTimeouts.clear()}_handleTap(){this._dispatchAction()}_handleKeydown(t){"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._dispatchAction())}_dispatchAction(){this._config&&"none"!==this._config.tap_action?.action&&Et(this,"hass-action",{config:this._config,action:"tap"})}async _ensureForecastSub(){if(!this._hass?.connection||!this._config?.entity)return;const t=`${this._config.entity}|${this._config.forecast_entity}`;if(this._subscribedTarget===t)return;if(this._failedSubTarget===t&&Date.now()-this._failedSubTime<6e4)return;this._unsubForecast(),this._subscribedTarget=t;const e=++this._subGeneration,i=this._config.forecast_entity;try{const t=await this._hass.connection.subscribeMessage(t=>{e===this._subGeneration&&(this._forecast=t.forecast??[])},{type:"weather/subscribe_forecast",forecast_type:"daily",entity_id:i});e===this._subGeneration&&this.isConnected?(this._forecastUnsub=t,this._failedSubTarget=null):(t(),e===this._subGeneration&&(this._subscribedTarget=null))}catch{if(e===this._subGeneration){this._subscribedTarget=null,this._failedSubTarget=t,this._failedSubTime=Date.now();const e=this._hass.states[i];e?.attributes?.forecast&&(this._forecast=e.attributes.forecast)}}try{const t=await this._hass.connection.subscribeMessage(t=>{e===this._subGeneration&&(this._hourlyForecast=t.forecast??[])},{type:"weather/subscribe_forecast",forecast_type:"hourly",entity_id:i});e===this._subGeneration&&this.isConnected?this._hourlyUnsub=t:t()}catch{e===this._subGeneration&&(this._hourlyForecast=[])}}_unsubForecast(){this._forecastUnsub&&(this._forecastUnsub(),this._forecastUnsub=void 0),this._hourlyUnsub&&(this._hourlyUnsub(),this._hourlyUnsub=void 0),this._subscribedTarget=null}};ee.styles=Ut,o([$t()],ee.prototype,"_config",void 0),o([$t()],ee.prototype,"_forecast",void 0),o([$t()],ee.prototype,"_hourlyForecast",void 0),o([$t()],ee.prototype,"_flash",void 0),ee=o([pt(t)],ee);const ie=[{name:"entity",required:!0,selector:{entity:{domain:"weather"}}},{name:"forecast_entity",selector:{entity:{domain:"weather"}}},{name:"sun_entity",selector:{entity:{domain:"sun"}}},{name:"name",selector:{text:{}}},{name:"time_format",selector:{select:{options:[{value:"default",label:"Default (User Profile)"},{value:"12",label:"12 Hour"},{value:"24",label:"24 Hour"},{value:"system",label:"System (Browser/OS)"}],mode:"dropdown"}}},{name:"forecast_days",selector:{number:{min:1,max:7,mode:"slider",step:1}}},{name:"alert_lookahead",selector:{number:{min:0,max:24,mode:"slider",step:1}}},{type:"grid",name:"",schema:[{name:"show_forecast",selector:{boolean:{}}},{name:"show_low_temp",selector:{boolean:{}}},{name:"show_no_temp",selector:{boolean:{}}}]},{name:"tap_action",selector:{ui_action:{}}}],se={entity:"Weather Entity (Required)",forecast_entity:"Forecast Entity (Optional)",sun_entity:"Sun Entity",time_format:"Time Format Override",forecast_days:"Forecast Days",alert_lookahead:"Forecast Alert Lookahead (Hours, 0 = off)",name:"Location Name",show_forecast:"Show forecast",show_low_temp:"Show low temperature",show_no_temp:"Show no temperature (overrides low temp)",tap_action:"Tap Action"};let ne=class extends ut{constructor(){super(...arguments),this._computeLabel=t=>se[t.name]??t.name}setConfig(t){this._config={...i,...t}}render(){return this.hass&&this._config?V`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${ie}
        .computeLabel=${this._computeLabel}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `:K}_valueChanged(t){t.stopPropagation(),Et(this,"config-changed",{config:t.detail.value})}};o([yt({attribute:!1})],ne.prototype,"hass",void 0),o([$t()],ne.prototype,"_config",void 0),ne=o([pt(e)],ne),window.customCards=window.customCards||[],window.customCards.push({type:t,name:"Modern Weather Card",description:"Layered weather card with atmospheric effects",documentationURL:"https://github.com/mwckr/homassistant-modern-weather-card",preview:!0}),console.info("%c MODERN-WEATHER %c v0.2.0 ","background:#2563eb;color:#fff;font-weight:bold;padding:2px 6px;border-radius:4px 0 0 4px","background:#0f172a;color:#f8fafc;padding:2px 6px;border-radius:0 4px 4px 0");
