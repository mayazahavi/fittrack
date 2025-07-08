// הפעלת קרוסלת ההמלצות של Bootstrap בצורה אוטומטית
const testimonialCarousel = document.querySelector('#testimonials');

if (testimonialCarousel) {
  const carousel = new bootstrap.Carousel(testimonialCarousel, {
    interval: 2000,
    ride: 'carousel',
    pause: 'hover',
    wrap: true
  });
} 

// אפשרות להוספת אנימציות או פעולות בעת מעבר
// לדוגמה: שינוי אייקון, טיימר, אפקט מעבר בעתיד
