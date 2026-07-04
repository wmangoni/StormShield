/**
 * Confirmação async multiplataforma: Alert nativo no iOS/Android,
 * window.confirm na web (Alert.alert com botões não funciona na web).
 */
import { Alert, Platform } from 'react-native';

export function confirmAsync(title: string, message: string): Promise<boolean> {
  if (Platform.OS === 'web') {
    const confirm = (globalThis as { confirm?: (msg: string) => boolean }).confirm;
    return Promise.resolve(confirm ? confirm(`${title}\n\n${message}`) : false);
  }
  return new Promise((resolve) => {
    Alert.alert(
      title,
      message,
      [
        { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
        { text: 'Remover', style: 'destructive', onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}
