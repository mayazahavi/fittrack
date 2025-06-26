document.addEventListener("DOMContentLoaded", function () {
  const dropdown = document.querySelector(".dropdown");
  const toggle = dropdown.querySelector(".dropdown-toggle");

  toggle.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    dropdown.classList.toggle("active");
  });

  // סגירה בלחיצה מחוץ לתפריט
  document.addEventListener("click", function () {
    dropdown.classList.remove("active");
  });
});
