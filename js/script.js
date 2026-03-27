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
    if (endpoint.includes("your-form-id")) {
      showStatus(
        "warning",
        "Formspree is still using the placeholder endpoint. Replace it with the live endpoint for contact@kidzhospital.org to receive appointment inquiries.",
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
        let message = "Unable to send the appointment request right now.";
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
        "Appointment request sent. The Kidz Hospital team will contact you to confirm the visit.",
      );
    } catch (error) {
      showStatus(
        "error",
        error instanceof Error
          ? error.message
          : "Unable to send the appointment request right now.",
      );
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  });
}
