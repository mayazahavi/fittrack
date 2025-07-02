document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('traineeMessagesContainer');

    fetch('/api/coach/entries')
        .then(res => res.json())
        .then(entries => {
            container.innerHTML = '';

            if (entries.length === 0) {
                container.innerHTML = '<p>No trainee entries available.</p>';
                return;
            }

            entries.forEach(entry => {
                const article = document.createElement('article');
                article.innerHTML = `
                    <p><strong>Date:</strong> ${entry.date}</p>
                    <p><strong>Time:</strong> ${entry.time}</p>
                    <p><strong>Meals:</strong> ${entry.meals.join(', ')}</p>
                    <p><strong>Workout:</strong> ${entry.workout}</p>
                `;
                container.appendChild(article);
            });
        })
        .catch(err => {
            console.error('Error loading trainee entries:', err);
            container.innerHTML = '<p>Error loading trainee entries.</p>';
        });
});