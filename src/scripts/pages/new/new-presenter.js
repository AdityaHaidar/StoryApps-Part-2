export default class NewPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async showNewFormMap() {
    this.#view.showMapLoading();
    try {
      await this.#view.initialMap();
    } catch (error) {
      console.error('showNewFormMap: error:', error);
    } finally {
      this.#view.hideMapLoading();
    }
  }

  async postNewReport({ description, photoFile, lat, lon }) {
    this.#view.showSubmitLoadingButton();
    try {
      const response = await this.#model.uploadStory({ description, photoFile, lat, lon });

      if (!response.ok) {
        console.error('postNewReport: response:', response);
        this.#view.storeFailed(response.message);
        return;
      }

      this.#view.storeSuccessfully(response.message, response.data);

      await this.#sendPushNotification(description);
    } catch (error) {
      console.error('postNewReport: error:', error);
      this.#view.storeFailed(error.message);
    } finally {
      this.#view.hideSubmitLoadingButton();
    }
  }

  async #sendPushNotification(description) {
    try {
      const registration = await navigator.serviceWorker.ready;

      registration.showNotification('Story berhasil dibuat', {
        body: `Anda telah membuat story baru`,
        icon: '/public/images/logo.png',
        badge: '/badge.png',
      });
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }
}
