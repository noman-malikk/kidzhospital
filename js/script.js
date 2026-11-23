const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const revealItems = document.querySelectorAll(".reveal");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const updateHeaderState = () => {
  if (!header) {
    return;
  }

  header.classList.toggle("is-scrolled", window.scrollY > 12);
};

const closeNav = () => {
  if (!siteNav || !navToggle) {
    return;
  }

  siteNav.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
};

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeNav);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 980) {
      closeNav();
    }
  });
}

window.addEventListener("scroll", updateHeaderState, { passive: true });
updateHeaderState();

if (!reducedMotion && "IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -40px 0px",
    },
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

document.querySelectorAll(".faq-list").forEach((list) => {
  const items = list.querySelectorAll(".faq-item");

  items.forEach((item) => {
    const button = item.querySelector(".faq-question");

    if (!button) {
      return;
    }

    button.addEventListener("click", () => {
      const shouldOpen = !item.classList.contains("is-open");

      items.forEach((otherItem) => {
        const otherButton = otherItem.querySelector(".faq-question");
        otherItem.classList.remove("is-open");
        if (otherButton) {
          otherButton.setAttribute("aria-expanded", "false");
        }
      });

      if (shouldOpen) {
        item.classList.add("is-open");
        button.setAttribute("aria-expanded", "true");
      }
    });
  });
});

document.querySelectorAll(".js-year").forEach((node) => {
  node.textContent = String(new Date().getFullYear());
});

const appointmentForm = document.querySelector("[data-appointment-form]");

if (appointmentForm) {
  appointmentForm.setAttribute("novalidate", "novalidate");

  const statusBox = appointmentForm.querySelector(".form-status");
  const submitButton = appointmentForm.querySelector('button[type="submit"]');
  const dateField = appointmentForm.querySelector('input[name="preferred_date"]');
  const phonePattern = /^\+?[0-9\s()-]{7,20}$/;

  if (dateField) {
    const now = new Date();
    const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .split("T")[0];
    dateField.min = localDate;
  }

  const fields = Array.from(
    appointmentForm.querySelectorAll("input, select, textarea"),
  ).filter((field) => field.name);

  const clearStatus = () => {
    if (!statusBox) {
      return;
    }

    statusBox.className = "form-status";
    statusBox.textContent = "";
  };

  const showStatus = (type, message) => {
    if (!statusBox) {
      return;
    }

    statusBox.className = `form-status is-visible is-${type}`;
    statusBox.textContent = message;
  };

  const setFieldError = (field, message) => {
    const wrapper = field.closest(".form-field");
    const errorNode = wrapper ? wrapper.querySelector(".field-error") : null;

    field.setAttribute("aria-invalid", message ? "true" : "false");

    if (wrapper) {
      wrapper.classList.toggle("is-invalid", Boolean(message));
    }

    if (errorNode) {
      errorNode.textContent = message || "";
    }
  };

  const validateField = (field) => {
    const value = field.value.trim();

    switch (field.name) {
      case "child_name":
        if (value.length < 2) {
          return "Please enter the child's full name.";
        }
        break;
      case "guardian_name":
        if (value.length < 2) {
          return "Please enter the parent or guardian name.";
        }
        break;
      case "email":
        if (!value) {
          return "Please enter an email address.";
        }
        if (!field.checkValidity()) {
          return "Please enter a valid email address.";
        }
        break;
      case "phone":
        if (!value) {
          return "Please enter a phone number.";
        }
        if (!phonePattern.test(value)) {
          return "Please enter a valid phone number.";
        }
        break;
      case "preferred_date":
        if (!value) {
          return "Please choose a preferred date.";
        }
        if (field.min && value < field.min) {
          return "Please choose a future date.";
        }
        break;
      case "preferred_time":
        if (!value) {
          return "Please choose a preferred time.";
        }
        break;
      case "department":
        if (!value) {
          return "Please select a department or facility.";
        }
        break;
      case "message":
        if (value.length < 10) {
          return "Please add a short note so the team can prepare.";
        }
        break;
      default:
        break;
    }

    return "";
  };

  fields.forEach((field) => {
    field.addEventListener("blur", () => {
      setFieldError(field, validateField(field));
    });

    field.addEventListener("input", () => {
      if (field.getAttribute("aria-invalid") === "true") {
        setFieldError(field, validateField(field));
      }
    });
  });

  appointmentForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearStatus();

    let firstInvalidField = null;

    fields.forEach((field) => {
      const message = validateField(field);
      setFieldError(field, message);

      if (message && !firstInvalidField) {
        firstInvalidField = field;
      }
    });

    if (firstInvalidField) {
      firstInvalidField.focus();
      showStatus("error", "Please correct the highlighted fields and try again.");
      return;
    }

    const endpoint = appointmentForm.action || "";
    if (!endpoint) {
      showStatus(
        "error",
        "The appointment form is not configured right now. Please call or WhatsApp 03088091000.",
      );
      return;
    }

    if (!submitButton) {
      return;
    }

    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = "Sending request...";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: new FormData(appointmentForm),
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        let message =
          "Unable to send the appointment request right now. Please call or WhatsApp 03088091000.";
        try {
          const payload = await response.json();
          if (payload?.errors?.[0]?.message) {
            message = payload.errors[0].message;
          }
        } catch (error) {
          // Ignore JSON parsing failures and keep the default message.
        }
        throw new Error(message);
      }

      appointmentForm.reset();
      fields.forEach((field) => setFieldError(field, ""));
      showStatus(
        "success",
        "Appointment request sent. The Kidz Hospital team will contact you using the details you provided.",
      );
    } catch (error) {
      showStatus(
        "error",
        error instanceof Error
          ? error.message
          : "Unable to send the appointment request right now. Please call or WhatsApp 03088091000.",
      );
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  });
}

// Show the 24/7 emergency announcement once per visitor/browser.
// The notice is created here so existing HTML pages do not need changing.
(() => {
  const storageKey = "kidz-hospital-emergency-24-7-v1";

  try {
    if (window.localStorage.getItem(storageKey) === "dismissed") {
      return;
    }
  } catch (error) {
    // Storage may be unavailable in private/restricted browsing modes.
    // The announcement can still be displayed and dismissed normally.
  }

  const openAnnouncement = () => {
    if (!document.body || document.querySelector(".kh-emergency-overlay")) {
      return;
    }

    const lastFocusedElement = document.activeElement;
    const overlay = document.createElement("div");
    overlay.className = "kh-emergency-overlay";
    overlay.innerHTML = `
      <section class="kh-emergency-dialog" role="dialog" aria-modal="true"
        aria-labelledby="kh-emergency-title" aria-describedby="kh-emergency-description">
        <button class="kh-emergency-close" type="button" aria-label="Close announcement" data-close-emergency>
          <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M5 5l14 14M19 5L5 19"></path>
          </svg>
        </button>
        <div class="kh-emergency-visual" aria-hidden="true">
          <span class="kh-emergency-visual__circle kh-emergency-visual__circle--one"></span>
          <span class="kh-emergency-visual__circle kh-emergency-visual__circle--two"></span>
          <div class="kh-emergency-visual__symbol">
            <svg viewBox="0 0 60 60" fill="none" stroke="currentColor" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M30 11v38M11 30h38"></path>
            </svg>
          </div>
          <span class="kh-emergency-visual__clock">24<span>/</span>7</span>
          <span class="kh-emergency-visual__caption">Children's emergency</span>
        </div>
        <div class="kh-emergency-content">
          <span class="kh-emergency-kicker"><span aria-hidden="true"></span> Important announcement</span>
          <h2 id="kh-emergency-title">We're here for you <em>24/7</em></h2>
          <p id="kh-emergency-description">Kidz Hospital is now open <strong>24 hours a day, 7 days a week</strong> for children's emergencies. Our emergency department is available day and night.</p>
          <div class="kh-emergency-contact">
            <span class="kh-emergency-contact__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 3h4l2 5-2.5 2c1.1 2.3 2.9 4.1 5.2 5.2l2-2.5 5 2v4c0 1.1-.9 2-2 2C11 21 3 13 3 5c0-1.1.9-2 2-2h1z"></path>
              </svg>
            </span>
            <div>
              <small>Emergency helpline</small>
              <a href="tel:+923088091000" data-emergency-call>0308 809 1000</a>
            </div>
          </div>
          <div class="kh-emergency-actions">
            <a class="kh-emergency-call" href="tel:+923088091000" data-emergency-call>
              <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 3h4l2 5-2.5 2c1.1 2.3 2.9 4.1 5.2 5.2l2-2.5 5 2v4c0 1.1-.9 2-2 2C11 21 3 13 3 5c0-1.1.9-2 2-2h1z"></path>
              </svg>
              Call Emergency
            </a>
            <button class="kh-emergency-continue" type="button" data-close-emergency>Continue to website</button>
          </div>
          <p class="kh-emergency-footnote">Kidz Hospital · Nishtarabad, Peshawar</p>
        </div>
      </section>
    `;

    const rememberSeen = () => {
      try {
        window.localStorage.setItem(storageKey, "dismissed");
      } catch (error) {
        // The visitor can still close the announcement without storage.
      }
    };

    const close = () => {
      rememberSeen();
      document.removeEventListener("keydown", onKeyDown);
      document.body.classList.remove("kh-emergency-open");
      overlay.remove();
      if (lastFocusedElement instanceof HTMLElement && lastFocusedElement.isConnected) {
        lastFocusedElement.focus({ preventScroll: true });
      }
    };

    const getFocusables = () => Array.from(
      overlay.querySelectorAll('button:not([disabled]), a[href]')
    );

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      } else if (event.key === "Tab") {
        const focusables = getFocusables();
        if (!focusables.length) {
          event.preventDefault();
          return;
        }
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && (document.activeElement === first || !overlay.contains(document.activeElement))) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && (document.activeElement === last || !overlay.contains(document.activeElement))) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    overlay.querySelectorAll("[data-close-emergency]").forEach((button) => {
      button.addEventListener("click", close);
    });
    overlay.querySelectorAll("[data-emergency-call]").forEach((link) => {
      // Preserve the tel: link's normal browser action when calling.
      link.addEventListener("click", rememberSeen);
    });
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) close();
    });

    document.body.appendChild(overlay);
    document.body.classList.add("kh-emergency-open");
    document.addEventListener("keydown", onKeyDown);
    overlay.querySelector(".kh-emergency-close").focus({ preventScroll: true });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", openAnnouncement, { once: true });
  } else {
    openAnnouncement();
  }
})();
