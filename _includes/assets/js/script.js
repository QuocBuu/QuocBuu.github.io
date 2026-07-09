function toPlainText(encoded) {
    if (!encoded) return "";
    var ta = document.createElement("textarea");
    ta.innerHTML = encoded;
    var once = ta.value;
    var div = document.createElement("div");
    div.innerHTML = once;
    var text = (div.textContent || div.innerText || "").replace(/\s+/g, " ").trim();
    if (text.indexOf("<") !== -1) {
        var div2 = document.createElement("div");
        div2.innerHTML = text;
        text = (div2.textContent || div2.innerText || "").replace(/\s+/g, " ").trim();
    }
    return text;
}

var FIREBASE_URL = window.FIREBASE_URL || "https://quocbuu-portfolio-default-rtdb.firebaseio.com";

function fbUrl(path) {
    return FIREBASE_URL.replace(/\/$/, "") + "/" + path + ".json";
}

function fbGet(path) {
    if (!FIREBASE_URL) return Promise.resolve(null);
    return fetch(fbUrl(path))
        .then(function(r) { return r.ok ? r.json() : null; })
        .catch(function() { return null; });
}

function fbSet(path, val) {
    if (!FIREBASE_URL) return Promise.resolve(null);
    return fetch(fbUrl(path), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(val)
    }).catch(function() { return null; });
}

function fbTransaction(path, updateFn) {
    return fbGet(path).then(function(cur) {
        var next = updateFn(cur);
        return fbSet(path, next).then(function() { return next; });
    });
}

function normalizePath(path) {
    return (path || "").replace(/\/+$/, "") || "/";
}

function setViewCount(id, count) {
    var viewEls = [
        document.getElementById("views-count-" + id),
        document.getElementById("project-views-count-" + id)
    ];
    for (var i = 0; i < viewEls.length; i++) {
        if (viewEls[i]) {
            viewEls[i].textContent = Number(count || 0).toLocaleString("en-US");
        }
    }
}

function loadViewCount(id) {
    return fbGet("posts/" + id + "/views").then(function(count) {
        setViewCount(id, count || 0);
        return count || 0;
    });
}

function shouldCountUniqueView(id, ttlMs) {
    var key = "viewed-post-" + id;
    var lastSeen = parseInt(localStorage.getItem(key) || "0", 10);
    var now = Date.now();

    if (lastSeen && now - lastSeen < ttlMs) {
        return false;
    }

    localStorage.setItem(key, String(now));
    return true;
}

function trackProjectView(id, expectedPath) {
    if (!FIREBASE_URL) return;

    var currentPath = normalizePath(location.pathname);
    var targetPath = normalizePath(expectedPath);
    var oneDayMs = 24 * 60 * 60 * 1000;

    if (currentPath !== targetPath) return;
    if (!shouldCountUniqueView(id, oneDayMs)) return;

    fbTransaction("posts/" + id + "/views", function(cur) {
        return (cur || 0) + 1;
    }).then(function(count) {
        setViewCount(id, count);
    });
}

function highlight(text, query) {
    if (!query) return text;
    var safe = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return text.replace(new RegExp("(" + safe + ")", "gi"), "<mark>$1</mark>");
}

function search(data) {
    var q = new URL(location.href).searchParams.get("q") || "";
    var ql = q.toLowerCase();
    var rows = [];

    for (var i = 0; i < data.length; i++) {
        var item  = data[i];
        var title = item.title || "";
        var plain = toPlainText(item.content);
        var url   = item.url || "#";

        var inTitle   = ql.length > 0 && title.toLowerCase().indexOf(ql) !== -1;
        var inContent = ql.length > 0 && plain.length > 10 && plain.toLowerCase().indexOf(ql) !== -1;

        if (!inTitle && !inContent) continue;

        var snippet = "";
        if (inContent) {
            var idx = plain.toLowerCase().indexOf(ql);
            var lo  = Math.max(0, idx - 70);
            var hi  = Math.min(plain.length, idx + q.length + 70);
            snippet = (lo > 0 ? "…" : "") +
                      highlight(plain.slice(lo, hi), q) +
                      (hi < plain.length ? "…" : "");
        } else {
            snippet = highlight(title, q);
        }

        rows.push(
            '<tr class="sr-row">' +
            '<td class="sr-snippet">' + snippet + '</td>' +
            '<td class="sr-link"><a href="' + url + '">' + (title || url) + '</a></td>' +
            '</tr>'
        );
    }

    if (rows.length > 0 && q.length > 0) {
        $("#search-results").html(
            '<table class="sr-table"><tbody>' + rows.join("") + '</tbody></table>'
        );
    } else {
        $("#search-results").html("{{ __no_results_found }}");
    }
    $("#rtd-search-form [name='q']").val(q);
}

function reset() {
    const link = $(".wy-menu-vertical").find(`[href="${location.pathname}"]`);
    if (link.length > 0) {
        $(".wy-menu-vertical .current").removeClass("current");
        link.addClass("current");
        link.closest("li.toctree-l1").parent().addClass("current");
        link.closest("li.toctree-l1").addClass("current");
        link.closest("li.toctree-l2").addClass("current");
        link.closest("li.toctree-l3").addClass("current");
        link.closest("li.toctree-l4").addClass("current");
        link.closest("li.toctree-l5").addClass("current");
    }
}

function admonition() {
    const items = {
        note: "{{ __note }}",
        tip: "{{ __tip }}",
        warning: "{{ __warning }}",
        danger: "{{ __danger }}"
    };
    for (let item in items) {
        let content = $(`.language-${item}`).html();
        $(`.language-${item}`).replaceWith(`<div class="admonition ${item}"><p class="admonition-title">${items[item]}</p><p>${content}</p></div>`);
    }
}

$(document).ready(function() {
    if (location.pathname == "{{ site.baseurl }}/search.html") {
        $.getJSON("{{ site.baseurl }}/data.json", search);
    }
    admonition();
    anchors.add();
    SphinxRtdTheme.Navigation.reset = reset;
    SphinxRtdTheme.Navigation.enable(true);

    loadViewCount("archery-game");
    trackProjectView("archery-game", "{{ site.baseurl }}/projects/archery-game/");
});
