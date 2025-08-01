import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    ViewStyle,
} from 'react-native';
import { BORDER_RADIUS, COLORS, SHADOWS, SPACING, TYPOGRAPHY } from '../constants';
import { ButtonProps } from '../types';

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'medium',
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: BORDER_RADIUS.LG,
      justifyContent: 'center',
      alignItems: 'center',
      ...SHADOWS.MD,
    };

    const sizeStyles: Record<string, ViewStyle> = {
      small: { height: 40, paddingHorizontal: SPACING.MD },
      medium: { height: 56, paddingHorizontal: SPACING.LG },
      large: { height: 64, paddingHorizontal: SPACING.XL },
    };

    const variantStyles: Record<string, ViewStyle> = {
      primary: {
        backgroundColor: COLORS.PRIMARY,
      },
      secondary: {
        backgroundColor: COLORS.SECONDARY,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: COLORS.PRIMARY,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      opacity: disabled ? 0.6 : 1,
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD,
      textAlign: 'center',
    };

    const sizeStyles: Record<string, TextStyle> = {
      small: { fontSize: TYPOGRAPHY.FONT_SIZES.SM },
      medium: { fontSize: TYPOGRAPHY.FONT_SIZES.BASE },
      large: { fontSize: TYPOGRAPHY.FONT_SIZES.LG },
    };

    const variantStyles: Record<string, TextStyle> = {
      primary: { color: COLORS.WHITE },
      secondary: { color: COLORS.WHITE },
      outline: { color: COLORS.PRIMARY },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'outline' ? COLORS.PRIMARY : COLORS.WHITE} 
          size="small" 
        />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Styles are applied dynamically above
}); 