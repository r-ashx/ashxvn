/* ==========================================================================
   Ash x Tunes — Complete Vanilla JavaScript Player Logic
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // ------------------------------------------------------------------------
  // 1. Song Data
  // ------------------------------------------------------------------------
  const songs = [
    { title: "Aankhon Mein Teri", src: "Music/Aankhon Mein Teri.webm" },
    { title: "Afreen Afreen", src: "Music/Afree Afree.webm" },
    { title: "Agar Tum Saath", src: "Music/AGAR TUM SAATH.webm" },
    { title: "Apna Bana Le", src: "Music/Apna Bana Le.webm" },
    { title: "Arz Kya Hai", src: "Music/Arz kya hai.mp3" },
    { title: "Bairan", src: "Music/Bairan.mp3" },
    { title: "Bulleya", src: "Music/Bulleya Full Song.webm" },
    { title: "Channa Ve", src: "Music/Channa Ve Full.webm" },
    { title: "Dagabazz Re", src: "Music/Dagabazz re.mp3" },
    { title: "For A Reason", src: "Music/For A Reason.webm" },
    { title: "Ghar More Pardesiya", src: "Music/Ghar More Pardesiya.webm" },
    { title: "Jag Ghoomeya", src: "Music/Jag Ghoomeya Full.webm" },
    { title: "Jogi", src: "Music/Jogi Lyrical Shaadi.webm" },
    { title: "Kajra Re", src: "Music/Kajra Re Full.webm" },
    { title: "Kesariya", src: "Music/Kesariya Brahm stra.webm" },
    { title: "Lag Ja Gale", src: "Music/Lag Ja Gale.webm" },
    { title: "Mann Mohan", src: "Music/Mann Mohan-Lalo.webm" },
    { title: "Mast Magan", src: "Music/Mast Magan.mp3" },
    { title: "Sahiba", src: "Music/Sahiba.webm" },
    { title: "Saudebaazi", src: "Music/Saudebaazi.mp3" },
    { title: "Tera Fitoor", src: "Music/Tera Fitoor.webm" },
    { title: "Tere Mast Mast Do Nain", src: "Music/Tere Mast Mast Do Nain.mp3" },
    { title: "Tum Jo Aye", src: "Music/Tum jo aye.webm" },
    { title: "Varoon", src: "Music/Varoon.mp3" },
    { title: "Ye Tune Kya", src: "Music/Ye Tune Kya.webm" },
    { title: "Zalima", src: "Music/Zalima.mp3" }
  ];

  const formattedSongs = songs.map((s, idx) => ({
    id: idx,
    title: s.title,
    artist: "Ash Tunes",
    album: "Bollywood Collection",
    src: s.src,
    duration: 0
  }));

  // ------------------------------------------------------------------------
  // 2. State Management & Variables
  // ------------------------------------------------------------------------
  let isHotKeyPaused = false; // Flag for NumLock pause enforcement

  let state = {
    currentIndex: 0,
    isPlaying: false,
    isShuffle: false,
    repeatMode: 0, // 0: Off, 1: Repeat Playlist, 2: Repeat Track
    volume: 0.7,
    isMuted: false,
    currentView: "all",
    favorites: [],
    recentlyPlayed: [],
    searchQuery: "",
    contextTargetId: null
  };

  // ------------------------------------------------------------------------
  // 3. DOM Elements
  // ------------------------------------------------------------------------
  const audio = document.getElementById("audio-player");
  const splashScreen = document.getElementById("splash-screen");

  const greetingText = document.getElementById("greeting-text");
  const searchInput = document.getElementById("search-input");
  const clearSearchBtn = document.getElementById("clear-search");
  const activeViewBadge = document.getElementById("active-view-badge");

  const navItems = document.querySelectorAll(".nav-item");
  const statAllCount = document.getElementById("stat-all-count");
  const statFavCount = document.getElementById("stat-fav-count");
  const statRecentCount = document.getElementById("stat-recent-count");

  const heroArtwork = document.getElementById("hero-artwork");
  const artSongTitle = document.getElementById("art-song-title");
  const mainSongTitle = document.getElementById("main-song-title");
  const mainArtistName = document.getElementById("main-artist-name");
  const visualizer = document.getElementById("visualizer");

  const songListEl = document.getElementById("song-list");
  const viewSectionTitle = document.getElementById("view-section-title");
  const songCountLabel = document.getElementById("song-count-label");

  const queueListEl = document.getElementById("queue-list");
  const queueCountEl = document.getElementById("queue-count");

  const miniTitle = document.getElementById("mini-title");
  const miniArtist = document.getElementById("mini-artist");
  const miniFavBtn = document.getElementById("mini-fav-btn");
  const btnPlay = document.getElementById("btn-play");
  const iconPlay = document.getElementById("icon-play");
  const iconPause = document.getElementById("icon-pause");
  const btnPrev = document.getElementById("btn-prev");
  const btnNext = document.getElementById("btn-next");
  const btnShuffle = document.getElementById("btn-shuffle");
  const btnRepeat = document.getElementById("btn-repeat");

  const timeCurrent = document.getElementById("time-current");
  const timeDuration = document.getElementById("time-duration");
  const progressFill = document.getElementById("progress-fill");
  const progressSlider = document.getElementById("progress-slider");
  
  const btnMute = document.getElementById("btn-mute");
  const iconVolHigh = document.getElementById("icon-vol-high");
  const iconVolMute = document.getElementById("icon-vol-mute");
  const volumeFill = document.getElementById("volume-fill");
  const volumeSlider = document.getElementById("volume-slider");

  const contextMenu = document.getElementById("context-menu");
  const toastContainer = document.getElementById("toast-container");

  // ------------------------------------------------------------------------
  // 4. Initialization & Storage
  // ------------------------------------------------------------------------
  function init() {
    loadLocalStorage();
    updateGreeting();
    preloadAudioDurations();

    loadSong(state.currentIndex, false);

    updateVolumeUI();
    renderSidebarStats();
    renderView();
    renderQueue();

    setTimeout(() => {
      splashScreen.classList.add("fade-out");
    }, 2800);

    setupEventListeners();
  }

  function loadLocalStorage() {
    const savedFavs = localStorage.getItem("gt_favorites");
    if (savedFavs) state.favorites = JSON.parse(savedFavs);

    const savedRecent = localStorage.getItem("gt_recentlyPlayed");
    if (savedRecent) state.recentlyPlayed = JSON.parse(savedRecent);

    const savedVol = localStorage.getItem("gt_volume");
    if (savedVol !== null) state.volume = parseFloat(savedVol);

    const savedIdx = localStorage.getItem("gt_lastIndex");
    if (savedIdx !== null && formattedSongs[savedIdx]) {
      state.currentIndex = parseInt(savedIdx, 10);
    }
  }

  function saveState() {
    localStorage.setItem("gt_favorites", JSON.stringify(state.favorites));
    localStorage.setItem("gt_recentlyPlayed", JSON.stringify(state.recentlyPlayed));
    localStorage.setItem("gt_volume", state.volume.toString());
    localStorage.setItem("gt_lastIndex", state.currentIndex.toString());
  }

  function updateGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) greetingText.innerText = "GOOD MORNING";
    else if (hour < 18) greetingText.innerText = "GOOD AFTERNOON";
    else greetingText.innerText = "GOOD EVENING";
  }

  function preloadAudioDurations() {
    formattedSongs.forEach(song => {
      const tempAudio = new Audio();
      tempAudio.src = song.src;
      tempAudio.addEventListener("loadedmetadata", () => {
        song.duration = tempAudio.duration;
        const durCell = document.getElementById(`dur-${song.id}`);
        if (durCell) durCell.innerText = formatTime(song.duration);
      });
    });
  }

  // ------------------------------------------------------------------------
  // 5. Core Audio Logic
  // ------------------------------------------------------------------------
  function loadSong(index, shouldPlay = true) {
    if (index < 0 || index >= formattedSongs.length) return;
    
    state.currentIndex = index;
    const song = formattedSongs[index];

    audio.src = song.src;
    audio.load();

    mainSongTitle.innerText = song.title;
    mainArtistName.innerText = song.artist;
    artSongTitle.innerText = song.title;
    miniTitle.innerText = song.title;
    miniArtist.innerText = song.artist;

    updateFavoriteButtonUI();
    highlightActiveRow();
    renderQueue();
    updateMediaSession(song);
    saveState();

    if (shouldPlay) {
      playSong();
      addToRecentlyPlayed(song.id);
    } else {
      pauseSong();
    }
  }

  function playSong() {
    isHotKeyPaused = false; // Reset NumLock lock when manually clicking play/resume
    state.isPlaying = true;
    audio.play().then(() => {
      iconPlay.style.display = "none";
      iconPause.style.display = "block";
      heroArtwork.classList.add("playing");
      visualizer.classList.add("active");
    }).catch(err => {
      console.warn("Autoplay blocked or error loading audio:", err);
      pauseSong();
    });
  }

  function pauseSong() {
    state.isPlaying = false;
    audio.pause();
    iconPlay.style.display = "block";
    iconPause.style.display = "none";
    heroArtwork.classList.remove("playing");
    visualizer.classList.remove("active");
  }

  function togglePlay() {
    if (state.isPlaying) {
      pauseSong();
    } else {
      playSong();
    }
  }

  function nextSong() {
    if (state.isShuffle) {
      let rand = Math.floor(Math.random() * formattedSongs.length);
      loadSong(rand, true);
    } else {
      let nextIdx = state.currentIndex + 1;
      if (nextIdx >= formattedSongs.length) {
        if (state.repeatMode === 1) nextIdx = 0;
        else {
          pauseSong();
          return;
        }
      }
      loadSong(nextIdx, true);
    }
  }

  function previousSong() {
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    let prevIdx = state.currentIndex - 1;
    if (prevIdx < 0) prevIdx = formattedSongs.length - 1;
    loadSong(prevIdx, true);
  }

  // ------------------------------------------------------------------------
  // 6. NumLock Stop & Background/Tab Protection Logic
  // ------------------------------------------------------------------------
  function triggerNumLockPause() {
    if (!audio.paused || state.isPlaying) {
      pauseSong();
      isHotKeyPaused = true;
      showToast("Music stopped via NumLock", "🛑");
    }
  }

  // Lock music from playing when switching tabs or coming back to focus
  const enforcePauseState = () => {
    if (isHotKeyPaused || !state.isPlaying) {
      if (!audio.paused) {
        audio.pause();
      }
    }
  };

  document.addEventListener("visibilitychange", enforcePauseState);
  window.addEventListener("focus", enforcePauseState);
  window.addEventListener("blur", enforcePauseState);

  // ------------------------------------------------------------------------
  // 7. Favorites & Recently Played
  // ------------------------------------------------------------------------
  function toggleFavorite(id) {
    const index = state.favorites.indexOf(id);
    const song = formattedSongs.find(s => s.id === id);

    if (index === -1) {
      state.favorites.push(id);
      showToast(`Added "${song.title}" to Favorites`, "❤️");
    } else {
      state.favorites.splice(index, 1);
      showToast(`Removed "${song.title}" from Favorites`, "♡");
    }

    saveState();
    renderSidebarStats();
    updateFavoriteButtonUI();

    if (state.currentView === "favorites") renderView();
  }

  function addToRecentlyPlayed(id) {
    state.recentlyPlayed = state.recentlyPlayed.filter(itemId => itemId !== id);
    state.recentlyPlayed.unshift(id);
    if (state.recentlyPlayed.length > 10) state.recentlyPlayed.pop();

    saveState();
    renderSidebarStats();
    if (state.currentView === "recent") renderView();
  }

  function updateFavoriteButtonUI() {
    const isFav = state.favorites.includes(state.currentIndex);
    if (isFav) {
      miniFavBtn.classList.add("active-fav");
      miniFavBtn.style.color = "#ff4d4d";
    } else {
      miniFavBtn.classList.remove("active-fav");
      miniFavBtn.style.color = "var(--color-muted-white)";
    }
  }

  // ------------------------------------------------------------------------
  // 8. Time & Scrubbing
  // ------------------------------------------------------------------------
  function formatTime(seconds) {
    if (isNaN(seconds) || seconds === 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  audio.addEventListener("timeupdate", () => {
    if (!audio.duration) return;
    const current = audio.currentTime;
    const total = audio.duration;
    const percent = (current / total) * 100;

    progressFill.style.width = `${percent}%`;
    progressSlider.value = percent;

    timeCurrent.innerText = formatTime(current);
    timeDuration.innerText = formatTime(total);
  });

  progressSlider.addEventListener("input", (e) => {
    if (!audio.duration) return;
    const targetPercent = e.target.value;
    const newTime = (targetPercent / 100) * audio.duration;
    audio.currentTime = newTime;
  });

  audio.addEventListener("ended", () => {
    if (state.repeatMode === 2) {
      audio.currentTime = 0;
      playSong();
    } else {
      nextSong();
    }
  });

  audio.addEventListener("error", (e) => {
    console.error("Audio playback error:", e);
    showToast("Unable to load audio file.", "⚠");
    setTimeout(() => nextSong(), 1500);
  });

  // ------------------------------------------------------------------------
  // 9. Volume Controls
  // ------------------------------------------------------------------------
  function setVolume(val) {
    state.volume = Math.max(0, Math.min(1, val));
    audio.volume = state.volume;
    state.isMuted = state.volume === 0;
    updateVolumeUI();
    saveState();
  }

  function updateVolumeUI() {
    audio.volume = state.isMuted ? 0 : state.volume;
    const percent = state.isMuted ? 0 : state.volume * 100;

    volumeFill.style.width = `${percent}%`;
    volumeSlider.value = percent;

    if (state.isMuted || state.volume === 0) {
      iconVolHigh.style.display = "none";
      iconVolMute.style.display = "block";
    } else {
      iconVolHigh.style.display = "block";
      iconVolMute.style.display = "none";
    }
  }

  btnMute.addEventListener("click", () => {
    state.isMuted = !state.isMuted;
    updateVolumeUI();
  });

  volumeSlider.addEventListener("input", (e) => {
    setVolume(e.target.value / 100);
  });

  // ------------------------------------------------------------------------
  // 10. View & Rendering
  // ------------------------------------------------------------------------
  function getActiveList() {
    let list = formattedSongs;

    if (state.currentView === "favorites") {
      list = formattedSongs.filter(s => state.favorites.includes(s.id));
    } else if (state.currentView === "recent") {
      list = state.recentlyPlayed.map(id => formattedSongs.find(s => s.id === id)).filter(Boolean);
    }

    if (state.searchQuery.trim() !== "") {
      const q = state.searchQuery.toLowerCase();
      list = list.filter(s => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q) || s.src.toLowerCase().includes(q));
    }

    return list;
  }

  function renderView() {
    const list = getActiveList();
    songListEl.innerHTML = "";

    if (state.currentView === "all") viewSectionTitle.innerText = "All Songs";
    else if (state.currentView === "favorites") viewSectionTitle.innerText = "Favorite Tracks";
    else if (state.currentView === "recent") viewSectionTitle.innerText = "Recently Played";

    songCountLabel.innerText = `${list.length} Tracks`;

    if (list.length === 0) {
      renderEmptyState();
      return;
    }

    list.forEach((song, idx) => {
      const isFav = state.favorites.includes(song.id);
      const isActive = song.id === state.currentIndex;

      const row = document.createElement("div");
      row.className = `song-row ${isActive ? "active-track" : ""}`;
      row.dataset.id = song.id;

      row.innerHTML = `
        <span class="song-row-num">${(idx + 1).toString().padStart(2, '0')}</span>
        <div class="song-row-title-box">
          <div class="song-thumb">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
          </div>
          <span class="song-row-title">${song.title}</span>
        </div>
        <span class="song-row-artist">${song.artist}</span>
        <span id="dur-${song.id}" class="song-row-duration">${formatTime(song.duration)}</span>
        <div class="song-row-actions">
          <button class="icon-btn-sm btn-row-fav ${isFav ? "active-fav" : ""}" title="Favorite">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          </button>
          <button class="icon-btn-sm btn-row-more" title="More Options">⋮</button>
        </div>
      `;

      row.addEventListener("click", (e) => {
        if (e.target.closest(".btn-row-fav") || e.target.closest(".btn-row-more")) return;
        loadSong(song.id, true);
      });

      row.querySelector(".btn-row-fav").addEventListener("click", (e) => {
        e.stopPropagation();
        toggleFavorite(song.id);
      });

      row.querySelector(".btn-row-more").addEventListener("click", (e) => {
        e.stopPropagation();
        openContextMenu(e, song.id);
      });

      songListEl.appendChild(row);
    });
  }

  function renderEmptyState() {
    let msg = "No tracks found.";
    let sub = "Try searching for another keyword.";
    if (state.currentView === "favorites") {
      msg = "No favorite songs yet.";
      sub = "Tap the heart on any song to save it here.";
    } else if (state.currentView === "recent") {
      msg = "Nothing played recently.";
      sub = "Start playing your favorite tracks to build history.";
    }

    songListEl.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">♪</div>
        <h4>${msg}</h4>
        <p>${sub}</p>
      </div>
    `;
  }

  function highlightActiveRow() {
    document.querySelectorAll(".song-row").forEach(row => {
      if (parseInt(row.dataset.id, 10) === state.currentIndex) {
        row.classList.add("active-track");
      } else {
        row.classList.remove("active-track");
      }
    });
  }

  function renderSidebarStats() {
    statAllCount.innerText = formattedSongs.length;
    statFavCount.innerText = state.favorites.length;
    statRecentCount.innerText = state.recentlyPlayed.length;
  }

  // ------------------------------------------------------------------------
  // 11. Queue Panel
  // ------------------------------------------------------------------------
  function renderQueue() {
    queueListEl.innerHTML = "";
    const upcoming = [];

    for (let i = 1; i <= 6; i++) {
      let idx = (state.currentIndex + i) % formattedSongs.length;
      upcoming.push(formattedSongs[idx]);
    }

    queueCountEl.innerText = `${upcoming.length} tracks`;

    upcoming.forEach((song, idx) => {
      const qItem = document.createElement("div");
      qItem.className = "queue-item";
      qItem.innerHTML = `
        <span class="song-row-num">${(idx + 1).toString().padStart(2, '0')}</span>
        <div class="queue-item-meta">
          <div class="queue-item-title">${song.title}</div>
          <div class="queue-item-artist">${song.artist}</div>
        </div>
      `;
      qItem.addEventListener("click", () => loadSong(song.id, true));
      queueListEl.appendChild(qItem);
    });
  }

  // ------------------------------------------------------------------------
  // 12. Search & Context Menus
  // ------------------------------------------------------------------------
  searchInput.addEventListener("input", (e) => {
    state.searchQuery = e.target.value;
    clearSearchBtn.style.display = state.searchQuery ? "block" : "none";
    renderView();
  });

  clearSearchBtn.addEventListener("click", () => {
    searchInput.value = "";
    state.searchQuery = "";
    clearSearchBtn.style.display = "none";
    renderView();
  });

  function openContextMenu(e, id) {
    state.contextTargetId = id;
    contextMenu.style.left = `${Math.min(e.clientX, window.innerWidth - 190)}px`;
    contextMenu.style.top = `${Math.min(e.clientY, window.innerHeight - 150)}px`;
    contextMenu.style.display = "block";
  }

  document.addEventListener("click", () => {
    contextMenu.style.display = "none";
  });

  document.getElementById("ctx-play").addEventListener("click", () => {
    if (state.contextTargetId !== null) loadSong(state.contextTargetId, true);
  });

  document.getElementById("ctx-fav").addEventListener("click", () => {
    if (state.contextTargetId !== null) toggleFavorite(state.contextTargetId);
  });

  document.getElementById("ctx-queue").addEventListener("click", () => {
    showToast("Added song to queue", "♫");
  });

  function showToast(message, icon = "✓") {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<span class="toast-icon">${icon}</span> <span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  // ------------------------------------------------------------------------
  // 13. Event Listeners & Global Shortcuts
  // ------------------------------------------------------------------------
  function setupEventListeners() {
    btnPlay.addEventListener("click", togglePlay);
    btnPrev.addEventListener("click", previousSong);
    btnNext.addEventListener("click", nextSong);

    miniFavBtn.addEventListener("click", () => toggleFavorite(state.currentIndex));

    btnShuffle.addEventListener("click", () => {
      state.isShuffle = !state.isShuffle;
      btnShuffle.classList.toggle("active-state", state.isShuffle);
      showToast(state.isShuffle ? "Shuffle Mode ON" : "Shuffle Mode OFF", "🔀");
    });

    btnRepeat.addEventListener("click", () => {
      state.repeatMode = (state.repeatMode + 1) % 3;
      if (state.repeatMode === 0) {
        btnRepeat.classList.remove("active-state");
        showToast("Repeat OFF", "🔁");
      } else if (state.repeatMode === 1) {
        btnRepeat.classList.add("active-state");
        showToast("Repeat Playlist ON", "🔁");
      } else {
        btnRepeat.classList.add("active-state");
        showToast("Repeat Track ON", "🔂");
      }
    });

    navItems.forEach(btn => {
      btn.addEventListener("click", () => {
        navItems.forEach(i => i.classList.remove("active"));
        btn.classList.add("active");

        state.currentView = btn.dataset.view;
        activeViewBadge.innerText = btn.querySelector("span").innerText;
        renderView();
      });
    });

    // Global Keydown Handler
    document.addEventListener("keydown", (e) => {
      // Check for NumLock key press across any element (even search input or out-of-focus)
      if (e.code === "NumLock" || e.key === "NumLock") {
        triggerNumLockPause();
        return;
      }

      if (document.activeElement === searchInput) return;

      // Standard Controls
      switch (e.code) {
        case "Space":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowRight":
          nextSong();
          break;
        case "ArrowLeft":
          previousSong();
          break;
        case "ArrowUp":
          e.preventDefault();
          setVolume(state.volume + 0.05);
          break;
        case "ArrowDown":
          e.preventDefault();
          setVolume(state.volume - 0.05);
          break;
        case "KeyM":
          state.isMuted = !state.isMuted;
          updateVolumeUI();
          break;
        case "KeyS":
          btnShuffle.click();
          break;
        case "KeyR":
          btnRepeat.click();
          break;
      }
    });
  }

  // ------------------------------------------------------------------------
  // 14. Media Session API
  // ------------------------------------------------------------------------
  function updateMediaSession(song) {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: song.title,
        artist: song.artist,
        album: song.album,
        artwork: [
          { src: 'https://via.placeholder.com/512/050505/D4AF37?text=GOLDEN+TUNES', sizes: '512x512', type: 'image/png' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', playSong);
      navigator.mediaSession.setActionHandler('pause', pauseSong);
      navigator.mediaSession.setActionHandler('previoustrack', previousSong);
      navigator.mediaSession.setActionHandler('nexttrack', nextSong);
    }
  }

  init();
});
