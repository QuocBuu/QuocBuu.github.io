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
});