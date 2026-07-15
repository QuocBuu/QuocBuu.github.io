---
sort: 1
title: Archery Game
permalink: /projects/archery-game/
---

<div class="proj-title-row">
  <h1 id="archery-game">Archery Game</h1>
  <div class="proj-view-counter" id="project-view-counter-archery-game">
    <i class="fa fa-eye"></i>
    <span id="project-views-count-archery-game">0</span> views
  </div>
</div>

> Embedded game built on the **AK Embedded Base Kit (STM32L151)** — a hands-on project to learn event-driven programming through game design.

<div align="center">
  <img src="{{ '/assets/images/projects/archery-game/gif_archery_game_menu_4x.gif' | relative_url }}" width="480" alt="Archery Game Menu"/>
</div>

---

## Overview

| Item | Details |
|---|---|
| **Platform** | AK Embedded Base Kit — STM32L151CBT6 |
| **Display** | 1.54" OLED LCD |
| **Input** | 3 push buttons |
| **Audio** | 1 buzzer |
| **Flash** | 128 KB (8 KB bootloader + 116 KB app) |
| **RAM** | 16 KB |
| **Source** | [github.com/QuocBuu/archery_game](https://github.com/QuocBuu/archery_game) |

---

## Hardware

<div align="center">
  <img src="{{ '/assets/images/projects/archery-game/ak-embedded-base-kit-version-3.jpg' | relative_url }}" width="480" alt="AK Embedded Base Kit v3"/>
  <br/><em>AK Embedded Base Kit — STM32L151 v3.0</em>
</div>

<br/>

<div align="center">
  <img src="{{ '/assets/images/projects/archery-game/board-view-top-bottom.png' | relative_url }}" width="720" alt="Board Top + Bottom"/>
  <br/><em>Board view — Top &amp; Bottom</em>
</div>

---

## Gameplay

**Objective:** Control the Archery (bow) to shoot Arrows and destroy incoming Meteoroids before they hit the Border.

| Button | Action |
|---|---|
| **[Up]** | Move archery up |
| **[Down]** | Move archery down |
| **[Mode]** | Shoot arrow |

**Scoring:** +10 points per Meteoroid destroyed. Speed increases every 200 points.

<div align="center">
  <img src="{{ '/assets/images/projects/archery-game/objects_in_the_game.png' | relative_url }}" width="600" alt="Game objects"/>
  <br/><em>Gameplay screen and objects</em>
</div>

<br/>

<div align="center">
  <img src="{{ '/assets/images/projects/archery-game/gif_game_over_x4.gif' | relative_url }}" width="480" alt="Game Over screen"/>
  <br/><em>Game Over screen — rating from the Mafia Dolphin</em>
</div>

---

## Architecture

The game is built on an **event-driven kernel (AK Framework)** using Tasks, Signals, Timers, and State-machines. UML is used to design each game object's behavior before implementation.

<div align="center">
  <img src="{{ '/assets/images/projects/archery-game/basic_archery_game_sequence_logic.png' | relative_url }}" width="720" alt="Game sequence logic"/>
  <br/><em>Basic game sequence logic</em>
</div>

<br/>

<div align="center">
  <img src="{{ '/assets/images/projects/archery-game/archery_game_programming.png' | relative_url }}" width="720" alt="Archery game programming view"/>
  <br/><em>Programming view</em>
</div>

---

## Links

<div class="proj-links">
  <a href="https://github.com/QuocBuu/archery_game" target="_blank" class="proj-link-btn proj-link-gh">
    <i class="fa fa-github"></i> View on GitHub
  </a>
  <a href="https://quocbuu.github.io/archery_game/" target="_blank" class="proj-link-btn proj-link-play">
    <i class="fa fa-play-circle"></i> Play Simulator
  </a>
</div>

---

## What I Learned

- Designing game objects with UML (sequence diagrams, state machines)
- Event-driven programming on a resource-constrained MCU (16 KB RAM)
- Bitmap rendering on an OLED over I2C
- EEPROM storage for persistent scores and settings
- Bootloader + application flash partition layout
