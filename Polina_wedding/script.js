const envelope = document.querySelector("[data-open-envelope]");
const invitation = document.querySelector(".invitation");

const revealItems = document.querySelectorAll(".reveal");
const countdown = document.querySelector("[data-countdown]");

const form = document.querySelector(".rsvp-form");
const otherDrink = document.querySelector("[data-other-drink]");
const otherDrinkField = document.querySelector("#other-drink-field");

const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

window.scrollTo(0, 0);


/* =========================================================
   PREPARE MOTION
   ========================================================= */

function prepareMotion() {
  document.querySelectorAll(".reveal").forEach((section) => {
    const selectors = [
      ".script-title",
      ".script-subtitle",

      ".cover-lead",
      ".cover-photo-wrap",
      ".cover-name",
      ".cover-amp",

      ".date-line span",
      ".date-line strong",
      ".gathering",
      ".location-copy",
      ".venue",
      ".outline-button",

      ".program-title",
      ".program-item",
      ".program-image-item",
      ".program-forest",

      ".dress-intro",
      ".dress-column",
      ".palette",
      ".outfit-outline",
      ".looks img",
      ".inspiration",

      ".gift-first",
      ".gift-details",
      ".gift-books",
      ".gift-wine",

      ".rsvp-intro",
      ".rsvp-deadline",
      ".question",
      ".submit-button",

      ".contacts > img",
      ".contacts-content > *",

      ".countdown-overlay > *",

      ".ending > *"
    ];

    section
      .querySelectorAll(selectors.join(","))
      .forEach((element, index) => {
        if (element.classList.contains("motion-item")) {
          return;
        }

        element.classList.add("motion-item");

        element.style.setProperty(
          "--delay",
          `${Math.min(index * 70, 560)}ms`
        );
      });
  });

  const cover = document.querySelector(".cover");

  if (cover) {
    cover
      .querySelectorAll(
        ".crest, .cover-lead, .cover-photo-wrap, .cover-name, .cover-amp"
      )
      .forEach((element, index) => {
        element.classList.add("cover-motion");

        element.style.setProperty(
          "--delay",
          `${index * 100}ms`
        );
      });
  }
}

prepareMotion();


/* =========================================================
   ENVELOPE
   ========================================================= */

envelope?.addEventListener("click", () => {
  if (!invitation) return;

  if (
    invitation.classList.contains("is-opening") ||
    invitation.classList.contains("is-open")
  ) {
    return;
  }

  invitation.classList.add("is-opening");

  // Быстрый переход: конверт исчезает, первая страница появляется сразу.
  window.setTimeout(
    () => {
      invitation.classList.remove("is-opening");
      invitation.classList.add("is-open");

      document
        .querySelector(".cover")
        ?.classList.add("cover-entered");

      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto"
      });
    },
    reduceMotion ? 0 : 560
  );
});


/* =========================================================
   OTHER DRINK
   ========================================================= */

function toggleOtherDrinkField() {
  if (!otherDrink || !otherDrinkField) {
    return;
  }

  const input =
    otherDrinkField.querySelector("input");

  const visible = otherDrink.checked;

  otherDrinkField.hidden = !visible;

  otherDrink.setAttribute(
    "aria-expanded",
    String(visible)
  );

  if (input) {
    input.required = visible;

    if (!visible) {
      input.value = "";
    }
  }
}

otherDrink?.addEventListener(
  "change",
  toggleOtherDrinkField
);

toggleOtherDrinkField();


/* =========================================================
   SECTION REVEAL
   ========================================================= */

const revealObserver =
  new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add(
          "is-visible"
        );

        revealObserver.unobserve(
          entry.target
        );
      });
    },
    {
      rootMargin:
        "0px 0px -8% 0px",

      threshold: 0.04
    }
  );

revealItems.forEach((element) => {
  revealObserver.observe(element);
});


/* =========================================================
   PARALLAX
   ========================================================= */

const parallaxElements =
  document.querySelectorAll(
    ".program-forest, .gift-books, .gift-wine"
  );

let parallaxFrame = false;

function updateParallax() {
  parallaxFrame = false;

  if (reduceMotion) {
    return;
  }

  const viewportHeight =
    window.innerHeight;

  parallaxElements.forEach(
    (element) => {
      const rect =
        element.getBoundingClientRect();

      if (
        rect.bottom < 0 ||
        rect.top > viewportHeight
      ) {
        return;
      }

      const center =
        rect.top +
        rect.height / 2;

      const distance =
        center -
        viewportHeight / 2;

      const shift =
        distance * -0.025;

      element.style.setProperty(
        "--parallax-y",
        `${shift.toFixed(1)}px`
      );
    }
  );
}

window.addEventListener(
  "scroll",
  () => {
    if (parallaxFrame) {
      return;
    }

    parallaxFrame = true;

    requestAnimationFrame(
      updateParallax
    );
  },
  {
    passive: true
  }
);

updateParallax();


/* =========================================================
   COUNTDOWN
   ========================================================= */

function pluralRu(value, words) {
  const last10 = value % 10;
  const last100 = value % 100;

  if (
    last10 === 1 &&
    last100 !== 11
  ) {
    return words[0];
  }

  if (
    last10 >= 2 &&
    last10 <= 4 &&
    (last100 < 12 ||
      last100 > 14)
  ) {
    return words[1];
  }

  return words[2];
}


function updateCountdown() {
  if (!countdown) {
    return;
  }

  const target = new Date(
    countdown.dataset.countdown
  ).getTime();

  const difference = Math.max(
    0,
    target - Date.now()
  );

  const totalSeconds = Math.floor(
    difference / 1000
  );

  const days = Math.floor(
    totalSeconds / 86400
  );

  const hours = Math.floor(
    (totalSeconds % 86400) / 3600
  );

  const minutes = Math.floor(
    (totalSeconds % 3600) / 60
  );

  const seconds = totalSeconds % 60;

  const values = [
    {
      selector: "days",
      value: days,
      label: pluralRu(days, ["день", "дня", "дней"]),
      length: 1
    },
    {
      selector: "hours",
      value: hours,
      label: pluralRu(hours, ["час", "часа", "часов"]),
      length: 2
    },
    {
      selector: "minutes",
      value: minutes,
      label: pluralRu(minutes, ["минута", "минуты", "минут"]),
      length: 2
    },
    {
      selector: "seconds",
      value: seconds,
      label: pluralRu(seconds, ["секунда", "секунды", "секунд"]),
      length: 2
    }
  ];

  values.forEach(({ selector, value, label, length }) => {
    const number = countdown.querySelector(
      `[data-${selector}]`
    );

    if (!number) {
      return;
    }

    const labelNode = number.nextElementSibling;
    const nextValue = String(value).padStart(length, "0");

    if (number.textContent !== nextValue) {
      number.classList.remove("countdown-tick");
      void number.offsetWidth;
      number.classList.add("countdown-tick");
    }

    number.textContent = nextValue;

    if (labelNode) {
      labelNode.textContent = label;
    }
  });
}



updateCountdown();

setInterval(
  updateCountdown,
  1000
);


/* =========================================================
   RSVP
   ========================================================= */

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxwZu7ylMd0WqpffjXru1TuwOLsJK9BB_BEjnJOv3p3L01uAzSy4ObD00k_X6D_NVonCw/exec";

async function submitRsvp(formData) {
  const drinks = formData.getAll("drinks");

  const payload = {
    name: formData.get("name") || "",
    attendance: formData.get("attendance") || "",
    family: formData.get("family") || "",
    drinks: drinks,
    otherDrink: formData.get("otherDrink") || "",
    song: formData.get("song") || ""
  };

  const response = await fetch(GOOGLE_SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    redirect: "follow"
  });

  // Apps Script часто отвечает редиректом — считаем успехом, если сеть не упала
  if (!response.ok && response.type !== "opaque") {
    throw new Error("Ошибка отправки");
  }

  return { ok: true };
}


form?.addEventListener(
  "submit",
  async (event) => {
    event.preventDefault();

    const message =
      form.querySelector(
        ".form-message"
      );

    const submit =
      form.querySelector(
        ".submit-button"
      );

    if (message) {
      message.textContent = "";

      message.classList.remove(
        "error"
      );
    }

    if (!form.checkValidity()) {
      form.reportValidity();

      if (message) {
        message.textContent =
          "Пожалуйста, заполните обязательные поля.";

        message.classList.add(
          "error"
        );
      }

      return;
    }

    if (submit) {
      submit.disabled = true;
      submit.textContent =
        "Отправляем...";
    }

    try {
      await submitRsvp(
        new FormData(form)
      );

      form.reset();

      toggleOtherDrinkField();

      if (message) {
        message.textContent =
          "Спасибо! Ваш ответ сохранён.";
      }
    } catch (error) {
      if (message) {
        message.textContent =
          "Не удалось отправить ответ. Попробуйте ещё раз.";

        message.classList.add(
          "error"
        );
      }
    } finally {
      if (submit) {
        submit.disabled = false;
        submit.textContent =
          "Отправить";
      }
    }
  }
);