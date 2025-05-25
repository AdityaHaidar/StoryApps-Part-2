import HomePresenter from './home-presenter';
import * as StoryApi from '../../data/api';
import Map from '../../utils/map';

export default class HomePage {
  #presenter = null;
  #map = null;

  async render() {
    return `
    <a href="#main-content" class="skip-to-content">Lewati ke Konten Utama</a>

    <section>
      <div class="reports-list__map__container">
        <div id="map" class="reports-list__map"></div>
        <div id="map-loading-container"></div>
      </div>
    </section>
    
    <section id="main-content" class="container">
      <h1 class="section-title">Daftar Story</h1>
      
      <div class="reports-list__container">
        <div id="reports-list"></div>
        <div id="reports-list-loading-container"></div>
      </div>
    </section>
    `;
  }

  async afterRender() {
    this.#presenter = new HomePresenter({
      view: this,
      model: StoryApi,
    });

    await this.#presenter.initialGalleryAndMap();
  }

  async initialMap() {
    this.#map = await Map.build('#map', {
      zoom: 10,
      locate: true,
    });
  }

  populateReportsList(message, stories) {
    const container = document.getElementById('reports-list');

    if (!stories || stories.length <= 0) {
      container.innerHTML = `
      <div id="reports-list-empty" class="reports-list__empty">
      <h2>Tidak ada daftar story tersedia</h2>
      <p>Saat ini, story apapun untuk ditampilkan.</p>
      </div>
      `;
      return;
    }

    const html = stories
      .map((story) => {
        const photo = story.photoUrl ?? 'images/placeholder-image.jpg';
        const name = story.name ?? 'Anonim';
        const title = `Story oleh ${name}`;
        const description = story.description ?? '-';
        const createdAt = new Date(story.createdAt).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
        const lat = story.lat ?? 'Tidak tersedia';
        const lon = story.lon ?? 'Tidak tersedia';

        return `
      <div tabindex="0" class="report-item" data-reportid="${story.id}">
        <img class="report-item__image" src="${photo}" alt="${title}">
        <div class="report-item__body">
          <div class="report-item__main">
            <h2 class="report-item__title">${title}</h2>
            <div class="report-item__more-info">
              <div class="report-item__createdat">
                <i class="fas fa-calendar-alt"></i> ${createdAt}
              </div>
              <div class="report-item__location">
                <i class="fas fa-map"></i> ${lat}, ${lon}
              </div>
            </div>
          </div>
          <div class="report-item__description">${description}</div>
          <div class="report-item__author">Diposting oleh: ${name}</div>
        </div>
          <a class="btn report-item__read-more" href="#/story/${story.id}">
            Selengkapnya <i class="fas fa-arrow-right"></i>
          </a>
      </div>
    `;
      })
      .join('');

    container.innerHTML = `<div class="reports-list">${html}</div>`;

    if (this.#map) {
      stories.forEach((story) => {
        if (typeof story.lat === 'number' && typeof story.lon === 'number') {
          const popupContent = `
            <strong>${story.name ?? 'Anonim'}</strong><br>
            ${story.description ?? '-'}
          `;
          this.#map.addMarker([story.lat, story.lon], {}, { content: popupContent });
        }
      });
    }
  }

  populateReportsListError(message) {
    document.getElementById('reports-list').innerHTML = `
      <div id="reports-list-error" class="reports-list__error">
        <h2>Terjadi kesalahan pengambilan daftar laporan</h2>
        <p>${message || 'Gunakan jaringan lain atau laporkan error ini.'}</p>
      </div>
    `;
  }

  showMapLoading() {
    document.getElementById('map-loading-container').innerHTML = `
      <div class="loader loader-absolute"></div>
    `;
  }

  hideMapLoading() {
    document.getElementById('map-loading-container').innerHTML = '';
  }

  showLoading() {
    document.getElementById('reports-list-loading-container').innerHTML = `
      <div class="loader loader-absolute"></div>
    `;
  }

  hideLoading() {
    document.getElementById('reports-list-loading-container').innerHTML = '';
  }
}
