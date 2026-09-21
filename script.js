const revealElements = document.querySelectorAll("[data-r]");
const serviceCards = document.querySelectorAll(".service-card");

if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("v");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  revealElements.forEach((element) => io.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("v"));
}

serviceCards.forEach((card) => {
  card.addEventListener("click", () => {
    const isFlipped = card.classList.toggle("is-flipped");
    card.setAttribute("aria-pressed", String(isFlipped));
  });
});
