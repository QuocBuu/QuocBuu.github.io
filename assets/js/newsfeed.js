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

function getViewerId() {
  var key = "nf-viewer-id";
  var viewerId = localStorage.getItem(key);
  if (!viewerId) {
    viewerId = "viewer-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(key, viewerId);
  }
  return viewerId;
}

/* ── Expand / Collapse feed width ───────────────────────────────────────── */

function toggleFeedWidth() {
  var feed = document.querySelector(".nf-feed");
  var icon = document.getElementById("nf-expand-icon");
  if (!feed) return;
  var expanded = feed.classList.toggle("expanded");
  if (icon) {
    icon.className = expanded ? "fa fa-compress" : "fa fa-expand";
  }
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

function getCommentImageKey(id) {
  return "comment-image-" + id;
}

function getCommentEditKey(id) {
  return "comment-edit-" + id;
}

function getCommentDraftImage(id) {
  return localStorage.getItem(getCommentImageKey(id)) || "";
}

function getEditingComment(id) {
  var raw = localStorage.getItem(getCommentEditKey(id));
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (_) {
    localStorage.removeItem(getCommentEditKey(id));
    return null;
  }
}

function setEditingComment(id, data) {
  if (data) {
    localStorage.setItem(getCommentEditKey(id), JSON.stringify(data));
  } else {
    localStorage.removeItem(getCommentEditKey(id));
  }
  updateEditingState(id);
}

function updateEditingState(id) {
  var box = document.getElementById("comment-editing-" + id);
  var sendBtn = document.querySelector("#comments-box-" + id + " .nf-comment-send");
  var editing = getEditingComment(id);

  if (box) box.hidden = !editing;
  if (sendBtn) {
    sendBtn.innerHTML = editing
      ? '<i class="fa fa-save"></i>'
      : '<i class="fa fa-paper-plane"></i>';
  }
}

function setCommentDraftImage(id, dataUrl) {
  if (dataUrl) {
    localStorage.setItem(getCommentImageKey(id), dataUrl);
  } else {
    localStorage.removeItem(getCommentImageKey(id));
  }
  updateCommentPreview(id, dataUrl);
}

function updateCommentPreview(id, dataUrl) {
  var wrap = document.getElementById("comment-preview-" + id);
  var img = document.getElementById("comment-preview-img-" + id);
  if (!wrap || !img) return;

  if (dataUrl) {
    img.src = dataUrl;
    wrap.hidden = false;
  } else {
    img.removeAttribute("src");
    wrap.hidden = true;
  }
}

function clearCommentImage(id) {
  var fileInput = document.getElementById("comment-image-" + id);
  if (fileInput) fileInput.value = "";
  setCommentDraftImage(id, "");
}

function startEditComment(id, key) {
  var card = document.querySelector('.nf-comment-item[data-comment-key="' + key + '"]');
  if (!card) return;

  var text = card.getAttribute("data-comment-text") || "";
  var image = card.getAttribute("data-comment-image") || "";
  var ownerId = card.getAttribute("data-comment-owner") || "";

  if (ownerId !== getViewerId()) return;

  document.getElementById("comment-input-" + id).value = text;
  setCommentDraftImage(id, image);
  setEditingComment(id, { key: key });
  toggleCommentsOpen(id);
  document.getElementById("comment-input-" + id).focus();
}

function cancelEditComment(id) {
  setEditingComment(id, null);
  document.getElementById("comment-input-" + id).value = "";
  clearCommentImage(id);
}

function toggleCommentsOpen(id) {
  var box = document.getElementById("comments-box-" + id);
  if (!box.classList.contains("open")) {
    box.classList.add("open");
  }
}

function resizeImageFile(file, maxEdge, quality) {
  return new Promise(function (resolve, reject) {
    if (!file) {
      resolve("");
      return;
    }

    var reader = new FileReader();
    reader.onload = function () {
      var img = new Image();
      img.onload = function () {
        var width = img.width;
        var height = img.height;
        var scale = Math.min(1, maxEdge / Math.max(width, height));
        var canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(width * scale));
        canvas.height = Math.max(1, Math.round(height * scale));
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function handleCommentImage(event, id) {
  var file = event.target.files && event.target.files[0];
  if (!file) {
    clearCommentImage(id);
    return;
  }

  resizeImageFile(file, 480, 0.82)
    .then(function (dataUrl) {
      setCommentDraftImage(id, dataUrl);
    })
    .catch(function () {
      clearCommentImage(id);
      toast("Could not process that image.");
    });
}

function postComment(id) {
  var input = document.getElementById("comment-input-" + id);
  var text = input.value.trim();
  var image = getCommentDraftImage(id);
  var editing = getEditingComment(id);
  if (!text && !image) return;

  var name = localStorage.getItem("nf-name");
  if (!name) {
    name = window.prompt("Your name:", "") || "Anonymous";
    if (name !== "Anonymous") localStorage.setItem("nf-name", name);
  }

  var comment = {
    author: name,
    ownerId: getViewerId(),
    text: text,
    image: image || "",
    time: Date.now()
  };

  if (FIREBASE_URL) {
    if (editing && editing.key) {
      fbGet("posts/" + id + "/comments/" + editing.key).then(function (existing) {
        if (!existing || existing.ownerId !== getViewerId()) {
          toast("You can only edit your own comment.");
          cancelEditComment(id);
          return;
        }

        comment.time = existing.time || comment.time;
        comment.editedAt = Date.now();
        fbSet("posts/" + id + "/comments/" + editing.key, comment).then(function () {
          input.value = "";
          clearCommentImage(id);
          setEditingComment(id, null);
          loadPost(id);
        });
      });
    } else {
      fbPush("posts/" + id + "/comments", comment).then(function () {
        input.value = "";
        clearCommentImage(id);
        loadPost(id);
      });
    }
  } else {
    var key = "cms-" + id;
    var arr = JSON.parse(localStorage.getItem(key) || "[]");
    if (editing && editing.key) {
      var idx = parseInt(editing.key, 10);
      if (!isNaN(idx) && arr[idx] && arr[idx].ownerId === getViewerId()) {
        comment.time = arr[idx].time || comment.time;
        comment.editedAt = Date.now();
        arr[idx] = comment;
      }
    } else {
      arr.push(comment);
    }
    localStorage.setItem(key, JSON.stringify(arr));
    input.value = "";
    clearCommentImage(id);
    setEditingComment(id, null);
    document.getElementById("comments-count-" + id).textContent = arr.length;
    loadPost(id);
  }
}

function renderComment(id, key, c) {
  var list = document.getElementById("comments-list-" + id);
  var el = document.createElement("div");
  el.className = "nf-comment-item";
  el.setAttribute("data-comment-key", key);
  el.setAttribute("data-comment-text", c.text || "");
  el.setAttribute("data-comment-image", c.image || "");
  el.setAttribute("data-comment-owner", c.ownerId || "");
  var init = encodeURIComponent(((c.author || "?")[0]).toUpperCase());
  var textHtml = c.text ? '<div class="nf-comment-text">' + esc(c.text) + "</div>" : "";
  var imageHtml = c.image
    ? '<img src="' + c.image + '" class="nf-comment-image" alt="Comment image"/>'
    : "";
  var editHtml = c.ownerId === getViewerId()
    ? '<button type="button" class="nf-comment-edit-btn" onclick="startEditComment(\'' + id + '\', \'' + key + '\')">Edit</button>'
    : "";
  var editedHtml = c.editedAt ? '<span class="nf-comment-edited">Edited</span>' : "";
  el.innerHTML =
    '<img src="https://ui-avatars.com/api/?name=' + init +
    '&background=dde3ee&color=3b5998&size=32" class="nf-comment-avatar" alt=""/>' +
    '<div class="nf-comment-bubble"><strong>' +
    esc(c.author) + '</strong>' + textHtml + imageHtml +
    '<div class="nf-comment-meta">' + editHtml + editedHtml + "</div></div>";
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
        ? Object.keys(data.comments).map(function (key) {
            return { key: key, value: data.comments[key] };
          }).sort(function (a, b) {
            return (a.value.time || 0) - (b.value.time || 0);
          })
        : [];

      setLikeCount(id, likes);
      document.getElementById("shares-count-" + id).textContent = shares;
      document.getElementById("comments-count-" + id).textContent = comments.length;

      var list = document.getElementById("comments-list-" + id);
      list.innerHTML = "";
      comments.forEach(function (entry) { renderComment(id, entry.key, entry.value); });
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
      .forEach(function (c, idx) { renderComment(id, String(idx), c); });
  }
}

document.addEventListener("DOMContentLoaded", function () {
  var posts = document.querySelectorAll(".nf-post[data-post-id]");
  posts.forEach(function (el) {
    var id = el.getAttribute("data-post-id");
    updateCommentPreview(id, getCommentDraftImage(id));
    updateEditingState(id);
    loadPost(id);
  });
});
