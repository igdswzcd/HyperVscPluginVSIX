function a(e){document.readyState==="loading"||document.readyState==="uninitialized"?document.addEventListener("DOMContentLoaded",e):e()}var d=acquireVsCodeApi();function i(){let e=document.getElementById("simple-browser-settings");if(e){let t=e.getAttribute("data-settings");if(t)return JSON.parse(t)}throw new Error("Could not load settings")}var s=i(),o=document.querySelector("iframe");window.addEventListener("message",e=>{switch(e.data.type){case"focus":{o.focus();break}case"didChangeFocusLockIndicatorEnabled":{c(e.data.enabled);break}}});a(()=>{setInterval(()=>{let t=document.activeElement?.tagName==="IFRAME";document.body.classList.toggle("iframe-focused",t)},50),o.addEventListener("load",()=>{}),e(s.url),c(s.focusLockIndicatorEnabled);function e(t){try{let n=new URL(t);n.searchParams.append("vscodeBrowserReqId",Date.now().toString()),o.src=n.toString()}catch{o.src=t}d.setState({url:t})}});function c(e){document.body.classList.toggle("enable-focus-lock-indicator",e)}
