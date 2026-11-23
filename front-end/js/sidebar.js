/*verifica o tema escolhido antes de carregar a página*/
(function () {
  const tema = localStorage.getItem('hygeia-theme');
  const html = document.documentElement;

  if (tema === 'dark' || tema === 'light') {
    html.style.colorScheme = tema;
  } else {
    html.style.colorScheme =
      window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
  }

  html.classList.add('no-transition');
})();

/*sidebar funcionando*/

document.addEventListener("DOMContentLoaded", () => {
  const html = document.documentElement;
  const sidebar = document.querySelector(".sidebar");

  if (!sidebar) return;

  const navItems = document.querySelectorAll(
    ".nav-list > .nav-item"
  );

  const userRow = document.querySelector(".user-row");
  const themeToggle = document.querySelector(".theme-toggle");
  const themeBg = document.querySelector(".theme-active-bg");
  const collapseBtn = document.querySelector(".collapse-btn");

  const lightButton = themeToggle?.querySelector(
    "button:nth-of-type(1)"
  );

  const darkButton = themeToggle?.querySelector(
    "button:nth-of-type(2)"
  );

  const lightIcon = lightButton?.querySelector("img");
  const darkIcon = darkButton?.querySelector("img");

  const lightIconNormal = "../img/light-mode(sun)-icon001.png";
  const lightIconSelected = "../img/light-mode(sun)-icon001.png";
  const darkIconNormal = "../img/dark_mode(moon)-icon001.png";
  const darkIconSelected = "../img/dark_mode(moon)-icon002.png";

  const systemTheme = window.matchMedia(
    "(prefers-color-scheme: dark)"
  );

  const animationTime = 500;
  const sidebarStorageKey = "hygeia-sidebar-collapsed";
  const themeStorageKey = "hygeia-theme";

  let resizeObserver;

  /* ESTADO INICIAL DA SIDEBAR */

  const savedSidebarState = localStorage.getItem(
    sidebarStorageKey
  );

  if (savedSidebarState === "true") {
    sidebar.classList.add("collapsed");
  } else if (savedSidebarState === "false") {
    sidebar.classList.remove("collapsed");
  }

  sidebar.classList.add("no-transition");

  /* BACKGROUND ATIVO */

  function moveBackground(element) {
    if (!element) return;

    const sidebarRect = sidebar.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();

    const top =
      elementRect.top - sidebarRect.top - 2.5;

    sidebar.style.setProperty(
      "--active-top",
      `${top}px`
    );

    sidebar.style.setProperty(
      "--active-height",
      `${element.offsetHeight}px`
    );
  }

  function atualizarBackground() {
    const itemAtivo = sidebar.querySelector(
      ".nav-list > .nav-item.active"
    );

    if (itemAtivo) {
      moveBackground(itemAtivo);
    } else if (userRow?.classList.contains("active")) {
      moveBackground(userRow);
    }

    atualizarTemaSidebar();
  }

  window.addEventListener("resize", atualizarBackground);

  if (window.visualViewport) {
    window.visualViewport.addEventListener(
      "resize",
      atualizarBackground
    );
  }

  /* ÍCONES SVG EXISTENTES */

  function atualizarIcones() {
    navItems.forEach(item => {
      const iconeAtivo = item.querySelector(".icone-ativo");
      const iconeNormal = item.querySelector(".icone-normal");

      if (!iconeAtivo || !iconeNormal) return;

      const ativo = item.classList.contains("active");

      iconeAtivo.style.display = ativo ? "block" : "none";
      iconeNormal.style.display = ativo ? "none" : "block";
    });
  }

  /* POSIÇÃO DO FUNDO DO TEMA */

  function atualizarTemaSidebar(tema) {
    if (!themeToggle) return;

    const temaAtual =
      tema ||
      (localStorage.getItem(themeStorageKey) ||
        (html.style.colorScheme === "dark" ? "dark" : "light"));

    const isDark = temaAtual === "dark";
    const isCollapsed = sidebar.classList.contains("collapsed");

    themeToggle.classList.toggle("dark-active", isDark);

    if (themeBg) {
      themeBg.style.transform = "none";

      if (isCollapsed) {
        themeBg.style.left = "3px";
        themeBg.style.top = isDark ? "47px" : "3px";
      } else {
        themeBg.style.top = "3px";
        themeBg.style.left = isDark ? "50%" : "3px";
      }
    }
  }

  /* TEMA CLARO E ESCURO */

  function setTheme(theme, save = false) {
    html.style.colorScheme = theme;

    if (save) {
      localStorage.setItem(themeStorageKey, theme);
    }

    lightButton?.classList.toggle(
      "selected",
      theme === "light"
    );

    darkButton?.classList.toggle(
      "selected",
      theme === "dark"
    );

    lightButton?.setAttribute(
      "aria-pressed",
      String(theme === "light")
    );

    darkButton?.setAttribute(
      "aria-pressed",
      String(theme === "dark")
    );

    if (lightIcon && darkIcon) {
      if (theme === "light") {
        lightIcon.src = lightIconSelected;
        darkIcon.src = darkIconNormal;
      } else {
        lightIcon.src = lightIconNormal;
        darkIcon.src = darkIconSelected;
      }
    }

    atualizarTemaSidebar(theme);
    atualizarIcones();
  }

  /* NAVEGAÇÃO */

  navItems.forEach(item => {
    const link = item.querySelector("a");

    if (!link) return;

    link.addEventListener("click", event => {
      if (item.classList.contains("active")) return;

      event.preventDefault();

      const destino = link.href;

      moveBackground(item);

      navItems.forEach(nav => {
        nav.classList.remove("active");
      });

      item.classList.add("active");
      userRow?.classList.remove("active");

      atualizarIcones();

      setTimeout(() => {
        window.location.href = destino;
      }, animationTime);
    });
  });

  /* SEÇÃO DO USUÁRIO */

  if (userRow) {
    userRow.addEventListener("click", event => {
      const link = userRow.matches("a")
        ? userRow
        : userRow.querySelector("a");

      if (!link) return;

      event.preventDefault();

      const destino = link.href;

      moveBackground(userRow);

      navItems.forEach(item => {
        item.classList.remove("active");
      });

      userRow.classList.add("active");

      atualizarIcones();

      setTimeout(() => {
        window.location.href = destino;
      }, animationTime);
    });
  }

  /* BOTÕES DE TEMA */

  lightButton?.addEventListener("click", event => {
    event.stopPropagation();
    setTheme("light", true);
  });

  darkButton?.addEventListener("click", event => {
    event.stopPropagation();
    setTheme("dark", true);
  });

  /* TEMA DO SISTEMA */

  function setSystemTheme() {
    const savedTheme = localStorage.getItem(themeStorageKey);

    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
      return;
    }

    setTheme(systemTheme.matches ? "dark" : "light");
  }

  systemTheme.addEventListener("change", () => {
    const savedTheme = localStorage.getItem(themeStorageKey);

    if (savedTheme !== "light" && savedTheme !== "dark") {
      setTheme(systemTheme.matches ? "dark" : "light");
    }
  });

  /* RECOLHER E EXPANDIR SIDEBAR */

  if (collapseBtn) {
    function atualizarEstadoSidebar(salvar = false) {
      const isCollapsed = sidebar.classList.contains("collapsed");

      collapseBtn.setAttribute(
        "aria-expanded",
        String(!isCollapsed)
      );

      collapseBtn.setAttribute(
        "aria-label",
        isCollapsed ? "Expandir menu" : "Recolher menu"
      );

      if (salvar) {
        localStorage.setItem(
          sidebarStorageKey,
          String(isCollapsed)
        );
      }

      atualizarTemaSidebar();
      requestAnimationFrame(atualizarBackground);
    }

    collapseBtn.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");
      atualizarEstadoSidebar(true);
    });

    atualizarEstadoSidebar();
  }

  /* POSIÇÃO INICIAL */

  const activeItem = sidebar.querySelector(
    ".nav-list > .nav-item.active"
  );

  if (activeItem) {
    moveBackground(activeItem);
  } else if (userRow?.classList.contains("active")) {
    moveBackground(userRow);
  }

  atualizarIcones();
  setSystemTheme();

  /* LIBERA AS TRANSIÇÕES */

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      sidebar.classList.remove("no-transition");
      atualizarBackground();
    });
  });

  /* OBSERVA MUDANÇAS DE TAMANHO */

  if ("ResizeObserver" in window) {
    resizeObserver = new ResizeObserver(() => {
      atualizarBackground();
    });

    resizeObserver.observe(sidebar);
  }
});



/*painel de notificações*/

document.addEventListener("DOMContentLoaded", () => {

  const button = document.getElementById("notificationButton");
  const panel = document.getElementById("notificationPanel");

  const list = document.getElementById("notificationList");
  const dot = button.querySelector(".notification-dot");

  const tabs = document.querySelectorAll(".notification-tab");

  const allCount = document.getElementById("allCount");
  const unreadCount = document.getElementById("unreadCount");

  const filter = document.getElementById("notificationFilter");

  const markAll = document.getElementById("markAllRead");
  const clear = document.getElementById("clearNotifications");

  const empty = document.getElementById("notificationEmpty");

  let currentTab = "all";


  // ABRIR E FECHAR PAINEL

  function closePanel() {
    panel.classList.remove("active");

    panel.setAttribute("aria-hidden", "true");

    button.setAttribute("aria-expanded", "false");
  }

  function togglePanel() {
    const isOpen = panel.classList.toggle("active");

    panel.setAttribute("aria-hidden", String(!isOpen));

    button.setAttribute("aria-expanded", String(isOpen));
  }

  button.addEventListener("click", (event) => {
    event.stopPropagation();
    togglePanel();
  });


  // FECHAR AO CLICAR FORA

  document.addEventListener("click", (event) => {

    if (
      !panel.contains(event.target) &&
      !button.contains(event.target)
    ) {
      closePanel();
    }

  });


  // FECHAR COM ESC

  document.addEventListener("keydown", (event) => {

    if (event.key === "Escape") {
      closePanel();
    }

  });


  // OBTER NOTIFICAÇÕES

  function getNotifications() {
    return [...list.querySelectorAll(".notification-item")];
  }


  // ATUALIZAR CONTADORES

  function updateCounts() {

    const notifications = getNotifications();

    const unread = notifications.filter(item => {
      return item.dataset.read === "false";
    });

    allCount.textContent = notifications.length;

    unreadCount.textContent = unread.length;

    // Indicador do sino

    dot.style.display = unread.length > 0
      ? "block"
      : "none";

  }


  // FILTRAR E EXIBIR NOTIFICAÇÕES

  function renderNotifications() {

    const notifications = getNotifications();

    const selectedCategory = filter.value;

    let visibleCount = 0;

    notifications.forEach(item => {

      const isUnread = item.dataset.read === "false";

      const matchesTab =
        currentTab === "all" || isUnread;

      const matchesCategory =
        selectedCategory === "all" ||
        item.dataset.category === selectedCategory;

      const shouldShow = matchesTab && matchesCategory;

      item.hidden = !shouldShow;

      if (shouldShow) {
        visibleCount++;
      }

    });

    // Mensagem quando não existem resultados

    empty.hidden = visibleCount > 0;

    updateCounts();

  }


  // TROCAR ABAS

  tabs.forEach(tab => {

    tab.addEventListener("click", () => {

      currentTab = tab.dataset.tab;

      tabs.forEach(item => {

        const isActive = item === tab;

        item.classList.toggle("active", isActive);

        item.setAttribute(
          "aria-selected",
          String(isActive)
        );

      });

      renderNotifications();

    });

  });


  // FILTRO POR CATEGORIA

  filter.addEventListener("change", () => {
    renderNotifications();
  });


  // MARCAR UMA NOTIFICAÇÃO COMO LIDA

  list.addEventListener("click", (event) => {

    const item = event.target.closest(".notification-item");

    if (!item || item.dataset.read === "true") return;

    item.dataset.read = "true";

    item.classList.remove("unread");

    const indicator = item.querySelector(".unread-indicator");

    if (indicator) {
      indicator.remove();
    }

    renderNotifications();

  });


  // MARCAR TODAS COMO LIDAS

  markAll.addEventListener("click", () => {

    getNotifications().forEach(item => {

      item.dataset.read = "true";

      item.classList.remove("unread");

      const indicator = item.querySelector(".unread-indicator");

      if (indicator) {
        indicator.remove();
      }

    });

    renderNotifications();

  });


  // LIMPAR TODAS AS NOTIFICAÇÕES

  clear.addEventListener("click", () => {

    list.innerHTML = "";

    renderNotifications();

  });


  // INICIALIZAÇÃO

  renderNotifications();

});
