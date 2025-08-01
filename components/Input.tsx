import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { BORDER_RADIUS, COLORS, SPACING, TYPOGRAPHY } from '../constants';
import { InputProps } from '../types';

export const Input: React.FC<InputProps> = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoCorrect = false,
  icon,
  error,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleSecureTextEntry = () => {
    if (secureTextEntry) {
      return showPassword ? false : true;
    }
    return secureTextEntry;
  };

  const getContainerStyle = () => {
    return {
      ...styles.container,
      borderColor: error ? COLORS.ERROR : isFocused ? COLORS.PRIMARY : COLORS.BORDER_GRAY,
    };
  };

  return (
    <View style={styles.wrapper}>
      <View style={getContainerStyle()}>
        {icon && (
          <Ionicons 
            name={icon as any} 
            size={20} 
            color={COLORS.PRIMARY} 
            style={styles.icon} 
          />
        )}
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.PLACEHOLDER_GRAY}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={handleSecureTextEntry()}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons 
              name={showPassword ? "eye-outline" : "eye-off-outline"} 
              size={20} 
              color={COLORS.PRIMARY} 
            />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: SPACING.MD,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.LG,
    paddingHorizontal: SPACING.MD,
    backgroundColor: COLORS.LIGHT_GRAY,
    height: 56,
  },
  icon: {
    marginRight: SPACING.MD,
  },
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.BLACK,
  },
  eyeIcon: {
    padding: SPACING.SM,
  },
  errorText: {
    color: COLORS.ERROR,
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    marginTop: SPACING.XS,
    marginLeft: SPACING.SM,
  },
}); 