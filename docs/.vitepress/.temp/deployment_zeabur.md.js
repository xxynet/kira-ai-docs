import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.6ab74304.js";
const __pageData = JSON.parse('{"title":"Zeabur\u90E8\u7F72","description":"","frontmatter":{},"headers":[{"level":2,"title":"1. \u6CE8\u518CZeabur\u8D26\u53F7","slug":"_1-\u6CE8\u518Czeabur\u8D26\u53F7","link":"#_1-\u6CE8\u518Czeabur\u8D26\u53F7","children":[]},{"level":2,"title":"2. \u521B\u5EFA\u65B0\u9879\u76EE","slug":"_2-\u521B\u5EFA\u65B0\u9879\u76EE","link":"#_2-\u521B\u5EFA\u65B0\u9879\u76EE","children":[]},{"level":2,"title":"3. \u90E8\u7F72KiraAI","slug":"_3-\u90E8\u7F72kiraai","link":"#_3-\u90E8\u7F72kiraai","children":[]}],"relativePath":"deployment/zeabur.md","lastUpdated":null}');
const _sfc_main = { name: "deployment/zeabur.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="zeabur\u90E8\u7F72" tabindex="-1">Zeabur\u90E8\u7F72 <a class="header-anchor" href="#zeabur\u90E8\u7F72" aria-hidden="true">#</a></h1><p>Zeabur \u662F\u4E00\u4E2A\u4E91\u90E8\u7F72\u5E73\u53F0\uFF08PaaS\uFF09\uFF0C\u5B83\u63D0\u4F9B\u4E86\u7B80\u5355\u3001\u5FEB\u901F\u7684\u65B9\u5F0F\u6765\u90E8\u7F72\u548C\u7BA1\u7406\u5E94\u7528\u7A0B\u5E8F\u3002\u6BCF\u6708\u63D0\u4F9B5\u7F8E\u5143\u7684\u514D\u8D39\u989D\u5EA6\uFF0C\u8BE6\u60C5\u89C1<a href="https://zeabur.com/docs/zh-CN/billing/pricing" target="_blank" rel="noreferrer">Zeabur\u5B9A\u4EF7</a></p><h2 id="_1-\u6CE8\u518Czeabur\u8D26\u53F7" tabindex="-1">1. \u6CE8\u518CZeabur\u8D26\u53F7 <a class="header-anchor" href="#_1-\u6CE8\u518Czeabur\u8D26\u53F7" aria-hidden="true">#</a></h2><ol><li>\u8BBF\u95EE<a href="https://zeabur.com/" target="_blank" rel="noreferrer">Zeabur\u5B98\u7F51</a>\uFF0C\u70B9\u51FB&quot;\u6CE8\u518C&quot;\u6309\u94AE\u3002</li><li>\u586B\u5199\u60A8\u7684\u90AE\u7BB1\u3001\u7528\u6237\u540D\u548C\u5BC6\u7801\uFF0C\u5B8C\u6210\u6CE8\u518C\u3002</li><li>\u767B\u5F55\u60A8\u7684Zeabur\u8D26\u53F7\u3002</li></ol><h2 id="_2-\u521B\u5EFA\u65B0\u9879\u76EE" tabindex="-1">2. \u521B\u5EFA\u65B0\u9879\u76EE <a class="header-anchor" href="#_2-\u521B\u5EFA\u65B0\u9879\u76EE" aria-hidden="true">#</a></h2><ol><li>\u5728Zeabur\u5E73\u53F0\u4E0A\uFF0C\u70B9\u51FB&quot;\u65B0\u5EFA\u9879\u76EE&quot;\u6309\u94AE\u3002</li><li>\u8F93\u5165\u9879\u76EE\u540D\u79F0\uFF0C\u4F8B\u5982&quot;KiraAI&quot;\uFF0C\u70B9\u51FB&quot;\u521B\u5EFA&quot;\u6309\u94AE\u3002</li></ol><h2 id="_3-\u90E8\u7F72kiraai" tabindex="-1">3. \u90E8\u7F72KiraAI <a class="header-anchor" href="#_3-\u90E8\u7F72kiraai" aria-hidden="true">#</a></h2><ol><li>\u5728\u9879\u76EE\u9875\u9762\uFF0C\u70B9\u51FB&quot;\u90E8\u7F72&quot;\u6309\u94AE\u3002</li><li>\u9009\u62E9&quot;\u4ECEDocker\u955C\u50CF\u90E8\u7F72&quot;\u3002</li><li>\u8F93\u5165KiraAI\u7684Docker\u955C\u50CFURL\uFF1A<code>xxynet/kira-ai:latest</code></li><li>\u6620\u5C04\u7AEF\u53E3\uFF1A\u5C06\u5BB9\u5668\u7AEF\u53E35267\u6620\u5C04\u5230\u4E3B\u673A\u7AEF\u53E35267\u3002</li><li>volume\uFF1A\u5C06<code>data</code>\u76EE\u5F55\u6302\u8F7D\u5230\u5BB9\u5668\u7684<code>/app/data</code>\u76EE\u5F55\u3002</li><li>\u70B9\u51FB&quot;\u90E8\u7F72&quot;\u6309\u94AE\u3002</li></ol></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("deployment/zeabur.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const zeabur = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  zeabur as default
};
