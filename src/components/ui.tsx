/**
 * Primitivos de UI compartilhados, alinhados aos design tokens do tema.
 */
import { Pressable, Text, TextProps, ViewStyle } from 'react-native';

import { colors, font, radius, spacing } from '@/theme';

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

interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost';
  disabled?: boolean;
  style?: ViewStyle;
}

export function AppButton({ label, onPress, variant = 'primary', disabled, style }: AppButtonProps) {
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          alignItems: 'center',
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
          borderRadius: radius.md,
          backgroundColor: isPrimary ? colors.primary : 'transparent',
          borderWidth: isPrimary ? 0 : 1,
          borderColor: colors.border,
          opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
        },
        style,
      ]}
    >
      <Text
        style={{
          color: isPrimary ? colors.primaryText : colors.text,
          fontSize: font.body,
          fontWeight: '700',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
