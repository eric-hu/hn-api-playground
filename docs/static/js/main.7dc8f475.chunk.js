(this["webpackJsonphn-api-playground"]=this["webpackJsonphn-api-playground"]||[]).push([[0],{11:function(t,n,e){},12:function(t,n,e){"use strict";e.r(n);var r=e(3),c=e(5),o=e(2),i=e(0),s=e.n(i),u=e(4),a=e.n(u),f=(e(11),function(t){t&&t instanceof Function&&e.e(3).then(e.bind(null,13)).then((function(n){var e=n.getCLS,r=n.getFID,c=n.getFCP,o=n.getLCP,i=n.getTTFB;e(t),r(t),c(t),o(t),i(t)}))}),h=function(t){return fetch("https://hacker-news.firebaseio.com/v0/item/".concat(t,".json?print=pretty")).then((function(t){return t.json()}))},p=function(){var t=Object(i.useState)(),n=Object(c.a)(t,2),e=n[0],o=n[1];return Object(i.useEffect)((function(){fetch("https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty").then((function(t){return t.json()})).then((function(t){return window.jsonResponse=t,t})).then((function(t){return Promise.all(t.slice(0,30).map(h))})).then((function(t){t=t.map((function(t){return Object(r.a)(Object(r.a)({},t),{},{url:"<a href=".concat(t.url,">").concat(t.url,"</a>")})})),o(JSON.stringify(t,["by","id","score","title","url","descendants","time"],2))}))})),s.a.createElement("pre",{dangerouslySetInnerHTML:{__html:e}})};a.a.render(Object(o.jsx)(s.a.StrictMode,{children:Object(o.jsx)(p,{})}),document.getElementById("root")),f()}},[[12,1,2]]]);
//# sourceMappingURL=main.7dc8f475.chunk.js.map