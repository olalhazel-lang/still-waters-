(() => {
  const CLASSES = [
    "Morning breath and movement (Mon & Wed, 7:30 - 8:30 · All levels)",
    "Mindful movement (Tue & Thu, 2:00 - 3:30 · Beginners)",
    "Fascia & Breath (Friday, 4:30 - 5:30 · All levels)",
    "Heat-building flow (Saturday, 6:30 - 7:30 · Beyond basics)"
  ];

  const trigger =
    document.querySelector('#first-visit a[href*="book"], a[href="#book"]') ||
    Array.from(document.querySelectorAll("a, button")).find((el) =>
      /book a free class/i.test(el.textContent || "")
    );

  if (!trigger) return;

  const style = document.createElement("style");
  style.textContent = `
    .sw-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(20, 20, 20, 0.65);
      display: none;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      z-index: 9999;
    }
    .sw-backdrop.is-open {
      display: flex;
    }
    .sw-modal {
      background: #faf7f5;
      color: #1c1b1a;
      width: 100%;
      max-width: 420px;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
      font-family: inherit;
    }
    .sw-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }
    .sw-modal h2 {
      margin: 0;
      font-size: 1.35rem;
    }
    .sw-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      line-height: 1;
      cursor: pointer;
      color: inherit;
    }
    .sw-sub {
      margin: 0 0 1.25rem;
      font-size: 0.92rem;
      opacity: 0.8;
    }
    .sw-field {
      margin-bottom: 0.9rem;
    }
    .sw-field label {
      display: block;
      font-size: 0.85rem;
      margin-bottom: 0.35rem;
      font-weight: 600;
    }
    .sw-field input,
    .sw-field select {
      width: 100%;
      padding: 0.6rem 0.75rem;
      border: 1px solid #c9c2bc;
      border-radius: 8px;
      background: #fff;
      color: #1c1b1a;
      font-size: 0.95rem;
      box-sizing: border-box;
    }
    .sw-submit {
      width: 100%;
      padding: 0.75rem 1rem;
      border: none;
      border-radius: 8px;
      background: #1c1b1a;
      color: #faf7f5;
      font-size: 0.95rem;
      cursor: pointer;
      margin-top: 0.25rem;
    }
    .sw-confirm {
      display: none;
      padding: 0.75rem 0;
    }
    .sw-confirm.is-visible {
      display: block;
    }
  `;
  document.head.appendChild(style);

  const backdrop = document.createElement("div");
  backdrop.className = "sw-backdrop";
  backdrop.setAttribute("role", "dialog");
  backdrop.setAttribute("aria-modal", "true");
  backdrop.setAttribute("aria-labelledby", "sw-modal-title");

  const optionsHtml = CLASSES.map(
    (cls) => `<option value="${cls.replace(/"/g, "&quot;")}">${cls}</option>`
  ).join("");

  backdrop.innerHTML = `
    <div class="sw-modal">
      <div class="sw-modal-header">
        <h2 id="sw-modal-title">Claim your free first class</h2>
        <button type="button" class="sw-close" aria-label="Close booking dialog">&times;</button>
      </div>
      <p class="sw-sub">Leave the mat at home. Bring water and comfortable clothes, and we’ll handle the rest.</p>

      <form class="sw-form" novalidate>
        <div class="sw-field">
          <label for="sw-name">Your name</label>
          <input id="sw-name" name="name" type="text" required placeholder="Jane Doe" />
        </div>
        <div class="sw-field">
          <label for="sw-email">Email address</label>
          <input id="sw-email" name="email" type="email" required placeholder="jane@example.com" />
        </div>
        <div class="sw-field">
          <label for="sw-class">Choose a class</label>
          <select id="sw-class" name="className">${optionsHtml}</select>
        </div>
        <button type="submit" class="sw-submit">Reserve my free class</button>
      </form>

      <div class="sw-confirm" aria-live="polite"></div>
    </div>
  `;
  document.body.appendChild(backdrop);

  const form = backdrop.querySelector(".sw-form");
  const confirmBox = backdrop.querySelector(".sw-confirm");
  const closeBtn = backdrop.querySelector(".sw-close");
  const nameInput = backdrop.querySelector("#sw-name");
  const emailInput = backdrop.querySelector("#sw-email");
  const classSelect = backdrop.querySelector("#sw-class");

  function openModal(e) {
    if (e) e.preventDefault();
    form.reset();
    confirmBox.classList.remove("is-visible");
    confirmBox.textContent = "";
    form.style.display = "block";
    backdrop.classList.add("is-open");
    nameInput.focus();
  }

  function closeModal() {
    backdrop.classList.remove("is-open");
    trigger.focus();
  }

  trigger.addEventListener("click", openModal);
  closeBtn.addEventListener("click", closeModal);

  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && backdrop.classList.contains("is-open")) {
      closeModal();
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const selectedClass = classSelect.value;

    if (!name) {
      nameInput.focus();
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      emailInput.focus();
      return;
    }

    const booking = { name, email, className: selectedClass, bookedAt: new Date().toISOString() };
    localStorage.setItem("stillwaterFirstClass", JSON.stringify(booking));

    form.style.display = "none";
    confirmBox.innerHTML = `
      <p><strong>You’re on the list, ${name}.</strong></p>
      <p>We’ve reserved your complimentary spot for <strong>${selectedClass}</strong> and noted <strong>${email}</strong>.</p>
      <button type="button" class="sw-submit sw-done">Done</button>
    `;
    confirmBox.classList.add("is-visible");
    confirmBox.querySelector(".sw-done").addEventListener("click", closeModal);
  });
})();