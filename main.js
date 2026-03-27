// Contact form handler
function handleSubmit(e) {
  e.preventDefault();
  const msg = document.getElementById("success-msg");
  if (msg) {
    msg.style.display = "block";
    e.target.reset();
  }
}

// Blog filters
document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const filter = btn.dataset.filter;
    document.querySelectorAll(".blog-card-full").forEach(card => {
      const match = filter === "all" || card.dataset.tag === filter;
      card.classList.toggle("hidden", !match);
    });
  });
});

// Highlight active nav link based on current page
document.querySelectorAll("nav a").forEach(link => {
  if (link.href === window.location.href) {
    link.classList.add("active");
  } else {
    link.classList.remove("active");
  }
});

// Fade-in animation on scroll
const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  },
  { threshold: 0.1 }
);

document.querySelectorAll(".card, .text-block, .team-card").forEach(el => {
  el.style.opacity = "0";
  el.style.transform = "translateY(20px)";
  el.style.transition = "opacity 0.4s ease, transform 0.4s ease";
  observer.observe(el);
});
