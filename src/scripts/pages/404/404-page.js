export default class NotFoundPage {
  async render() {
    return `
      <section class="not-found">
        <div class="not-found__container">
          <!-- Animated 404 Number -->
          <div class="not-found__number">
            <span class="not-found__digit not-found__digit--1">4</span>
            <span class="not-found__digit not-found__digit--0">0</span>
            <span class="not-found__digit not-found__digit--2">4</span>
          </div>
          
          <!-- Floating Elements -->
          <div class="not-found__floating-elements">
            <div class="floating-element floating-element--1"></div>
            <div class="floating-element floating-element--2"></div>
            <div class="floating-element floating-element--3"></div>
            <div class="floating-element floating-element--4"></div>
            <div class="floating-element floating-element--5"></div>
          </div>
          
          <!-- Main Content -->
          <div class="not-found__content">
            <h2 class="not-found__title">Oops! Halaman Tidak Ditemukan</h2>
            
            <!-- Action Buttons -->
            <div class="not-found__actions">
              <button class="not-found__btn not-found__btn--primary" onclick="window.history.back()">
                <i class="fas fa-arrow-left"></i>
                Kembali
              </button>
              <button class="not-found__btn not-found__btn--secondary" onclick="window.location.href = '/'">
                <i class="fas fa-home"></i>
                Ke Beranda
              </button>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.initializeInteractions();
    this.startAnimations();
  }

  initializeInteractions() {
    // Add click interactions to floating elements
    const floatingElements = document.querySelectorAll('.floating-element');
    floatingElements.forEach(element => {
      element.addEventListener('click', () => {
        element.style.animation = 'bounce 0.6s ease-in-out';
        setTimeout(() => {
          element.style.animation = '';
        }, 600);
      });
    });
  }

  startAnimations() {
    // Add entrance animations
    setTimeout(() => {
      document.querySelector('.not-found__number')?.classList.add('animate-in');
    }, 200);

    setTimeout(() => {
      document.querySelector('.not-found__content')?.classList.add('animate-in');
    }, 600);
  }
}