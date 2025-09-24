// === Логіка для dock ===
const dockItems = document.querySelectorAll('.dock-item');
const dockPopup = document.getElementById('dockPopup');
const dockPopupClose = document.getElementById('dockPopupClose');
const dockPopupTitle = document.getElementById('dockPopupTitle');
const dockPopupText = document.getElementById('dockPopupText');

// Функція для закриття попапа
function closeDockPopup() {
  dockPopup.style.display = 'none';
}

dockItems.forEach(item => {
  item.addEventListener('click', e => {
    if (item.id === 'dockGallery' || item.tagName.toLowerCase() === 'a') {
      return;
    }

    const title = item.getAttribute('data-title') || '';
    const text = item.getAttribute('data-text') || '';
    const img = item.getAttribute('data-img') || '';

    dockPopupTitle.textContent = title;
    dockPopupText.innerHTML = `<p>${text}</p>`;

    if (img) {
      dockPopupText.innerHTML += `<img src="${img}" style="width:100%;border-radius:6px;margin-top:8px;">`;
    }

    dockPopup.style.display = 'block';
  });
});

dockPopupClose.addEventListener('click', closeDockPopup);
document.addEventListener('click', e => {
  if (!dockPopup.contains(e.target) && !e.target.closest('.dock-item')) {
    closeDockPopup();
  }
});

// === Логіка для вікон та іконок ===
document.addEventListener('DOMContentLoaded', () => {
  const icons = document.querySelectorAll('.icon');
  const windows = document.querySelectorAll('.window');
  const closeBtns = document.querySelectorAll('.window-close');
  const desktop = document.querySelector('.desktop');
  const dock = document.querySelector('.dock');
  const dockGallery = document.getElementById('dockGallery');
  const photosWindow = document.getElementById('photosWindow');

  // Функція для ледачого завантаження контенту у вікні
  function lazyLoadContent(windowElement) {
    const videos = windowElement.querySelectorAll('video[data-src]');
    const images = windowElement.querySelectorAll('img[data-src]');

    videos.forEach(video => {
      if (!video.src) { // Завантажуємо тільки якщо src ще не встановлено
        video.src = video.getAttribute('data-src');
        video.load(); // Примусово завантажуємо відео
      }
    });

    images.forEach(img => {
      if (!img.src) { // Завантажуємо тільки якщо src ще не встановлено
        img.src = img.getAttribute('data-src');
      }
    });
  }

  // Функція для випадкового розташування іконок
  function placeIconsRandomly() {
    const { width, height } = desktop.getBoundingClientRect();
    const dockHeight = dock.offsetHeight + 35;
    icons.forEach(icon => {
      const x = Math.random() * (width - 70);
      const y = 40 + Math.random() * (height - 70 - dockHeight);
      icon.style.left = x + 'px';
      icon.style.top = y + 'px';
    });
  }

  placeIconsRandomly();
  window.addEventListener('resize', placeIconsRandomly);

  function makeDraggable(element, handle) {
    if (!handle) return;
    
    handle.style.touchAction = 'none';
    let isDragging = false;
    let offsetX, offsetY;
    const desktopRect = desktop.getBoundingClientRect();

    handle.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.window-close')) {
        e.stopPropagation();
        return;
      }
      e.preventDefault();
      
      isDragging = true;
      element.style.transition = 'none';
      element.style.position = 'fixed';
      
      const rect = element.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
    });

    document.addEventListener('pointermove', (e) => {
      if (!isDragging) return;

      let newX = e.clientX - offsetX;
      let newY = e.clientY - offsetY;

      // Обмеження, щоб вікно не виходило за межі робочого столу
      const maxX = desktopRect.width - element.offsetWidth;
      const maxY = desktopRect.height - element.offsetHeight;
      
      newX = Math.max(0, Math.min(maxX, newX));
      newY = Math.max(0, Math.min(maxY, newY));

      element.style.left = newX + 'px';
      element.style.top = newY + 'px';
      element.style.transform = ''; // Видаляємо transform, щоб уникнути конфлікту
    });

    document.addEventListener('pointerup', () => {
      isDragging = false;
      element.style.transition = '';
    });
  }

  windows.forEach(win => makeDraggable(win, win.querySelector('.window-header')));
  
  // Додаємо обробник подій для іконок
  icons.forEach(icon => {
    icon.addEventListener('click', () => {
      const winId = icon.dataset.window;
      const win = document.getElementById(winId);
      if (win) {
        lazyLoadContent(win); // Ледаче завантаження при кліку
        win.classList.remove('closing');
        win.style.display = 'flex';
        requestAnimationFrame(() => win.classList.add('open'));
      }
    });
  });

  // Обробник для галереї
  dockGallery.addEventListener('click', () => {
    lazyLoadContent(photosWindow); // Ледаче завантаження для галереї
    photosWindow.classList.remove('closing');
    photosWindow.style.display = 'flex';
    requestAnimationFrame(() => photosWindow.classList.add('open'));
  });

  // Обробник закриття вікон
  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const win = btn.closest('.window');
      win.classList.remove('open');
      win.classList.add('closing');
      setTimeout(() => {
        win.style.display = 'none';
        win.classList.remove('closing');
      }, 300);
    });
  });
});

