/**
 * Preferências simples do usuário (chave/valor no AsyncStorage).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCATION_KEY = 'stormshield/settings/userLocation';

/** Região cadastrada (CEP, bairro/cidade ou cidade/UF). Vazio = não cadastrada. */
export async function getUserLocation(): Promise<string> {
  return (await AsyncStorage.getItem(LOCATION_KEY)) ?? '';
}

export async function setUserLocation(location: string): Promise<void> {
  await AsyncStorage.setItem(LOCATION_KEY, location.trim());
}
