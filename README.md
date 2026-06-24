---
sort: 1
---

<div id="nf-toast" class="nf-toast"></div>

<div class="nf-header">
  <span class="nf-logo">The NEWs</span>
</div>

<div class="nf-feed">

  <div class="nf-post">

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
        <span id="likes-count-1">0</span>
      </span>
      <span>
        <span id="comments-count-1">0</span> comments
        &nbsp;&middot;&nbsp;
        <span id="shares-count-1">0</span> shares
      </span>
    </div>

    <div class="nf-actions">
      <button class="nf-action-btn" id="like-btn-1" onclick="toggleLike('1')">
        <i class="fa fa-thumbs-up"></i> Like
      </button>
      <button class="nf-action-btn" onclick="toggleComments('1')">
        <i class="fa fa-comment"></i> Comment
      </button>
      <button class="nf-action-btn" onclick="sharePost('1','https://github.com/QuocBuu/archery_game')">
        <i class="fa fa-share"></i> Share
      </button>
    </div>

    <div class="nf-comments" id="comments-box-1">
      <div id="comments-list-1"></div>
      <div class="nf-comment-input-row">
        <img src="https://avatars.githubusercontent.com/QuocBuu"
             class="nf-comment-avatar" alt=""/>
        <input type="text" class="nf-comment-input" id="comment-input-1"
               placeholder="Write a comment..."
               onkeydown="if(event.key==='Enter') postComment('1')"/>
        <button class="nf-comment-send" onclick="postComment('1')">
          <i class="fa fa-paper-plane"></i>
        </button>
      </div>
    </div>

  </div>

</div>

<script src="/assets/js/newsfeed.js"></script>
