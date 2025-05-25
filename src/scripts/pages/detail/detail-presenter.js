import { storyMapper } from '../../data/api-mapper';

export default class StoryDetailPresenter {
  constructor(storyId, dependencies) {
    this._currentStoryId = storyId;
    this._viewHandler = dependencies.view;
    this._apiService = dependencies.model;
    this._localDatabase = dependencies.dbmodel;
  }

  async showStoryDetail() {
    const viewHandler = this._viewHandler;
    const apiService = this._apiService;
    const currentStoryId = this._currentStoryId;

    viewHandler.showStoryDetailLoading();
    
    try {
      const apiResponse = await apiService.getStoryById(currentStoryId);

      if (!apiResponse.ok) {
        console.error('showStoryDetail: response:', apiResponse);
        viewHandler.storyDetailError(apiResponse.message);
        return;
      }
      
      const mappedStory = await storyMapper(apiResponse.story);
      viewHandler.storyDetailAndInitialMap(apiResponse.message, mappedStory);
    } catch (err) {
      console.error('showStoryDetail: error:', err);
      viewHandler.storyDetailError(err.message);
    }
  }

  async showStoryDetailMap() {
    const viewHandler = this._viewHandler;
    
    viewHandler.showMapLoading();
    
    try {
      await viewHandler.initialMap();
    } catch (err) {
      console.error('showStoryDetailMap: error', err);
    } finally {
      viewHandler.hideMapLoading();
    }
  }

  async saveStory() {
    const apiService = this._apiService;
    const localDatabase = this._localDatabase;
    const viewHandler = this._viewHandler;
    const currentStoryId = this._currentStoryId;

    try {
      const fetchedStoryResponse = await apiService.getStoryById(currentStoryId);
      console.log('storyResponse', fetchedStoryResponse);

      if (!fetchedStoryResponse.ok) {
        throw new Error('gagal mengambil data cerita');
      }

      const storyData = fetchedStoryResponse.story;
      if (!storyData || typeof storyData !== 'object' || !('id' in storyData)) {
        throw new Error('data cerita tidak valid');
      }
      
      await localDatabase.putStory(storyData);
      viewHandler.saveToBookmarkSuccessfully('Berhasil menyimpan cerita');
    } catch (err) {
      console.error('saveStory: error', err);
      viewHandler.saveToBookmarkFailed(err.message);
    }
  }

  async removeStory() {
    const localDatabase = this._localDatabase;
    const viewHandler = this._viewHandler;
    const currentStoryId = this._currentStoryId;

    try {
      await localDatabase.removeStory(currentStoryId);
      viewHandler.removeFromBookmarkSuccessfully('berhasil menghapus cerita');
    } catch (err) {
      console.error('removeStory: error', err);
      viewHandler.removeFromBookmarkFailed(err.message);
    }
  }

  async showSaveButton() {
    const isSaved = await this._checkIfStorySaved();
    const viewHandler = this._viewHandler;
    
    if (isSaved) {
      viewHandler.renderRemoveButton();
      return;
    }
    
    viewHandler.renderSaveButton();
  }

  async _checkIfStorySaved() {
    const localDatabase = this._localDatabase;
    const currentStoryId = this._currentStoryId;
    const savedStory = await localDatabase.getStoryById(currentStoryId);
    
    return !!savedStory;
  }
}