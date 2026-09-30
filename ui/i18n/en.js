// ui/i18n/en.js
(function () {
  const map = {
    "样式编辑器": "Style Editor",
    "导入样式": "Import styles",
    "导出样式": "Export styles",
    "重置样式": "Reset styles",
    "确定要重置所有样式设置吗？": "Are you sure you want to reset all style settings?",
    "样式设置面板": "Style Settings Panel",
    "气泡样式": "Bubble Style",
    "文本样式": "Text Style",
    "这是预览文本": "This is preview text",
    "这是斜体文本": "This is italic text",
    "这是引用文本": "This is quoted text",
    "保存": "Save",
    "最小化": "Minimize",
    "关闭": "Close",
    "重置": "Reset"
  };

  function translateNode(node) {
    if (!node) return;
    ["title", "placeholder", "value", "alt"].forEach(attr => {
      if (node.getAttribute && node.getAttribute(attr)) {
        let v = node.getAttribute(attr);
        Object.keys(map).forEach(k => { if (v.includes(k)) v = v.split(k).join(map[k]); });
        node.setAttribute(attr, v);
      }
    });

    // Replace simple text nodes
    if (node.childNodes && node.childNodes.length === 1 && node.childNodes[0].nodeType === Node.TEXT_NODE) {
      let txt = node.textContent.trim();
      if (!txt) return;
      Object.keys(map).forEach(k => { if (txt.includes(k)) txt = txt.split(k).join(map[k]); });
      node.textContent = txt;
    }
  }

  function translateAll(root = document.body) {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, null, false);
    let n = walker.nextNode();
    while (n) {
      try { translateNode(n); } catch (e) {}
      n = walker.nextNode();
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    translateAll();
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.addedNodes && m.addedNodes.length) {
          m.addedNodes.forEach(n => { try { translateAll(n); } catch (e) {} });
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });

  // Optional manual access
  window.ChatStylistI18n = { map, translateAll };
})();
