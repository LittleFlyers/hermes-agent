/* 自动把文档里像「文件路径」的 <code> 和 .filehint 文本变成可点击的
   vscode:// 链接,点击后在 VS Code 中打开对应源文件。
   仅供本机学习使用;绝对路径写死为当前仓库位置。 */
(function () {
  "use strict";

  // 仓库绝对路径(macOS)。vscode://file/ 后直接接绝对路径(去掉开头的 /)。
  var ROOT = "vscode://file/Users/zpf/Documents/github/hermes-agent/";

  // 命中「源文件路径」的正则:字母/数字开头,允许 / . _ - ,以已知扩展名结尾。
  var EXT = "py|ts|tsx|js|jsx|md|css|yaml|yml|sh|json|html|toml";
  var FILE_EXACT = new RegExp("^[A-Za-z0-9_][A-Za-z0-9_./-]*\\.(" + EXT + ")$");
  var FILE_TOKEN = new RegExp("[A-Za-z0-9_][A-Za-z0-9_./-]*\\.(" + EXT + ")", "g");

  function isFilePath(t) {
    return FILE_EXACT.test(t) && t.indexOf("*") === -1 && t.indexOf("~") === -1;
  }

  function makeHref(path) {
    return ROOT + path.replace(/^\.?\//, "");
  }

  // 注入样式(免去改每个文件的 CSS)。
  function injectStyle() {
    var css =
      ".srclink{text-decoration:none;color:inherit;cursor:pointer;}" +
      ".srclink:hover code{border-color:var(--accent,#b8860b);color:var(--accent2,#1a6fdc);}" +
      ".srclink::after{content:'\\2197';font-size:9px;margin-left:2px;opacity:0;" +
      "color:var(--accent2,#1a6fdc);transition:opacity .15s;vertical-align:super;}" +
      ".srclink:hover::after{opacity:1;}" +
      ".filehint .srclink{font-weight:700;}";
    var s = document.createElement("style");
    s.textContent = css;
    document.head.appendChild(s);
  }

  // 行内 <code>(不在 <pre> 代码块里的)整体是个路径 → 包成链接。
  function linkifyInlineCode() {
    var nodes = document.querySelectorAll("code");
    for (var i = 0; i < nodes.length; i++) {
      var c = nodes[i];
      if (c.closest("pre")) continue;          // 跳过大段代码块
      if (c.closest("a")) continue;            // 已是链接
      var t = (c.textContent || "").trim();
      if (!isFilePath(t)) continue;
      var a = document.createElement("a");
      a.href = makeHref(t);
      a.className = "srclink";
      a.title = "在 VS Code 中打开 " + t;
      c.parentNode.insertBefore(a, c);
      a.appendChild(c);
    }
  }

  // .filehint 是纯文本(如 "agent/conversation_loop.py · run_conversation()"),
  // 把其中每个路径 token 替换成链接。
  function linkifyFilehints() {
    var hints = document.querySelectorAll(".filehint");
    for (var i = 0; i < hints.length; i++) {
      var div = hints[i];
      if (div.dataset.linked) continue;
      div.dataset.linked = "1";
      var text = div.textContent;
      div.innerHTML = text.replace(FILE_TOKEN, function (m) {
        if (m.indexOf("*") !== -1) return m;
        return (
          '<a class="srclink" href="' +
          makeHref(m) +
          '" title="在 VS Code 中打开 ' +
          m +
          '">' +
          m +
          "</a>"
        );
      });
    }
  }

  function run() {
    injectStyle();
    linkifyInlineCode();
    linkifyFilehints();
  }

  if (document.readyState !== "loading") run();
  else document.addEventListener("DOMContentLoaded", run);
})();
