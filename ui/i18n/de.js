// ui/i18n/en.js
(function () {
  const map = {
    "样式编辑器": "Stileditor",
    "导入样式": "Importiere Stile",
    "导出样式": "Exportiere Stile",
    "重置样式": "Stile Zurücksetzen",
    "确定要重置所有样式设置吗？": "Sind Sie sicher, dass Sie alle Stileinstellungen zurücksetzen möchten??",
    "样式设置面板": "Stileinstellungen-Panel",
    "气泡样式": "Bubble-Stil",
    "文本样式": "Text-Stil",
    "这是预览文本": "Dies ist ein Vorschautext.",
    "这是斜体文本": "Das ist kursiver Text.",
    "这是引用文本": "Dies ist ein Zitat.",
    "保存": "Speichern",
    "最小化": "Minimieren",
    "关闭": "Schließen",
    "重置": "Zurücksetzen"
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
