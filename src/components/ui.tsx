/**
 * Primitivos de UI compartilhados, alinhados aos design tokens do tema.
 */
import { Text, TextProps } from 'react-native';

import { colors, font } from '@/theme';

export function Title({ style, ...props }: TextProps) {
  return (
    <Text
      {...props}
      style={[{ color: colors.text, fontSize: font.title, fontWeight: '700' }, style]}
    />
  );
}

export function Subtitle({ style, ...props }: TextProps) {
  return (
    <Text
      {...props}
      style={[{ color: colors.text, fontSize: font.subtitle, fontWeight: '600' }, style]}
    />
  );
}

export function Body({ style, ...props }: TextProps) {
  return <Text {...props} style={[{ color: colors.text, fontSize: font.body }, style]} />;
}

export function Muted({ style, ...props }: TextProps) {
  return <Text {...props} style={[{ color: colors.textMuted, fontSize: font.small }, style]} />;
}
