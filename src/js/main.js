(function () {
  // Scroll animation
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const revealElements = document.querySelectorAll(".scroll-animate");

  if (prefersReducedMotion) {
    revealElements.forEach((el) => el.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    revealElements.forEach((el) => revealObserver.observe(el));
  }

  // Contact modal
  const contactModal = document.getElementById("contact-modal");
  if (!contactModal) return;

  const modalTriggers = document.querySelectorAll("[data-contact-modal]");
  const modalCloseTargets = contactModal.querySelectorAll("[data-modal-close]");
  const FOCUSABLE =
    'a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

  let lastFocused;

  const openContactModal = () => {
    lastFocused = document.activeElement;
    contactModal.classList.add("is-visible");
    contactModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    const first = contactModal.querySelector(FOCUSABLE);
    if (first) first.focus();
  };

  const closeContactModal = () => {
    contactModal.classList.remove("is-visible");
    contactModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    if (lastFocused) lastFocused.focus();
  };

  // Focus trap
  contactModal.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;
    const focusable = [...contactModal.querySelectorAll(FOCUSABLE)];
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  modalTriggers.forEach((trigger) => {
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      openContactModal();
    });
  });

  modalCloseTargets.forEach((target) => target.addEventListener("click", closeContactModal));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && contactModal.classList.contains("is-visible")) {
      closeContactModal();
    }
  });

  // Contact form submission
  const contactForm = contactModal.querySelector(".modal-form");
  const contactSubmit = contactForm?.querySelector("button[type='submit']");

  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const payload = Object.fromEntries(new FormData(contactForm).entries());
      if (contactSubmit) {
        contactSubmit.disabled = true;
        contactSubmit.textContent = "Sending...";
      }
      try {
        const response = await fetch("https://n8n.netconn.pro/webhook/ncp-web-contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error("Request failed");
        contactForm.reset();
        closeContactModal();
      } catch (err) {
        console.error("Contact form submission failed:", err);
      } finally {
        if (contactSubmit) {
          contactSubmit.disabled = false;
          contactSubmit.textContent = "Send request";
        }
      }
    });
  }
})();
