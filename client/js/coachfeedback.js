// coachfeedback.js (extended to display trainee's latest entry)

document.addEventListener('DOMContentLoaded', () => {
    const traineeSelect = document.getElementById('trainee-select');
    const sendFeedbackBtn = document.getElementById('send-feedback-btn');
    const predefinedFeedback = document.getElementById('predefined-feedback');
    const customFeedback = document.getElementById('custom-feedback');
    const feedbackDate = document.getElementById('feedback-date');
    const feedbackTime = document.getElementById('feedback-time');
    const traineeMessagesContainer = document.createElement('div');
    traineeMessagesContainer.id = 'traineeMessagesContainer';
    traineeMessagesContainer.className = 'trainee-message-box';
    traineeSelect.parentNode.insertBefore(traineeMessagesContainer, traineeSelect.nextSibling);

    fetch('trainees.json')
        .then(response => response.json())
        .then(data => {
            traineeSelect.innerHTML = '<option value="">-- Select Trainee --</option>';
            data.forEach(trainee => {
                const option = document.createElement('option');
                option.value = trainee.name;
                option.textContent = trainee.name;
                traineeSelect.appendChild(option);
            });
        });

    traineeSelect.addEventListener('change', () => {
        const traineeName = traineeSelect.value;
        traineeMessagesContainer.innerHTML = '';
        if (!traineeName) return;

        fetch(`/api/entries/latest?trainee=${encodeURIComponent(traineeName)}`)
            .then(res => res.json())
            .then(entry => {
                if (!entry) {
                    traineeMessagesContainer.innerHTML = '<p>No recent entry from this trainee.</p>';
                    return;
                }
                const mealsList = entry.meals && entry.meals.length ? `<ul>${entry.meals.map(m => `<li>${m.name}</li>`).join('')}</ul>` : '<p>No meals recorded.</p>';
                traineeMessagesContainer.innerHTML = `
                    <h4>Latest Entry from ${traineeName}</h4>
                    <p><strong>Date:</strong> ${entry.date}</p>
                    <p><strong>Time:</strong> ${entry.time}</p>
                    <p><strong>Meals:</strong></p> ${mealsList}
                    <p><strong>Workout:</strong> ${entry.workout}</p>
                `;
            })
            .catch(err => {
                console.error('Error fetching latest entry:', err);
                traineeMessagesContainer.innerHTML = '<p>Error loading latest entry.</p>';
            });
    });

    sendFeedbackBtn.addEventListener('click', () => {
        const trainee = traineeSelect.value;
        const date = feedbackDate.value;
        const time = feedbackTime.value;
        const predefined = predefinedFeedback.value;
        const custom = customFeedback.value.trim();

        if (!trainee) {
            alert('Please select a trainee.');
            return;
        }
        if (!date) {
            alert('Please select a date.');
            return;
        }
        if (!time) {
            alert('Please select a time.');
            return;
        }

        let feedbackText = predefined || custom;
        if (!feedbackText) {
            alert('Please select or write feedback.');
            return;
        }

        alert(`Feedback sent to ${trainee} on ${date} at ${time}:\n${feedbackText}`);

        predefinedFeedback.value = '';
        customFeedback.value = '';
        feedbackDate.value = '';
        feedbackTime.value = '';
        traineeSelect.value = '';
        traineeMessagesContainer.innerHTML = '';
    });
});