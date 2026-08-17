(function () {
  var path = location.pathname.replace(/\\/g, "/");
  var file = path.split("/").pop() || "index.html";
  var inDer = path.indexOf("/derivations/") !== -1;
  var prefix = inDer ? "../" : "";
  var items = [
    { href: prefix + "index.html", file: "index.html", label: "Spine" },
    { href: prefix + "derivations/demand.html", file: "demand.html", label: "Demand" },
    { href: prefix + "derivations/logit.html", file: "logit.html", label: "Logit" },
    { href: prefix + "derivations/producer.html", file: "producer.html", label: "Producer" },
    { href: prefix + "derivations/discounting.html", file: "discounting.html", label: "Discounting" },
    { href: prefix + "sources.md", file: "sources.md", label: "Sources" }
  ];
  var nav = document.getElementById("site-nav");
  if (!nav) return;
  nav.innerHTML = items.map(function (it) {
    var cur = it.file === file ? " aria-current=\"page\"" : "";
    return "<a href=\"" + it.href + "\"" + cur + ">" + it.label + "</a>";
  }).join("");
})();
