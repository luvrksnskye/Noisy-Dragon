document.addEventListener('DOMContentLoaded', function() {
  // Playlist data
  const playlist = [
    {
      title: "Why We Lose (feat. Coleman Trapp)",
      artist: "NCS",
      src: "assets/music/Cartoon, Jéja - Why We Lose.mp3",
    },
    {
      title: "MAYDAY",
      artist: "TheFatRat",
      src: "assets/music/MAYDAY.mp3",
    },
    {
      title: "The Throes of Winter",
      artist: "Ghost Data",
      src: "assets/music/GHOST_DATA.mp3",
    },
    {
      title: "Heart Shaped Box",
      artist: "Neovaii",
      src: "assets/music/Neovaii - Heart Shaped Box.mp3",
    }
  ];

// DOM elements
const playerContainer = document.querySelector('.music-player-container');
const player = document.querySelector('.music-player');
const showPlayerBtn = document.getElementById('show-player');
const minimizePlayerBtn = document.getElementById('minimize-player');
const playlistElement = document.getElementById('playlist');
const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const shuffleBtn = document.getElementById('shuffle-btn');
const loopBtn = document.getElementById('loop-btn');
const progressBar = document.querySelector('.progress');
const progressContainer = document.querySelector('.progress-bar');
const currentTimeEl = document.querySelector('.current-time');
const totalTimeEl = document.querySelector('.total-time');
const trackTitleEl = document.getElementById('track-title');
const volumeSlider = document.getElementById('volume-slider');

// Audio setup
const audio = new Audio();
audio.volume = volumeSlider.value;

// Visualizer setup
const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');
let audioContext, analyser, source, dataArray;

// Player state
let currentTrackIndex = 0;
let isPlaying = false;
let isShuffled = false;
let isLooping = false;
let animationId;

// Responsive canvas resize
function resizeCanvas() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Setup audio context and analyser
function setupAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    source = audioContext.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
  }
}

// Initialize player
function initPlayer() {
  // Generate playlist items
  playlist.forEach((track, index) => {
    const li = document.createElement('li');
    li.className = 'playlist-item';
    li.innerHTML = `
      <div class="track-info">
        <span class="track-title">${track.title}</span>
        <span class="track-artist">${track.artist}</span>
      </div>
    `;
    li.addEventListener('click', () => {
      currentTrackIndex = index;
      loadTrack(currentTrackIndex);
      playTrack();
    });
    playlistElement.appendChild(li);
  });
  
  // Initial track load
  loadTrack(currentTrackIndex);
  updatePlaylistActiveState();
}

// Load track
function loadTrack(index) {
  if (index < 0) index = playlist.length - 1;
  if (index >= playlist.length) index = 0;
  
  currentTrackIndex = index;
  const track = playlist[currentTrackIndex];
  
  audio.src = track.src;
  trackTitleEl.textContent = `${track.title} - ${track.artist}`;
  
  // Update active track in playlist
  updatePlaylistActiveState();
  
  // Reset progress bar
  progressBar.style.width = '0%';
  
  // Visualizer color update
  document.documentElement.style.setProperty('--visualizer-color', track.color);
}

function updatePlaylistActiveState() {
  const items = playlistElement.querySelectorAll('.playlist-item');
  items.forEach((item, index) => {
    if (index === currentTrackIndex) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

// Play/Pause
function playTrack() {
  setupAudioContext();
  audio.play();
  playBtn.innerHTML = '<i class="fas fa-pause"></i>';
  isPlaying = true;
  visualize();
}

function pauseTrack() {
  audio.pause();
  playBtn.innerHTML = '<i class="fas fa-play"></i>';
  isPlaying = false;
  cancelAnimationFrame(animationId);
}

// Previous track
function prevTrack() {
  currentTrackIndex--;
  loadTrack(currentTrackIndex);
  if (isPlaying) playTrack();
}

// Next track
function nextTrack() {
  currentTrackIndex++;
  loadTrack(currentTrackIndex);
  if (isPlaying) playTrack();
}

// Toggle shuffle
function toggleShuffle() {
  isShuffled = !isShuffled;
  shuffleBtn.classList.toggle('active', isShuffled);
}

// Toggle loop
function toggleLoop() {
  isLooping = !isLooping;
  loopBtn.classList.toggle('active', isLooping);
  audio.loop = isLooping;
}

// Update progress bar
function updateProgress(e) {
  const { duration, currentTime } = e.target;
  if (duration) {
    // Update progress bar
    const progressPercent = (currentTime / duration) * 100;
    progressBar.style.width = `${progressPercent}%`;
    
    // Update time displays
    currentTimeEl.textContent = formatTime(currentTime);
    totalTimeEl.textContent = formatTime(duration);
  }
}

// Format time to MM:SS
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Set progress bar on click
function setProgress(e) {
  const width = this.clientWidth;
  const clickX = e.offsetX;
  const duration = audio.duration;
  audio.currentTime = (clickX / width) * duration;
}

// Draw visualizer
function visualize() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  analyser.getByteFrequencyData(dataArray);
  
  // Calculate bar width and spacing
  const bufferLength = analyser.frequencyBinCount;
  const barWidth = (canvas.width / bufferLength) * 2.5;
  const centerY = canvas.height / 2;

  const colors = [
    "#FF5733", "#FF8D1A", "#FFC300", "#DAF7A6", "#33FF57", "#33FFF5",
    "#1A8DFF", "#5733FF", "#A633FF", "#FF33A8", "#FF3366"
  ];

  for (let i = 0; i < bufferLength; i++) {
    const barHeight = (dataArray[i] / 255) * (canvas.height * 0.65);
    const colorIndex = Math.floor((i / bufferLength) * colors.length);
    ctx.fillStyle = colors[(colorIndex + Math.floor(Date.now() / 100)) % colors.length];
    ctx.fillRect(i * barWidth, centerY - barHeight / 2, barWidth - 1, barHeight);
    ctx.shadowBlur = 20;
    ctx.shadowColor = ctx.fillStyle;
  }

  animationId = requestAnimationFrame(visualize);
}

// Minimize/Maximize player
function togglePlayer() {
  player.classList.toggle('minimized');
  
  if (player.classList.contains('minimized')) {
    showPlayerBtn.style.display = 'flex';
  } else {
    showPlayerBtn.style.display = 'none';
  }
}

// Event listeners
playBtn.addEventListener('click', () => {
  if (isPlaying) {
    pauseTrack();
  } else {
    playTrack();
  }
});

prevBtn.addEventListener('click', prevTrack);
nextBtn.addEventListener('click', nextTrack);
shuffleBtn.addEventListener('click', toggleShuffle);
loopBtn.addEventListener('click', toggleLoop);

progressContainer.addEventListener('click', setProgress);

audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('ended', () => {
  if (isLooping) {
    playTrack();
  } else if (isShuffled) {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * playlist.length);
    } while (randomIndex === currentTrackIndex && playlist.length > 1);
    
    currentTrackIndex = randomIndex;
    loadTrack(currentTrackIndex);
    playTrack();
  } else {
    nextTrack();
  }
});

volumeSlider.addEventListener('input', () => {
  audio.volume = volumeSlider.value;
});

minimizePlayerBtn.addEventListener('click', togglePlayer);
showPlayerBtn.addEventListener('click', togglePlayer);

// Initialize the player
initPlayer();
});
