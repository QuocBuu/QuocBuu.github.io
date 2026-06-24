/* newsfeed.js — Global Like / Comment / Share via Firebase Realtime Database */

/* ── CONFIG ─────────────────────────────────────────────────────────────────
   Paste your Firebase Realtime Database URL here to enable global storage.
   Everyone who visits will see the same like/comment/share counts.

   Setup (free, ~3 min):
     1. Go to https://console.firebase.google.com
     2. Create project (any name)
     3. Build → Realtime Database → Create database → Start in TEST mode
     4. Copy the URL shown (e.g. https://xxx-default-rtdb.firebaseio.com)
     5. Paste it below and rebuild the site
────────────────────────────────────────────────────────────────────────── */
var FIREBASE_URL = "https://quocbuu-portfolio-default-rtdb.firebaseio.com";

/* ── Firebase REST helpers ──────────────────────────────────────────────── */

function fbUrl(path) {
  return FIREBASE_URL.replace(/\/$/, "") + "/" + path + ".json";
}

function fbGet(path) {
  return fetch(fbUrl(path))
    .then(function (r) { return r.ok ? r.json() : null; })
    .catch(function () { return null; });
}

function fbSet(path, val) {
  return fetch(fbUrl(path), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(val)
  }).catch(function () {});
}

function fbTransaction(path, updateFn) {
  return fbGet(path).then(function (cur) {
    var next = updateFn(cur);
    return fbSet(path, next).then(function () { return next; });
  });
}

function fbPush(path, val) {
  return fetch(fbUrl(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(val)
  })
    .then(function (r) { return r.json(); })
    .catch(function () { return null; });
}

/* ── Like ───────────────────────────────────────────────────────────────── */

function toggleLike(id) {
  var liked = !!localStorage.getItem("liked-" + id);
  var btn = document.getElementById("like-btn-" + id);

  if (liked) {
    localStorage.removeItem("liked-" + id);
    btn.classList.remove("liked");
    btn.innerHTML = '<i class="fa fa-thumbs-up"></i> Like';
  } else {
    localStorage.setItem("liked-" + id, "1");
    btn.classList.add("liked");
    btn.innerHTML = '<i class="fa fa-thumbs-up"></i> Liked';
  }

  var delta = liked ? -1 : 1;

  if (FIREBASE_URL) {
    fbTransaction("posts/" + id + "/likes", function (cur) {
      return Math.max(0, (cur || 0) + delta);
    }).then(function (count) {
      setLikeCount(id, count);
    });
  } else {
    var count = Math.max(0, parseInt(localStorage.getItem("lc-" + id) || "0", 10) + delta);
    localStorage.setItem("lc-" + id, count);
    setLikeCount(id, count);
  }
}

function setLikeCount(id, n) {
  document.getElementById("likes-count-" + id).textContent = n;
  var badge = document.querySelector(".nf-stat-likes");
  if (badge) badge.style.display = n > 0 ? "inline-flex" : "none";
}

/* ── Comment ─────────────────────────────────────────────────────────────── */

function toggleComments(id) {
  var box = document.getElementById("comments-box-" + id);
  box.classList.toggle("open");
  if (box.classList.contains("open")) {
    document.getElementById("comment-input-" + id).focus();
  }
}

function postComment(id) {
  var input = document.getElementById("comment-input-" + id);
  var text = input.value.trim();
  if (!text) return;

  var name = localStorage.getItem("nf-name");
  if (!name) {
    name = window.prompt("Your name:", "") || "Anonymous";
    if (name !== "Anonymous") localStorage.setItem("nf-name", name);
  }

  var comment = { author: name, text: text, time: Date.now() };
  input.value = "";

  if (FIREBASE_URL) {
    fbPush("posts/" + id + "/comments", comment).then(function () {
      fbGet("posts/" + id + "/comments").then(function (data) {
        var count = data ? Object.keys(data).length : 0;
        document.getElementById("comments-count-" + id).textContent = count;
      });
    });
    renderComment(id, comment);
  } else {
    var key = "cms-" + id;
    var arr = JSON.parse(localStorage.getItem(key) || "[]");
    arr.push(comment);
    localStorage.setItem(key, JSON.stringify(arr));
    document.getElementById("comments-count-" + id).textContent = arr.length;
    renderComment(id, comment);
  }
}

function renderComment(id, c) {
  var list = document.getElementById("comments-list-" + id);
  var el = document.createElement("div");
  el.className = "nf-comment-item";
  var init = encodeURIComponent(((c.author || "?")[0]).toUpperCase());
  el.innerHTML =
    '<img src="https://ui-avatars.com/api/?name=' + init +
    '&background=dde3ee&color=3b5998&size=32" class="nf-comment-avatar" alt=""/>' +
    '<div class="nf-comment-bubble"><strong>' +
    esc(c.author) + "</strong> " + esc(c.text) + "</div>";
  list.appendChild(el);
}

/* ── Share ───────────────────────────────────────────────────────────────── */

function sharePost(id, url) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(function () {
      toast("GitHub link copied!");
    }).catch(function () {
      window.prompt("Copy this link:", url);
    });
  } else {
    window.prompt("Copy this link:", url);
    toast("GitHub link copied!");
  }

  if (FIREBASE_URL) {
    fbTransaction("posts/" + id + "/shares", function (cur) {
      return (cur || 0) + 1;
    }).then(function (count) {
      document.getElementById("shares-count-" + id).textContent = count;
    });
  } else {
    var count = parseInt(localStorage.getItem("sh-" + id) || "0", 10) + 1;
    localStorage.setItem("sh-" + id, count);
    document.getElementById("shares-count-" + id).textContent = count;
  }
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function esc(s) {
  return (s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function toast(msg) {
  var el = document.getElementById("nf-toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(function () { el.classList.remove("show"); }, 2500);
}

/* ── Init: load state on page open ─────────────────────────────────────── */

function loadPost(id) {
  if (localStorage.getItem("liked-" + id)) {
    var btn = document.getElementById("like-btn-" + id);
    if (btn) {
      btn.classList.add("liked");
      btn.innerHTML = '<i class="fa fa-thumbs-up"></i> Liked';
    }
  }

  if (FIREBASE_URL) {
    fbGet("posts/" + id).then(function (data) {
      if (!data) return;

      var likes  = data.likes  || 0;
      var shares = data.shares || 0;
      var comments = data.comments
        ? Object.values(data.comments).sort(function (a, b) {
            return (a.time || 0) - (b.time || 0);
          })
        : [];

      setLikeCount(id, likes);
      document.getElementById("shares-count-" + id).textContent = shares;
      document.getElementById("comments-count-" + id).textContent = comments.length;

      var list = document.getElementById("comments-list-" + id);
      list.innerHTML = "";
      comments.forEach(function (c) { renderComment(id, c); });
    });
  } else {
    var likes    = parseInt(localStorage.getItem("lc-"  + id) || "0", 10);
    var shares   = parseInt(localStorage.getItem("sh-"  + id) || "0", 10);
    var comments = JSON.parse(localStorage.getItem("cms-" + id) || "[]");

    setLikeCount(id, likes);
    document.getElementById("shares-count-" + id).textContent = shares;
    document.getElementById("comments-count-" + id).textContent = comments.length;
    comments
      .sort(function (a, b) { return (a.time || 0) - (b.time || 0); })
      .forEach(function (c) { renderComment(id, c); });
  }
}

document.addEventListener("DOMContentLoaded", function () {
  var posts = document.querySelectorAll(".nf-post[data-post-id]");
  posts.forEach(function (el) {
    loadPost(el.getAttribute("data-post-id"));
  });
});
