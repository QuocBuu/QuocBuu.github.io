/* newsfeed.js — Like / Comment / Share for The NEWs */

const FIREBASE_URL = "";

async function fbGet(path) {
  if (!FIREBASE_URL) return null;
  try {
    const r = await fetch(FIREBASE_URL + "/" + path + ".json");
    if (!r.ok) return null;
    return await r.json();
  } catch (e) { return null; }
}

async function fbSet(path, val) {
  if (!FIREBASE_URL) return;
  try {
    await fetch(FIREBASE_URL + "/" + path + ".json", {
      method: "PUT", body: JSON.stringify(val)
    });
  } catch (e) {}
}

async function fbPush(path, val) {
  if (!FIREBASE_URL) return;
  try {
    await fetch(FIREBASE_URL + "/" + path + ".json", {
      method: "POST", body: JSON.stringify(val)
    });
  } catch (e) {}
}

function esc(s) {
  return (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function toast(msg) {
  var el = document.getElementById("nf-toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(function () { el.classList.remove("show"); }, 2500);
}

async function toggleLike(id) {
  var btn = document.getElementById("like-btn-" + id);
  var liked = !!localStorage.getItem("liked-" + id);
  var count = parseInt(localStorage.getItem("lc-" + id) || "0", 10);

  if (liked) {
    count = Math.max(0, count - 1);
    localStorage.removeItem("liked-" + id);
    btn.classList.remove("liked");
    btn.innerHTML = '<i class="fa fa-thumbs-up"></i> Like';
  } else {
    count += 1;
    localStorage.setItem("liked-" + id, "1");
    btn.classList.add("liked");
    btn.innerHTML = '<i class="fa fa-thumbs-up"></i> Liked';
  }

  localStorage.setItem("lc-" + id, count);
  document.getElementById("likes-count-" + id).textContent = count;

  var stat = document.querySelector(".nf-stat-likes");
  if (stat) stat.style.display = count > 0 ? "inline-flex" : "none";

  if (FIREBASE_URL) fbSet("posts/" + id + "/likes", count);
}

function toggleComments(id) {
  var box = document.getElementById("comments-box-" + id);
  box.classList.toggle("open");
  if (box.classList.contains("open")) {
    document.getElementById("comment-input-" + id).focus();
  }
}

async function postComment(id) {
  var input = document.getElementById("comment-input-" + id);
  var text = input.value.trim();
  if (!text) return;

  var name = localStorage.getItem("nf-name");
  if (!name) {
    name = prompt("Your name:", "") || "Anonymous";
    if (name !== "Anonymous") localStorage.setItem("nf-name", name);
  }

  var c = { author: name, text: text, time: Date.now() };

  var key = "cms-" + id;
  var arr = JSON.parse(localStorage.getItem(key) || "[]");
  arr.push(c);
  localStorage.setItem(key, JSON.stringify(arr));
  document.getElementById("comments-count-" + id).textContent = arr.length;

  if (FIREBASE_URL) fbPush("posts/" + id + "/comments", c);

  renderComment(id, c);
  input.value = "";
}

function renderComment(id, c) {
  var list = document.getElementById("comments-list-" + id);
  var el = document.createElement("div");
  el.className = "nf-comment-item";
  var init = encodeURIComponent((c.author || "?")[0].toUpperCase());
  el.innerHTML =
    '<img src="https://ui-avatars.com/api/?name=' + init +
    '&background=dde3ee&color=3b5998&size=32" class="nf-comment-avatar" alt="' + esc(c.author) + '"/>' +
    '<div class="nf-comment-bubble"><strong>' + esc(c.author) + "</strong>" + esc(c.text) + "</div>";
  list.appendChild(el);
}

async function sharePost(id, url) {
  try {
    await navigator.clipboard.writeText(url);
    toast("GitHub link copied!");
  } catch (e) {
    prompt("Copy this link:", url);
  }

  var key = "sh-" + id;
  var count = parseInt(localStorage.getItem(key) || "0", 10) + 1;
  localStorage.setItem(key, count);
  document.getElementById("shares-count-" + id).textContent = count;

  if (FIREBASE_URL) fbSet("posts/" + id + "/shares", count);
}

function loadPost(id) {
  var likes    = parseInt(localStorage.getItem("lc-"  + id) || "0", 10);
  var shares   = parseInt(localStorage.getItem("sh-"  + id) || "0", 10);
  var comments = JSON.parse(localStorage.getItem("cms-" + id) || "[]");

  document.getElementById("likes-count-"    + id).textContent = likes;
  document.getElementById("shares-count-"   + id).textContent = shares;
  document.getElementById("comments-count-" + id).textContent = comments.length;

  var stat = document.querySelector(".nf-stat-likes");
  if (stat) stat.style.display = likes > 0 ? "inline-flex" : "none";

  if (localStorage.getItem("liked-" + id)) {
    var btn = document.getElementById("like-btn-" + id);
    btn.classList.add("liked");
    btn.innerHTML = '<i class="fa fa-thumbs-up"></i> Liked';
  }

  comments
    .sort(function (a, b) { return (a.time || 0) - (b.time || 0); })
    .forEach(function (c) { renderComment(id, c); });
}

document.addEventListener("DOMContentLoaded", function () {
  loadPost("1");
});
