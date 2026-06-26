---
sort: 1
title: The NEWs
---

<div id="nf-toast" class="nf-toast"></div>

<div class="nf-header">
  <span class="nf-logo">The NEWs</span>
  <button class="nf-expand-btn" id="nf-expand-btn" onclick="toggleFeedWidth()" title="Expand / Collapse">
    <i class="fa fa-expand" id="nf-expand-icon"></i>
  </button>
</div>

<div class="nf-feed">

  <div class="nf-post" data-post-id="archery-game">

    <div class="nf-post-header">
      <img src="https://avatars.githubusercontent.com/QuocBuu"
           class="nf-avatar" alt="QuocBuu"/>
      <div>
        <div class="nf-name">Phan Quoc Buu</div>
        <div class="nf-meta">shared a new project &middot; Jun 2024</div>
      </div>
    </div>

    <div class="nf-post-body">
      <p>
        Just shipped <strong>Archery Game</strong> &mdash; an embedded game running on the
        STM32L151 microcontroller, built to practice event-driven programming through
        real game design: Tasks, Signals, State-machines, UML...
      </p>
      <a href="projects/archery-game/">
        <img src="/assets/images/projects/archery-game/gif_archery_game_menu_4x.gif"
             class="nf-post-img" alt="Archery Game"/>
      </a>
      <a href="https://quocbuu.github.io/archery_game/"
         target="_blank" class="nf-play-btn">
        &#9654; Play the Simulator
      </a>
    </div>

    <div class="nf-stats">
      <span class="nf-stat-likes">
        <span class="nf-stat-icon"><i class="fa fa-thumbs-up"></i></span>
        <span id="likes-count-archery-game">0</span>
      </span>
      <span>
        <span id="comments-count-archery-game">0</span> comments
        &nbsp;&middot;&nbsp;
        <span id="shares-count-archery-game">0</span> shares
      </span>
    </div>

    <div class="nf-actions">
      <button class="nf-action-btn" id="like-btn-archery-game" onclick="toggleLike('archery-game')">
        <i class="fa fa-thumbs-up"></i> Like
      </button>
      <button class="nf-action-btn" onclick="toggleComments('archery-game')">
        <i class="fa fa-comment"></i> Comment
      </button>
      <button class="nf-action-btn" onclick="sharePost('archery-game','https://github.com/QuocBuu/archery_game')">
        <i class="fa fa-share"></i> Share
      </button>
    </div>

    <div class="nf-comments" id="comments-box-archery-game">
      <div id="comments-list-archery-game"></div>
      <div class="nf-comment-input-row">
        <img src="https://avatars.githubusercontent.com/QuocBuu"
             class="nf-comment-avatar" alt=""/>
        <input type="text" class="nf-comment-input" id="comment-input-archery-game"
               placeholder="Write a comment..."
               onkeydown="if(event.key==='Enter') postComment('archery-game')"/>
        <button class="nf-comment-send" onclick="postComment('archery-game')">
          <i class="fa fa-paper-plane"></i>
        </button>
      </div>
    </div>

  </div>

</div>

<script src="/assets/js/newsfeed.js"></script>
