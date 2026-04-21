let cur = 0;
const total = 3;

function goTo(n) {
  cur = n;
  const track = document.getElementById('track');
  const dots = document.querySelectorAll('.dot');
  if (track) track.style.transform = `translateX(-${cur * 100}%)`;
  dots.forEach((d, i) => d.classList.toggle('active', i === cur));
}

function slide(dir) {
  goTo((cur + dir + total) % total);
}

const track = document.getElementById('track');
if (track) {
  setInterval(() => slide(1), 5000);
}
