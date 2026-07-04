/**
 * Roundtrip das preferências (AsyncStorage mockado).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import { getUserLocation, setUserLocation } from '@/storage/settings';

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('settings storage', () => {
  it('sem cadastro → string vazia', async () => {
    expect(await getUserLocation()).toBe('');
  });

  it('set → get roundtrip, aparando espaços', async () => {
    await setUserLocation('  Porto Alegre, RS  ');
    expect(await getUserLocation()).toBe('Porto Alegre, RS');
  });
});
