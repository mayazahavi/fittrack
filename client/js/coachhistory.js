document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('feedbackTableBody');

    async function loadFeedbacks() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Please login to view feedback history.</td></tr>';
                return;
            }
    console.log("🔍 Sending request to /api/coach/feedback...");

            // בקשת הפידבקים מהשרת עם טוקן
            const res = await fetch('/api/coach/feedback', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) {
                throw new Error(`Error fetching feedback: ${res.statusText}`);
            }

            const feedbacks = await res.json();

            if (feedbacks.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No feedback history available.</td></tr>';
                return;
            }

            tableBody.innerHTML = '';

            feedbacks.forEach(fb => {
                const dateObj = new Date(fb.datetime);
                const dateStr = dateObj.toLocaleDateString();
                const timeStr = dateObj.toLocaleTimeString();

                // הנחה: fb.trainee הוא אובייקט עם username (אם לא, צריך להוסיף populate בשרת)
                const traineeName = fb.trainee?.username || fb.trainee || 'Unknown';

                // טקסט הפידבק, עם שלושת השדות
                const tipsText = 
                    `Nutrition: ${fb.tips?.nutrition || "No feedback"}\n` +
                    `Exercise: ${fb.tips?.exercise || "No feedback"}\n` +
                    `General: ${fb.tips?.general || "No feedback"}`;

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${traineeName}</td>
                    <td>${dateStr}</td>
                    <td>${timeStr}</td>
                    <td><pre>${tipsText}</pre></td>
                    <td>
                        <!-- אפשר להוסיף כפתורי עריכה ומחיקה בעתיד -->
                    </td>
                `;

                tableBody.appendChild(row);
            });

        } catch (err) {
            console.error('Error loading feedback history:', err);
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Error loading feedback history.</td></tr>';
        }
    }

    // טעינה ראשונית של הפידבקים
    loadFeedbacks();

    // מחיקה ועריכה - אם תרצה להוסיף אותם, תוכל להוסיף כאן את הלוגיקה
});
