document.addEventListener("DOMContentLoaded", () => {
  const sliderViewport = document.querySelector(".slider-viewport");
  const sliderTrack = document.querySelector(".slider-track");
  const cards = Array.from(document.querySelectorAll(".slider-card"));
  const categoryChips = Array.from(
    document.querySelectorAll("[data-category-chip]")
  );

  const scrubberTrack = document.querySelector(".scrubber-track");
  const scrubberHandle = document.querySelector(".scrubber-handle");

  if (!sliderViewport || !sliderTrack || !cards.length) return;

  // ---------- DRAG TO SCROLL (cards & viewport) ----------
  initDragScroll(sliderViewport);

  // ---------- CATEGORY NAV (safe no-op if no chips) ----------
  initCategoryNav(sliderViewport, cards, categoryChips);

  // ---------- SCRUBBER ----------
  initScrubber(sliderViewport, scrubberTrack, scrubberHandle);

  // ---------- ACTIVE CATEGORY ON SCROLL (safe no-op if no chips) ----------
  initActiveCategoryDetection(sliderViewport, cards, categoryChips);

  // ---------- CLICKABLE CARDS (OPEN LIVE SITES) ----------
  initCardClickNavigation(cards);
});

/**
 * DRAG-TO-SCROLL
 * Implements mouse & touch drag to scroll the slider viewport horizontally.
 * Extra guards to avoid "stuck" dragging.
 */
function initDragScroll(viewport) {
  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;

  const endDrag = () => {
    isDown = false;
    viewport.classList.remove("is-dragging");
  };

  const onMouseDown = (e) => {
    if (e.button !== 0) return; // left-click only
    isDown = true;
    viewport.classList.add("is-dragging");
    startX = e.pageX - viewport.offsetLeft;
    scrollLeft = viewport.scrollLeft;
  };

  const onMouseMove = (e) => {
    if (!isDown) return;
    if (e.buttons === 0) {
      endDrag();
      return;
    }
    e.preventDefault();
    const x = e.pageX - viewport.offsetLeft;
    const walk = (x - startX) * 1.1; // scroll speed factor
    viewport.scrollLeft = scrollLeft - walk;
  };

  viewport.addEventListener("mousedown", onMouseDown);
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", endDrag);
  viewport.addEventListener("mouseleave", endDrag);
  window.addEventListener("blur", endDrag);

  // Touch support
  viewport.addEventListener(
    "touchstart",
    (e) => {
      isDown = true;
      viewport.classList.add("is-dragging");
      startX = e.touches[0].pageX - viewport.offsetLeft;
      scrollLeft = viewport.scrollLeft;
    },
    { passive: true }
  );

  viewport.addEventListener(
    "touchmove",
    (e) => {
      if (!isDown) return;
      const x = e.touches[0].pageX - viewport.offsetLeft;
      const walk = (x - startX) * 1.1;
      viewport.scrollLeft = scrollLeft - walk;
    },
    { passive: true }
  );

  window.addEventListener(
    "touchend",
    () => {
      endDrag();
    },
    { passive: true }
  );
}

/**
 * CATEGORY NAVIGATION
 * Clicking a chip scrolls to the first card in that category and updates active state.
 * Will simply return if there are no chips (our current layout).
 */
function initCategoryNav(viewport, cards, chips) {
  if (!chips || !chips.length) return;

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const category = chip.getAttribute("data-category-chip");
      if (!category) return;

      const targetCard = cards.find(
        (card) => card.dataset.category === category
      );
      if (!targetCard) return;

      scrollCardToCenter(viewport, targetCard);
      setActiveChip(chips, category);
    });
  });
}

/**
 * Scroll one card so it is centered in the viewport.
 */
function scrollCardToCenter(viewport, card) {
  const cardRect = card.getBoundingClientRect();
  const viewportRect = viewport.getBoundingClientRect();

  const cardCenter =
    cardRect.left - viewportRect.left + cardRect.width / 2 + viewport.scrollLeft;
  const viewportCenter = viewport.scrollLeft + viewportRect.width / 2;

  const delta = cardCenter - viewportCenter;

  viewport.scrollTo({
    left: viewport.scrollLeft + delta,
    behavior: "smooth",
  });
}

/**
 * ACTIVE CATEGORY DETECTION
 * While the slider scrolls, detect which card is closest to the center
 * and update the active category chip accordingly.
 * No-ops if there are no chips.
 */
function initActiveCategoryDetection(viewport, cards, chips) {
  if (!chips || !chips.length) return;

  let scrollRaf = null;

  const handleScroll = () => {
    if (scrollRaf) return;
    scrollRaf = requestAnimationFrame(() => {
      scrollRaf = null;
      const activeCard = getCardClosestToCenter(viewport, cards);
      if (!activeCard) return;
      const category = activeCard.dataset.category;
      setActiveChip(chips, category);
    });
  };

  viewport.addEventListener("scroll", handleScroll);
}

/**
 * Returns the card element closest to horizontal center of the viewport.
 */
function getCardClosestToCenter(viewport, cards) {
  const viewportRect = viewport.getBoundingClientRect();
  const viewportCenterX = viewportRect.left + viewportRect.width / 2;

  let closestCard = null;
  let smallestDistance = Infinity;

  cards.forEach((card) => {
    const rect = card.getBoundingClientRect();
    const cardCenterX = rect.left + rect.width / 2;
    const distance = Math.abs(cardCenterX - viewportCenterX);
    if (distance < smallestDistance) {
      smallestDistance = distance;
      closestCard = card;
    }
  });

  return closestCard;
}

/**
 * Updates chip active state based on category.
 */
function setActiveChip(chips, category) {
  if (!chips || !chips.length || !category) return;

  chips.forEach((chip) => {
    const chipCategory = chip.getAttribute("data-category-chip");
    chip.classList.toggle("is-active", chipCategory === category);
  });
}

/**
 * SCRUBBER HANDLE & SCROLL SYNCHRONIZATION
 *
 * - Dragging the round handle updates the slider scrollLeft (scrubbing).
 * - Scrolling the slider updates the handle position and rotation.
 *
 * Uses an internal handlePos state instead of reading from CSS matrix
 * to avoid desync bugs.
 */
function initScrubber(viewport, track, handle) {
  if (!track || !handle) return;

  let isDragging = false;
  let handleStartX = 0;
  let handleInitialOffset = 0;
  let handlePos = 0; // current translateX in px

  const getBounds = () => {
    const trackRect = track.getBoundingClientRect();
    const handleRect = handle.getBoundingClientRect();
    const minX = 0;
    const maxX = trackRect.width - handleRect.width;
    return { minX, maxX, trackRect, handleRect };
  };

  /**
   * Given scrollLeft, sync handle position and rotation.
   */
  const syncHandleToScroll = () => {
    const maxScroll = viewport.scrollWidth - viewport.clientWidth;
    const { maxX } = getBounds();

    if (maxScroll <= 0 || maxX <= 0) {
      handlePos = 0;
      handle.style.transform = `translateX(0px) rotate(0deg)`;
      return;
    }

    const progress = viewport.scrollLeft / maxScroll;
    handlePos = progress * maxX;
    const rotation = progress * 360;

    handle.style.transform = `translateX(${handlePos}px) rotate(${rotation}deg)`;
  };

  // Initial sync
  syncHandleToScroll();

  // When scrolling, keep handle synced (throttled with rAF)
  let scrollRaf = null;
  const onScroll = () => {
    if (isDragging) return; // avoid fight between scroll & drag
    if (scrollRaf) return;
    scrollRaf = requestAnimationFrame(() => {
      scrollRaf = null;
      syncHandleToScroll();
    });
  };
  viewport.addEventListener("scroll", onScroll);

  /**
   * When dragging the handle, update scrollLeft proportionally.
   */
  const startDrag = (clientX) => {
    isDragging = true;
    handle.classList.add("is-dragging");
    handleStartX = clientX;
    handleInitialOffset = handlePos;
  };

  const continueDrag = (clientX) => {
    if (!isDragging) return;

    const { minX, maxX } = getBounds();
    const delta = clientX - handleStartX;
    let newX = handleInitialOffset + delta;
    newX = Math.max(minX, Math.min(maxX, newX));
    handlePos = newX;

    const maxScroll = viewport.scrollWidth - viewport.clientWidth;
    const progress = maxX === 0 ? 0 : handlePos / maxX;
    viewport.scrollLeft = maxScroll * progress;

    const rotation = progress * 360;
    handle.style.transform = `translateX(${handlePos}px) rotate(${rotation}deg)`;
  };

  const endDrag = () => {
    if (!isDragging) return;
    isDragging = false;
    handle.classList.remove("is-dragging");
  };

  // Mouse events
  handle.addEventListener("mousedown", (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    startDrag(e.clientX);
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    e.preventDefault();
    continueDrag(e.clientX);
  });

  window.addEventListener("mouseup", () => {
    endDrag();
  });

  // Touch events
  handle.addEventListener(
    "touchstart",
    (e) => {
      const touch = e.touches[0];
      startDrag(touch.clientX);
    },
    { passive: true }
  );

  window.addEventListener(
    "touchmove",
    (e) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      continueDrag(touch.clientX);
    },
    { passive: true }
  );

  window.addEventListener(
    "touchend",
    () => {
      endDrag();
    },
    { passive: true }
  );

  // Re-sync on resize.
  window.addEventListener("resize", () => {
    syncHandleToScroll();
  });
}


function initCardClickNavigation(cards) {
  const DRAG_THRESHOLD = 6;

  cards.forEach((card) => {
    let isPointerDown = false;
    let startX = 0;
    let startY = 0;

    // Mouse
    card.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;
      isPointerDown = true;
      startX = e.clientX;
      startY = e.clientY;
    });

    window.addEventListener("mouseup", (e) => {
      if (!isPointerDown) return;
      isPointerDown = false;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const dist = Math.hypot(dx, dy);

      if (dist < DRAG_THRESHOLD) {
        const url = card.dataset.url;
        if (url) {
          window.open(url, "_blank", "noopener,noreferrer");
        }
      }
    });

    // Touch
    card.addEventListener(
      "touchstart",
      (e) => {
        const touch = e.touches[0];
        isPointerDown = true;
        startX = touch.clientX;
        startY = touch.clientY;
      },
      { passive: true }
    );

    window.addEventListener(
      "touchend",
      (e) => {
        if (!isPointerDown) return;
        isPointerDown = false;
        const touch = e.changedTouches[0];
        const dx = touch.clientX - startX;
        const dy = touch.clientY - startY;
        const dist = Math.hypot(dx, dy);

        if (dist < DRAG_THRESHOLD) {
          const url = card.dataset.url;
          if (url) {
            window.open(url, "_blank", "noopener,noreferrer");
          }
        }
      },
      { passive: true }
    );
  });
}
