export default class BookmarkPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async showReportsListMap() {
    this.#view.showMapLoading();
    try {
      await this.#view.initialMap();
    } catch (error) {
      console.error('showReportsListMap: error:', error);
    } finally {
      this.#view.hideMapLoading();
    }
  }

  async initialGalleryAndMap() {
    this.#view.showLoading();
    try {
      await this.showReportsListMap();

      const stories = await this.#model.getSemuaStories();

      if (!stories || stories.length === 0) {
        this.#view.populateReportsList('Tidak ada story tersimpan', []);
        return;
      }

      this.#view.populateReportsList('Daftar story tersimpan', stories);
    } catch (error) {
      console.error('initialGalleryAndMap: error:', error);
      this.#view.populateReportsListError(error.message);
    } finally {
      this.#view.hideLoading();
    }
  }
}
