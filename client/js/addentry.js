document.getElementById('entryForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const meal = document.getElementById('meal').value;
  const workout = document.getElementById('workout').value;
  const date = document.getElementById('date').value;
  const time = document.getElementById('time').value;
  const error = document.getElementById('form-error');

  if (!meal || !workout || !date || !time) {
    error.textContent = "Please fill out all fields.";
    return;
  }

  error.textContent = "";
  alert("Entry submitted successfully!");
  this.reset();
});
const mealGroup = document.getElementById("meal-group");
const addMealBtn = document.getElementById("add-meal-btn");
let mealCount = 1;

addMealBtn.addEventListener("click", () => {
  const newLabel = document.createElement("label");
  newLabel.setAttribute("for", `meal-${mealCount}`);
  newLabel.textContent = `Meal #${mealCount + 1}`;

  const newSelect = document.createElement("select");
  newSelect.setAttribute("id", `meal-${mealCount}`);
  newSelect.setAttribute("name", "meal[]");
  newSelect.required = true;
  newSelect.innerHTML = `
    <option value="" disabled selected>Select a meal</option>
    <option value="grilled chicken">Grilled Chicken</option>
    <option value="salad">Green Salad</option>
    <option value="brown rice">Brown Rice</option>
    <option value="avocado toast">Avocado Toast</option>
    <option value="eggs">2 Eggs</option>
  `;

  mealGroup.appendChild(newLabel);
  mealGroup.appendChild(newSelect);
  mealCount++;
});
