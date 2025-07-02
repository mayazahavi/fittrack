document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('feedbackTableBody');

    function loadFeedbacks() {
        fetch('/api/coach/feedbacks')
            .then(res => res.json())
            .then(feedbacks => {
                tableBody.innerHTML = '';

                if (feedbacks.length === 0) {
                    tableBody.innerHTML = '<tr><td colspan="4">No feedback history available.</td></tr>';
                    return;
                }

                feedbacks.forEach(feedback => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${feedback.date}</td>
                        <td>${feedback.time}</td>
                        <td>${feedback.feedback}</td>
                        <td>
                            <button class="edit-btn" data-id="${feedback._id}">Edit</button>
                            <button class="delete-btn" data-id="${feedback._id}">Delete</button>
                        </td>
                    `;
                    tableBody.appendChild(row);
                });
            })
            .catch(err => {
                console.error('Error loading feedback history:', err);
                tableBody.innerHTML = '<tr><td colspan="4">Error loading feedback history.</td></tr>';
            });
    }

    // Load on start
    loadFeedbacks();

    // Delete feedback
    document.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const id = e.target.dataset.id;
            if (confirm('Are you sure you want to delete this feedback?')) {
                try {
                    const res = await fetch(`/api/coach/feedbacks/${id}`, {
                        method: 'DELETE'
                    });
                    if (res.ok) {
                        loadFeedbacks();
                    } else {
                        alert('Failed to delete feedback.');
                    }
                } catch (err) {
                    console.error('Error deleting feedback:', err);
                }
            }
        }

        // Edit feedback
        if (e.target.classList.contains('edit-btn')) {
            const id = e.target.dataset.id;
            const newFeedback = prompt('Enter the updated feedback:');
            if (newFeedback) {
                try {
                    const res = await fetch(`/api/coach/feedbacks/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ feedback: newFeedback })
                    });
                    if (res.ok) {
                        loadFeedbacks();
                    } else {
                        alert('Failed to update feedback.');
                    }
                } catch (err) {
                    console.error('Error updating feedback:', err);
                }
            }
        }
    });
});