import Store from 'electron-store';

interface StoreSchema {
  geminiApiKey: string;
}

const store = new Store<StoreSchema>({
  defaults: {
    geminiApiKey: '',
  },
});

export const getApiKey = (): string => {
  return store.get('geminiApiKey');
};

export const saveApiKey = (key: string): void => {
  store.set('geminiApiKey', key);
};
