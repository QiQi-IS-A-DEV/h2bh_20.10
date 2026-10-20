document.addEventListener("DOMContentLoaded", function () {
  // --- ELEMENTS ---
  const welcomeStage = document.getElementById("stage-welcome");
  const flowerStage = document.getElementById("stage-flower");
  const cardStage = document.getElementById("stage-card");
  const btnOpen = document.getElementById("btnOpen");
  const btnRefuse = document.getElementById("btnRefuse");
  const giftBox = document.getElementById("giftBox");
  const teaseToast = document.getElementById("teaseToast");
  const musicBtn = document.getElementById("musicBtn");
  const bgMusic = document.getElementById("bgMusic");
  const btnToggleView = document.getElementById("btnToggleView");
  const btnReopenCard = document.getElementById("btnReopenCard");
  const btnCheer = document.getElementById("btnCheer");
  const polaroidCard = document.getElementById("polaroidCard");
  const lightbox = document.getElementById("lightbox");
  const lightboxClose = document.getElementById("lightboxClose");
  const lightboxImg = document.getElementById("lightboxImg");
  const clubPhoto = document.getElementById("clubPhoto");

  // --- AUDIO SYNTHESIZER FALLBACK (Web Audio API) ---
  let audioCtx = null;
  let synthInterval = null;
  let isPlaying = false;

  function initWebAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
  }

  // Soft romantic chime chords: Cmaj9, Fmaj7, Gsus4, Am7
  const chords = [
    [261.63, 329.63, 392.0, 493.88], // C, E, G, B
    [349.23, 440.0, 523.25, 659.25], // F, A, C, E
    [220.0, 261.63, 329.63, 392.0],  // A, C, E, G
    [392.0, 493.88, 587.33, 659.25]  // G, B, D, E
  ];

  function playTone(freq, time, duration = 1.2) {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.exponentialRampToValueAtTime(0.08, time + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(time);
    osc.stop(time + duration);
  }

  function startSynthMelody() {
    if (synthInterval) clearInterval(synthInterval);
    let chordIdx = 0;
    function playChord() {
      if (!isPlaying || !audioCtx) return;
      const now = audioCtx.currentTime;
      const currentChord = chords[chordIdx % chords.length];
      currentChord.forEach((note, i) => {
        playTone(note, now + i * 0.28, 1.8);
      });
      chordIdx++;
    }
    playChord();
    synthInterval = setInterval(playChord, 2200);
  }

  function startMusic() {
    isPlaying = true;
    musicBtn.classList.add("playing");

    if (bgMusic) {
      if (!bgMusic.getAttribute("src") && bgMusic.querySelector("source")) {
        bgMusic.src = bgMusic.querySelector("source").getAttribute("src");
      }
      const playPromise = bgMusic.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            if (synthInterval) clearInterval(synthInterval);
          })
          .catch((err) => {
            console.warn("mp3 playback failed:", err);
            initWebAudio();
            startSynthMelody();
          });
      }
    } else {
      initWebAudio();
      startSynthMelody();
    }
  }

  function toggleMusic() {
    if (isPlaying) {
      isPlaying = false;
      musicBtn.classList.remove("playing");
      if (bgMusic) bgMusic.pause();
      if (synthInterval) clearInterval(synthInterval);
    } else {
      startMusic();
    }
  }

  musicBtn.addEventListener("click", toggleMusic);

  // --- SAKURA PETALS CANVAS ---
  const canvas = document.getElementById("sakuraCanvas");
  const ctx = canvas.getContext("2d");
  let petals = [];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  class Petal {
    constructor() {
      this.reset(true);
    }
    reset(initial = false) {
      this.x = Math.random() * canvas.width;
      this.y = initial ? Math.random() * canvas.height : -20;
      this.size = Math.random() * 8 + 6;
      this.speedX = Math.random() * 1.5 - 0.5;
      this.speedY = Math.random() * 1.2 + 0.8;
      this.angle = Math.random() * Math.PI * 2;
      this.angleSpeed = (Math.random() - 0.5) * 0.03;
      this.color = Math.random() > 0.4 ? "rgba(255, 182, 193, 0.75)" : "rgba(255, 214, 224, 0.65)";
    }
    update() {
      this.x += this.speedX + Math.sin(this.angle) * 0.5;
      this.y += this.speedY;
      this.angle += this.angleSpeed;
      if (this.y > canvas.height + 20 || this.x < -20 || this.x > canvas.width + 20) {
        this.reset();
      }
    }
    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, this.size, this.size * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < 35; i++) {
    petals.push(new Petal());
  }

  function animatePetals() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    petals.forEach((petal) => {
      petal.update();
      petal.draw();
    });
    requestAnimationFrame(animatePetals);
  }
  animatePetals();

  // --- FLOATING HEARTS BURST ---
  function burstHearts(e) {
    let originX = window.innerWidth / 2;
    let originY = window.innerHeight / 2;
    if (e) {
      if (typeof e.clientX === "number" && !isNaN(e.clientX)) {
        originX = e.clientX;
        originY = e.clientY;
      } else if (e.touches && e.touches.length > 0 && typeof e.touches[0].clientX === "number") {
        originX = e.touches[0].clientX;
        originY = e.touches[0].clientY;
      } else if (e.changedTouches && e.changedTouches.length > 0 && typeof e.changedTouches[0].clientX === "number") {
        originX = e.changedTouches[0].clientX;
        originY = e.changedTouches[0].clientY;
      }
    }
    const icons = ["🌸", "💖", "✨", "💐", "🌷", "💕"];

    for (let i = 0; i < 15; i++) {
      const heart = document.createElement("div");
      heart.className = "heart-particle";
      heart.innerText = icons[Math.floor(Math.random() * icons.length)];
      heart.style.left = originX + (Math.random() - 0.5) * 80 + "px";
      heart.style.top = originY + (Math.random() - 0.5) * 80 + "px";
      heart.style.fontSize = Math.floor(Math.random() * 16 + 18) + "px";
      document.body.appendChild(heart);

      setTimeout(() => {
        heart.remove();
      }, 2500);
    }
  }

  // --- INTERACTION: OPEN GIFT ---
  let hasOpened = false;
  function openGift(e) {
    if (hasOpened) return;
    hasOpened = true;

    try {
      burstHearts(e);
    } catch (err) {
      console.warn(err);
    }

    try {
      startMusic();
    } catch (err) {
      console.warn(err);
    }

    // Fade out Welcome stage
    welcomeStage.classList.add("fade-out");
    setTimeout(() => {
      welcomeStage.style.display = "none";
    }, 800);

    // Activate flower stage and start blossom animation
    flowerStage.classList.add("active");
    document.body.classList.remove("not-loaded");

    // After flowers bloom (4.2s), show the tribute card
    setTimeout(() => {
      cardStage.classList.add("show");
    }, 4200);
  }

  btnOpen.addEventListener("click", openGift);
  giftBox.addEventListener("click", openGift);

  // --- INTERACTION: REFUSE / TEASING ---
  const teaseMessages = [
    "Ủa kì dạ, CLB chuẩn bị bất ngờ lắm ó! Bấm nhận quà đi mà 🥺",
    "Đừng bấm vào đây nữa nè, bấm nút 'Nhận Chuyến Bay 20/10' bên cạnh cơ! 👉👈",
    "Bóng hồng H2BH mà khó tính vậy sao ta? Bấm nhận quà đi nàooo ✨",
    "Hôm nay 20/10 là ngày của bạn mà, hổng nhận là hối hận ráng chịu nha! 😜",
    "Năn nỉ luôn đó, chuyến bay 20/10 cùng đại gia đình H2BH đang chờ bạn á! ✈️🌸"
  ];
  let teaseIndex = 0;
  let teaseTimer = null;

  function showTease(e) {
    if (e && e.preventDefault) e.preventDefault();
    teaseToast.innerText = teaseMessages[teaseIndex % teaseMessages.length];
    teaseToast.classList.add("show");
    teaseIndex++;

    // Shake animation
    btnRefuse.style.transform = "translateX(8px)";
    setTimeout(() => {
      btnRefuse.style.transform = "translateX(-8px)";
      setTimeout(() => {
        btnRefuse.style.transform = "translateX(0)";
      }, 100);
    }, 100);

    if (teaseTimer) clearTimeout(teaseTimer);
    teaseTimer = setTimeout(() => {
      teaseToast.classList.remove("show");
    }, 3400);
  }

  btnRefuse.addEventListener("click", showTease);

  // --- CARD CONTROLS ---
  // Hide card to view flowers
  btnToggleView.addEventListener("click", function () {
    cardStage.classList.remove("show");
    btnReopenCard.classList.add("visible");
  });

  // Re-open card
  btnReopenCard.addEventListener("click", function () {
    cardStage.classList.add("show");
    btnReopenCard.classList.remove("visible");
  });

  // Cheer button
  btnCheer.addEventListener("click", function (e) {
    burstHearts(e);
    btnCheer.innerText = "Đã gửi yêu thương! 🥰";
    setTimeout(() => {
      btnCheer.innerHTML = "💖 Gửi lời yêu thương";
    }, 3000);
  });

  // --- LIGHTBOX PREVIEW ---
  polaroidCard.addEventListener("click", function () {
    lightboxImg.src = clubPhoto.src;
    lightbox.classList.add("active");
  });

  lightboxClose.addEventListener("click", function () {
    lightbox.classList.remove("active");
  });

  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) {
      lightbox.classList.remove("active");
    }
  });

  // --- WELCOME ENTRANCE SPARKLE ---
  setTimeout(() => {
    if (giftBox && welcomeStage.style.display !== "none") {
      const rect = giftBox.getBoundingClientRect();
      burstHearts({
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2
      });
    }
  }, 1100);
});
