// === Логіка для dock ===
const dock = document.querySelector('.dock');
const dockPopup = document.getElementById('dockPopup');
const dockPopupClose = document.getElementById('dockPopupClose');
const dockPopupTitle = document.getElementById('dockPopupTitle');
const dockPopupText = document.getElementById('dockPopupText');

// Функція для закриття попапа
function closeDockPopup() {
  dockPopup.style.display = 'none';
}

// === Логіка для вікон та іконок ===
document.addEventListener('DOMContentLoaded', () => {
  const icons = document.querySelectorAll('.icon');
  const windows = document.querySelectorAll('.window');
  const closeBtns = document.querySelectorAll('.window-close');
  const desktop = document.querySelector('.desktop');
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

  // Функція для відкриття вікна
  function openWindow(winId) {
    console.log('Спроба відкрити вікно з ID:', winId);
    const win = document.getElementById(winId);
    if (win) {
      console.log('Вікно знайдено:', winId);
      lazyLoadContent(win);
      win.classList.remove('closing');
      win.style.setProperty('display', 'flex', 'important'); // Важливе виправлення
      requestAnimationFrame(() => win.classList.add('open'));
    } else {
      console.error('Помилка: Вікно не знайдено з ID:', winId);
    }
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

  // Функція для перетягування вікон
  function makeDraggable(element, handle) {
    if (!handle) handle = element;
    handle.style.touchAction = 'none';
    handle.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.window-close')) {
        e.stopPropagation();
        return;
      }
      e.preventDefault();
      const rect = element.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;
      element.style.position = 'fixed';
      element.style.left = rect.left + 'px';
      element.style.top = rect.top + 'px';
      element.style.transform = '';
      element.style.zIndex = 9999;
      const onPointerMove = (ev) => {
        let newX = ev.clientX - offsetX;
        let newY = ev.clientY - offsetY;
        const maxX = window.innerWidth - element.offsetWidth;
        const maxY = window.innerHeight - element.offsetHeight;
        newX = Math.max(0, Math.min(maxX, newX));
        newY = Math.max(0, Math.min(maxY, newY));
        element.style.left = newX + 'px';
        element.style.top = newY + 'px';
      };
      const onPointerUp = () => {
        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerUp);
        element.style.zIndex = '';
      };
      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup', onPointerUp);
    });
  }

  // Ініціалізація
  placeIconsRandomly();
  window.addEventListener('resize', placeIconsRandomly);

  icons.forEach(icon => makeDraggable(icon));
  windows.forEach(win => makeDraggable(win, win.querySelector('.window-header')));
  
  // Обробник для іконок на робочому столі
  icons.forEach(icon => {
    icon.addEventListener('click', () => {
      const winId = icon.dataset.window;
      openWindow(winId);
    });
  });

  // Обробник для елементів дока
  dock.addEventListener('click', e => {
    const item = e.target.closest('.dock-item');
    if (!item) return;

    // Перевіряємо, чи має елемент атрибут data-window
    const winId = item.dataset.window;
    if (winId) {
      openWindow(winId);
      return; // Зупиняємо виконання, щоб не показувати попап
    }
      
    // Показуємо попап для всіх інших елементів дока
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


  dockPopupClose.addEventListener('click', closeDockPopup);
  document.addEventListener('click', e => {
    if (!dockPopup.contains(e.target) && !e.target.closest('.dock-item')) {
      closeDockPopup();
    }
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
