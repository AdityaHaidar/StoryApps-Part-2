export default class LoginPresenter {
  // Private fields
  #view;
  #model;
  #authModel;

  constructor({ view, model, authModel }) {
    this.#view = view;
    this.#model = model;
    this.#authModel = authModel;
  }

  async getLogin({ email, password }) {
    // Show loading state
    this.#view.showSubmitLoadingButton();

    try {
      // Attempt login request
      const response = await this.#model.getLogin({ email, password });

      // Handle error response
      if (!response.ok) {
        console.error('getLogin: response:', response);
        this.#view.loginFailed(response.message);
        return;
      }

      // Extract and store token
      const token = response.loginResult.token;
      this.#authModel.putAccessToken(token);

      // Update view on success
      this.#view.loginSuccessfully(response.message);
    } catch (error) {
      // Handle exceptions
      console.error('getLogin: error:', error);
      this.#view.loginFailed(error.message);
    } finally {
      // Reset loading state
      this.#view.hideSubmitLoadingButton();
    }
  }
}
